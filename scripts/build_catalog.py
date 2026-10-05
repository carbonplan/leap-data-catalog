# /// script
# requires-python = ">=3.11"
# dependencies = ["rustac", "pyyaml", "httpx", "obstore"]
# ///
"""Build the LEAP stac-geoparquet catalog: catalog/datasets.yaml + dynamical.org STAC.

One STAC Item per dataset. Assets: `data` (full-res store) and optional `viz` (pyramid).
Each asset carries an https `href` for the browser plus `s3_href`/`endpoint`/`region` for Python.

Usage:
    uv run scripts/build_catalog.py --out catalog.parquet
    uv run scripts/build_catalog.py --out catalog.parquet --upload   # needs OSN write creds in
        AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY
"""

from __future__ import annotations

import argparse
import asyncio
from pathlib import Path

import httpx
import rustac
import yaml

ROOT = Path(__file__).resolve().parents[1]
OSN = "https://nyu1.osn.mghpcc.org"
DYNAMICAL_STAC = "https://stac.dynamical.org/catalog.json"
UPLOAD_BUCKET, UPLOAD_KEY = "leap-pangeo-pipeline", "catalog/catalog.parquet"
MEDIA = {
    "zarr": "application/vnd+zarr",
    "icechunk": "application/x-icechunk",
    "netcdf": "application/netcdf",
    "csv": "text/csv",
    "parquet": "application/vnd.apache.parquet",
}
# Region of non-OSN s3 buckets referenced by the catalog.
S3_REGIONS = {"carbonplan-data-viewer": "us-west-2"}
GLOBAL = [-180.0, -90.0, 180.0, 90.0]


def asset(href: str, fmt: str, role: str) -> dict:
    """STAC asset for an s3://, gs:// or https:// location."""
    out = {"type": MEDIA[fmt], "roles": [role], "s3_href": None, "endpoint": None, "region": None}
    scheme, _, rest = href.partition("://")
    bucket, _, key = rest.partition("/")
    if scheme == "s3" and bucket.startswith("leap-pangeo-"):
        out |= {"href": f"{OSN}/{rest}", "s3_href": href, "endpoint": OSN, "region": "us-east-1"}
    elif scheme == "s3":
        region = S3_REGIONS.get(bucket, "us-east-1")
        out |= {"href": f"https://{bucket}.s3.{region}.amazonaws.com/{key}", "s3_href": href, "region": region}
    elif scheme == "gs":
        out |= {"href": f"https://storage.googleapis.com/{rest}", "s3_href": href}
    else:
        out["href"] = href
    return out


def item(
    id: str,
    title: str,
    description: str,
    data: dict,
    *,
    bbox: list[float] | None = None,
    start: str | None = None,
    end: str | None = None,
    license: str | None = None,
    providers: list[str] | None = None,
    keywords: list[str] | None = None,
    source: str = "leap",
    source_url: str | None = None,
    viz: dict | None = None,
    public: bool = True,
    virtual: bool = False,
) -> dict:
    w, s, e, n = bbox or GLOBAL
    assets = {"data": data} | ({"viz": viz} if viz else {})
    return {
        "type": "Feature",
        "stac_version": "1.1.0",
        "id": id,
        "geometry": {"type": "Polygon", "coordinates": [[[w, s], [e, s], [e, n], [w, n], [w, s]]]},
        "bbox": [w, s, e, n],
        "properties": {
            # STAC requires datetime or a start/end range; null datetime + range is valid.
            "datetime": None if (start or end) else "1970-01-01T00:00:00Z",
            "start_datetime": start,
            "end_datetime": end,
            "title": title,
            "description": description,
            "license": license or "other",
            "providers": providers or [],
            "keywords": keywords or [],
            "source": source,
            "source_url": source_url,
            "public": public,
            "virtual": virtual,
        },
        "links": [],
        "assets": assets,
    }


def leap_items() -> list[dict]:
    entries = yaml.safe_load((ROOT / "catalog" / "datasets.yaml").read_text())
    return [
        item(
            e["id"],
            e["title"],
            e.get("description", ""),
            asset(e["href"], e["format"], "data"),
            bbox=e.get("bbox"),
            start=e.get("start"),
            end=e.get("end"),
            license=e.get("license"),
            providers=e.get("providers"),
            keywords=e.get("tags"),
            source_url=e.get("source_url"),
            viz=asset(e["viz"], "icechunk", "visual") if e.get("viz") else None,
            public=e.get("public", True),
        )
        for e in entries
    ]


def dynamical_items() -> list[dict]:
    root = httpx.get(DYNAMICAL_STAC, timeout=30).raise_for_status().json()
    out = []
    for link in root["links"]:
        if link["rel"] != "child":
            continue
        c = httpx.get(link["href"], timeout=30).raise_for_status().json()
        a = c["assets"]
        data = asset(a["icechunk-https"]["href"], "icechunk", "data")
        data |= {"s3_href": a["icechunk"]["href"].rstrip("/"), "region": "us-west-2"}
        start, end = c["extent"]["temporal"]["interval"][0]
        out.append(
            item(
                f"dynamical-{c['id']}",
                c.get("title") or c["id"],
                c.get("description", ""),
                data,
                bbox=c["extent"]["spatial"]["bbox"][0],
                start=start,
                end=end,
                license=c.get("license"),
                providers=["dynamical.org"],
                keywords=["dynamical.org", *c.get("keywords", [])],
                source="dynamical",
                source_url=f"https://dynamical.org/catalog/{c['id']}/",
                virtual=c["id"].endswith("-virtual"),
            )
        )
    return out


async def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--out", default="catalog.parquet")
    ap.add_argument("--upload", action="store_true", help=f"upload to s3://{UPLOAD_BUCKET}/{UPLOAD_KEY}")
    args = ap.parse_args()

    items = leap_items() + dynamical_items()
    ids = [i["id"] for i in items]
    assert len(ids) == len(set(ids)), "duplicate ids"

    # snappy: the web app's hyparquet reads it without extra codecs (ZSTD needs a plugin).
    await rustac.write(args.out, items, parquet_compression="snappy")
    back = (await rustac.read(args.out))["features"]
    assert len(back) == len(items), (len(back), len(items))
    assert all(f["assets"]["data"]["href"].startswith("http") for f in back)
    print(f"wrote {len(items)} items -> {args.out}")

    if args.upload:
        from obstore.store import S3Store

        store = S3Store(UPLOAD_BUCKET, endpoint=OSN, region="us-east-1", virtual_hosted_style_request=False)
        await store.put_async(UPLOAD_KEY, Path(args.out).read_bytes())
        print(f"uploaded -> {OSN}/{UPLOAD_BUCKET}/{UPLOAD_KEY}")


if __name__ == "__main__":
    asyncio.run(main())
