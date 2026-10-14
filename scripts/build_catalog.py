# /// script
# requires-python = ">=3.11"
# dependencies = ["rustac", "pyyaml", "httpx", "obstore"]
# ///
"""Build the LEAP stac-geoparquet catalog: catalog/datasets.yaml + dynamical.org STAC.

One STAC Item per dataset. Assets: `data` (source store) and optional `viz` (zarr v3 rewrite: flat or pyramid).
Each asset carries an https `href` for the browser plus `s3_href`/`endpoint`/`region` for Python.

Usage:
    uv run scripts/build_catalog.py --out catalog.parquet
    uv run scripts/build_catalog.py --out catalog.parquet --upload   # needs OSN write creds in
        AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY
"""

from __future__ import annotations

import argparse
import asyncio
import json
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
S3_REGIONS = {
    "carbonplan-data-viewer": "us-west-2",
    "us-west-2.opendata.source.coop": "us-west-2",
    "nasa-waterinsight": "us-west-2",
}
GLOBAL = [-180.0, -90.0, 180.0, 90.0]
# Facet vocabularies; every item's `domain`/`kind` must come from these.
DOMAINS = {"atmosphere", "ocean", "land", "hydrology", "carbon", "cryosphere"}
KINDS = {"observations", "reanalysis", "analysis", "simulation", "forecast", "ML-ready"}


def asset(href: str, fmt: str, role: str) -> dict:
    """STAC asset for an s3://, gs:// or https:// location."""
    out = {"type": MEDIA[fmt], "roles": [role], "s3_href": None, "endpoint": None, "region": None, "group": None}
    scheme, _, rest = href.partition("://")
    bucket, _, key = rest.partition("/")
    if scheme == "s3" and bucket.startswith("leap-pangeo-"):
        out |= {"href": f"{OSN}/{rest}", "s3_href": href, "endpoint": OSN, "region": "us-east-1"}
    elif scheme == "s3":
        region = S3_REGIONS.get(bucket, "us-east-1")
        # Dotted bucket names break virtual-hosted TLS, so use path-style for them.
        url = f"https://s3.{region}.amazonaws.com/{rest}" if "." in bucket else f"https://{bucket}.s3.{region}.amazonaws.com/{key}"
        out |= {"href": url, "s3_href": href, "region": region}
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
    domain: list[str] | None = None,
    kind: list[str] | None = None,
    source: str = "leap",
    source_url: str | None = None,
    viz: dict | None = None,
    public: bool = True,
    virtual: bool = False,
    **extra,
) -> dict:
    """STAC Item. `extra` holds display props: name, summary, coverage, spatial_domain,
    spatial_resolution, time_resolution, variables, nbytes, featured."""
    domain, kind = domain or [], kind or []
    assert set(domain) <= DOMAINS and set(kind) <= KINDS, (id, domain, kind)
    w, s, e, n = bbox or GLOBAL
    if not extra.get("coverage") and bbox:
        extra["coverage"] = "global" if e - w >= 350 and n - s >= 100 else "regional"
    variables = extra.pop("variables", None) or []
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
            "keywords": domain + kind,
            "domain": domain,
            "kind": kind,
            "name": extra.get("name"),
            "summary": extra.get("summary"),
            "coverage": extra.get("coverage"),
            "spatial_domain": extra.get("spatial_domain"),
            "spatial_resolution": extra.get("spatial_resolution"),
            "time_resolution": extra.get("time_resolution"),
            "variables": variables,
            "n_variables": len(variables),
            "nbytes": extra.get("nbytes"),
            "featured": bool(extra.get("featured")),
            "source": source,
            "source_url": source_url,
            "public": public,
            "virtual": virtual,
        },
        "links": [],
        "assets": assets,
    }


def browser_readable(href: str) -> bool:
    """CORS preflight against the store; buckets without a CORS rule reject it."""
    try:
        r = httpx.options(
            href.rstrip("/") + "/zarr.json",
            headers={"Origin": "https://catalog.leap.columbia.edu", "Access-Control-Request-Method": "GET"},
            timeout=15,
        )
    except httpx.HTTPError:
        return False
    return "access-control-allow-origin" in r.headers


