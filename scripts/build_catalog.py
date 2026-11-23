# /// script
# requires-python = ">=3.11"
# dependencies = ["rustac", "pyyaml", "obstore"]
# ///
"""Build the LEAP stac-geoparquet catalog from catalog/datasets.yaml.

One STAC Item per dataset, one asset per store. Each asset has an https `href` for the browser and,
for s3/gs stores, `alternate.<scheme>.href` with the native URI for Python.

Usage:
    uv run scripts/build_catalog.py --out catalog.parquet
    python scripts/with_osn.py uv run scripts/build_catalog.py --out catalog.parquet --upload
"""

from __future__ import annotations

import argparse
import asyncio
from pathlib import Path

import rustac
import yaml

ROOT = Path(__file__).resolve().parents[1]
DATASETS = ROOT / "catalog" / "datasets.yaml"
OSN = "https://nyu1.osn.mghpcc.org"
UPLOAD_BUCKET, UPLOAD_KEY = "leap-pangeo-pipeline", "catalog/catalog.parquet"
STAC_EXTENSIONS = ["https://stac-extensions.github.io/alternate-assets/v1.2.0/schema.json"]
MEDIA = {
    "zarr": "application/vnd+zarr",
    "icechunk": "application/x-icechunk",  # matches stac.dynamical.org
    "netcdf": "application/netcdf",
    "csv": "text/csv",
    "parquet": "application/vnd.apache.parquet",
}
# Region of non-OSN s3 buckets referenced by the catalog.
S3_REGIONS = {
    "carbonplan-data-viewer": "us-west-2",
    "us-west-2.opendata.source.coop": "us-west-2",
    "nasa-waterinsight": "us-west-2",
    "icechunk-public-data": "us-east-1",
}
GLOBAL = [-180.0, -90.0, 180.0, 90.0]
# shortcut: placeholder for datasets with no known time range; PR 5 enrichment fills real extents.
UNKNOWN_DATETIME = "1970-01-01T00:00:00Z"
LEAP_HOST = {"name": "LEAP", "roles": ["host"], "url": "https://leap.columbia.edu"}
# Dataset-level yaml keys copied to `leap:<key>` properties.
LEAP_PROPS = ("summary", "spatial_domain", "coverage", "spatial_resolution", "time_resolution", "featured")


def https_href(href: str) -> str:
    """Browser URL for an s3://, gs:// or https:// location."""
    scheme, _, rest = href.partition("://")
    bucket, _, key = rest.partition("/")
    if scheme == "s3" and bucket.startswith("leap-pangeo-"):
        return f"{OSN}/{rest}"
    if scheme == "s3":
        region = S3_REGIONS.get(bucket, "us-east-1")
        # Dotted bucket names break virtual-hosted TLS, so use path-style for them.
        if "." in bucket:
            return f"https://s3.{region}.amazonaws.com/{rest}"
        return f"https://{bucket}.s3.{region}.amazonaws.com/{key}"
    if scheme == "gs":
        return f"https://storage.googleapis.com/{rest}"
    assert scheme == "https", f"unsupported href scheme: {href}"
    return href


def asset(store: dict) -> dict:
    href = store["href"].rstrip("/")
    out = {"href": https_href(href), "type": MEDIA[store["format"]], "roles": ["data"]}
    if store.get("name"):
        out["title"] = store["name"]
    scheme = href.partition("://")[0]
    if scheme in ("s3", "gs"):
        out["alternate"] = {"s3" if scheme == "s3" else "gcs": {"href": href}}
    for k in ("group", "virtual", "public"):
        if k in store:
            out[f"leap:{k}"] = store[k]
    return out


def providers(entry: dict) -> list[dict]:
    """Yaml providers, plus LEAP as host when any store lives in a LEAP OSN bucket."""
    out = [dict(p) for p in entry.get("providers", [])]
    if any(s["href"].startswith("s3://leap-pangeo-") for s in entry["stores"]):
        leap = next((p for p in out if p["name"] == "LEAP"), None)
        if leap is None:
            out.append(dict(LEAP_HOST))
        else:
            leap["roles"] = sorted(set(leap.get("roles", [])) | {"host"})
            leap.setdefault("url", LEAP_HOST["url"])
    return out


def links(entry: dict) -> list[dict]:
    out = []
    if url := entry.get("source_url"):
        out.append({"rel": "via", "href": url, "type": "text/html", "title": "Source repository"})
    if url := entry.get("license_url"):
        out.append({"rel": "license", "href": url, "title": "License"})
    return out


def item(entry: dict) -> dict:
    w, s, e, n = entry.get("bbox") or GLOBAL
    start, end = entry.get("start"), entry.get("end")
    props = {
        "datetime": None if start and end else UNKNOWN_DATETIME,
        "title": entry["title"],
        "description": entry.get("description") or entry.get("summary") or entry["title"],
        "keywords": entry.get("domain", []) + entry.get("kind", []),
        "license": entry["license"],
        "providers": providers(entry),
    }
    if start and end:
        props |= {"start_datetime": start, "end_datetime": end}
    else:
        props["leap:temporal_unknown"] = True
    if text := entry.get("license_text"):
        props["leap:license_text"] = text
    props |= {f"leap:{k}": entry[k] for k in LEAP_PROPS if entry.get(k) is not None}
    return {
        "type": "Feature",
        "stac_version": "1.1.0",
        "stac_extensions": STAC_EXTENSIONS,
        "id": entry["id"],
        "geometry": {"type": "Polygon", "coordinates": [[[w, s], [e, s], [e, n], [w, n], [w, s]]]},
        "bbox": [w, s, e, n],
        "properties": props,
        "links": links(entry),
        "assets": {store["key"]: asset(store) for store in entry["stores"]},
    }


def load_items(path: Path = DATASETS) -> list[dict]:
    items = [item(e) for e in yaml.safe_load(path.read_text())]
    ids = [i["id"] for i in items]
    assert len(ids) == len(set(ids)), "duplicate dataset ids"
    return items


async def write(items: list[dict], out: Path) -> None:
    # snappy: the web app's hyparquet reads it without extra codecs (ZSTD needs a plugin).
    await rustac.write(str(out), items, parquet_compression="snappy")
    back = (await rustac.read(str(out)))["features"]
    assert len(back) == len(items), (len(back), len(items))


async def upload(path: Path) -> None:
    """Needs OSN write keys in AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY (see with_osn.py)."""
    from obstore.store import S3Store

    store = S3Store(UPLOAD_BUCKET, endpoint=OSN, region="us-east-1", virtual_hosted_style_request=False)
    await store.put_async(UPLOAD_KEY, path.read_bytes())
    print(f"uploaded -> {OSN}/{UPLOAD_BUCKET}/{UPLOAD_KEY}")


async def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--out", type=Path, default=Path("catalog.parquet"))
    ap.add_argument("--upload", action="store_true", help=f"upload to s3://{UPLOAD_BUCKET}/{UPLOAD_KEY}")
    args = ap.parse_args()

    items = load_items()
    await write(items, args.out)
    print(f"wrote {len(items)} items ({sum(len(i['assets']) for i in items)} assets) -> {args.out}")
    if args.upload:
        await upload(args.out)


if __name__ == "__main__":
    asyncio.run(main())