def variable(name: str, long_name: str | None, units: str | None, dims: list[str]) -> dict:
    return {"name": name, "long_name": long_name, "units": units, "dims": dims}


def leap_items() -> list[dict]:
    entries = yaml.safe_load((ROOT / "catalog" / "datasets.yaml").read_text())
    # yaml `variables` wins over metadata.json (e.g. datatrees enrich can't read).
    meta = json.loads((ROOT / "catalog" / "metadata.json").read_text())
    arco_file = ROOT / "catalog" / "arco.json"  # written by build_pyramids.py
    arco = json.loads(arco_file.read_text()) if arco_file.exists() else {}
    out = []
    for e in entries:
        m = meta.get(e["id"], {})
        if m.get("storage_nbytes"):  # prefer on-storage size over uncompressed
            m = m | {"nbytes": m["storage_nbytes"]}
        e = {k: m[k] for k in ("bbox", "start", "end", "spatial_resolution", "time_resolution", "nbytes") if k in m} | e
        attrs = m.get("attrs", {})
        out.append(
            item(
                e["id"],
                e["title"],
                e.get("description") or attrs.get("summary") or attrs.get("description", ""),
                asset(e["href"], e["format"], "data") | {"group": e.get("group")},
                bbox=e.get("bbox"),
                start=e.get("start"),
                end=e.get("end"),
                license=e.get("license"),
                providers=e.get("providers"),
                domain=e.get("domain"),
                kind=e.get("kind"),
                source_url=e.get("source_url"),
                viz=asset(p["href"], "icechunk", "visual") | {"group": "0" if p["layout"] == "pyramid" else None}
                if (p := arco.get(e["id"], {})).get("status") == "built" else None,
                public=e.get("public", True),
                virtual=e.get("virtual", False),
                name=e.get("name"),
                summary=e.get("summary"),
                coverage=e.get("coverage"),
                spatial_domain=e.get("spatial_domain"),
                spatial_resolution=e.get("spatial_resolution"),
                time_resolution=e.get("time_resolution"),
                nbytes=e.get("nbytes"),
                featured=e.get("featured"),
                variables=[
                    variable(k, v.get("long_name"), v.get("units"), v["dims"])
                    for k, v in (e.get("variables") or m.get("variables", {})).items()
                    if not k.endswith(("_bounds", "_bnds"))
                ],
            )
        )
    return out


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
        summ = {k: v[0] for k, v in c.get("summaries", {}).items()}
        out.append(
            item(
                f"dynamical-{c['id']}",
                c.get("model_name") or c.get("title") or c["id"],
                c.get("description", ""),
                data,
                bbox=c["extent"]["spatial"]["bbox"][0],
                start=start,
                end=end,
                license=c.get("license"),
                providers=["dynamical.org"],
                domain=["atmosphere"],
                kind=["forecast" if "forecast" in c["id"] else "analysis"],
                source="dynamical",
                source_url=f"https://dynamical.org/catalog/{c['id']}/",
                virtual=c["id"].endswith("-virtual"),
                name=c.get("title"),
                summary=c.get("description_summary"),
                coverage="global" if summ.get("spatial_domain") == "Global" else "regional",
                spatial_domain=summ.get("spatial_domain"),
                spatial_resolution=summ.get("spatial_resolution"),
                time_resolution=summ.get("time_resolution"),
                variables=[
                    variable(k, v.get("long_name"), v.get("unit"), v.get("dimensions", []))
                    for k, v in c.get("cube:variables", {}).items()
                ],
            )
        )
    return out


async def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--out", default="catalog.parquet")
    ap.add_argument("--upload", action="store_true", help=f"upload to s3://{UPLOAD_BUCKET}/{UPLOAD_KEY}")
    args = ap.parse_args()

    items = leap_items() + dynamical_items()
    for i in items:
        i["properties"]["cors"] = browser_readable(i["assets"]["data"]["href"])
    print("no browser access:", [i["id"] for i in items if not i["properties"]["cors"]])
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
