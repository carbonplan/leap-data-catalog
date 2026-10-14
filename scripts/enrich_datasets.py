# /// script
# requires-python = ">=3.11"
# dependencies = ["xarray", "zarr>=3", "icechunk", "obstore", "pandas", "cftime", "pyyaml", "rustac", "httpx"]
# ///
"""Lazily read metadata (attrs, dims, coords) of each zarr/icechunk entry -> catalog/metadata.json.

Reads no data chunks beyond 1D coordinate arrays. Hand edits in datasets.yaml always win;
build_catalog.py merges this file underneath them.

Usage: uv run scripts/enrich_datasets.py [--only ID ...]
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd
import xarray as xr
import yaml

sys.path.insert(0, str(Path(__file__).parent))
from build_catalog import ROOT, asset  # noqa: E402

OUT = ROOT / "catalog" / "metadata.json"
ATTRS = ("title", "summary", "description", "institution", "references", "license")


def open_ds(e: dict) -> xr.Dataset:
    a = asset(e["href"], e["format"], "data")
    if e["format"] == "icechunk":
        import icechunk

        bucket, _, prefix = a["s3_href"].removeprefix("s3://").partition("/")
        storage = icechunk.s3_storage(
            bucket=bucket, prefix=prefix, endpoint_url=a["endpoint"], region=a["region"],
            force_path_style=True, anonymous=True,
        )
        store = icechunk.Repository.open(storage).readonly_session("main").store
        return xr.open_zarr(store, group=e.get("group"), consolidated=False, chunks=None)
    from obstore.exceptions import PermissionDeniedError
    from obstore.store import HTTPStore, S3Store
    from zarr.storage import ObjectStore

    if a["s3_href"] and a["s3_href"].startswith("s3://"):
        bucket, _, prefix = a["s3_href"].removeprefix("s3://").partition("/")
        kw = {"endpoint": a["endpoint"], "virtual_hosted_style_request": False} if a["endpoint"] else {}
        obj = S3Store(bucket, prefix=prefix, region=a["region"], skip_signature=True, **kw)
    else:
        obj = HTTPStore.from_url(a["href"])
    store = ObjectStore(obj, read_only=True)
    try:
        return xr.open_zarr(store, group=e.get("group"), chunks=None)
    except PermissionDeniedError:  # buckets without anonymous list 403 on a missing zarr.json
        return xr.open_zarr(store, group=e.get("group"), chunks=None, zarr_format=2)


# ponytail: listing stops here; bigger stores (e.g. ARCO ERA5) fall back to uncompressed size.
MAX_OBJECTS = 500_000


def storage_nbytes(e: dict) -> int | None:
    """Bytes on storage, summed from an object listing of the store prefix, or None.
    Icechunk counts every snapshot's chunks, so it can overestimate rewritten repos."""
    from obstore.store import GCSStore, S3Store

    a = asset(e["href"], e["format"], "data")
    bucket, _, prefix = a["s3_href"].split("://", 1)[1].partition("/")
    if a["s3_href"].startswith("gs://"):
        obj = GCSStore(bucket, skip_signature=True)
    else:
        kw = {"endpoint": a["endpoint"]} if a["endpoint"] else {}
        obj = S3Store(bucket, region=a["region"], skip_signature=True, virtual_hosted_style_request=False, **kw)
    total = n = 0
    for batch in obj.list(prefix.rstrip("/") + "/", chunk_size=1000):
        total += sum(o["size"] for o in batch)
        n += len(batch)
        if n > MAX_OBJECTS:
            return None
    return total or None


def find_coord(ds: xr.Dataset, names: tuple[str, ...], std: str) -> xr.DataArray | None:
    for c in ds.coords.values():
        if c.ndim == 1 and (c.name in names or c.attrs.get("standard_name") == std):
            return c
    return None


def step(values: np.ndarray) -> float | None:
    """Median spacing of a 1D coordinate (abs), or None."""
    return float(np.median(np.abs(np.diff(values)))) if values.size > 1 else None


def time_resolution(seconds: float) -> str:
    days = seconds / 86400
    for label, d, tol in (("monthly", 30.4, 3), ("annual", 365.25, 2), ("daily", 1, 0.01)):
        if abs(days - d) <= tol:
            return label
    return f"{seconds / 3600:g}h" if days < 1 else f"{days:g}d"


def iso(t) -> str:
    """UTC RFC 3339 string for a numpy or cftime datetime."""
    s = t.isoformat() if hasattr(t, "isoformat") else pd.Timestamp(t).isoformat()
    return s if s.endswith("Z") or "+" in s[10:] else s + "Z"


def describe(ds: xr.Dataset) -> dict:
    out: dict = {
        "attrs": {k: str(ds.attrs[k]).strip() for k in ATTRS if ds.attrs.get(k)},
        "dims": {str(k): int(v) for k, v in ds.sizes.items()},
        "nbytes": int(ds.nbytes),  # uncompressed, from shape x dtype
        "variables": {
            str(k): {
                "dims": [str(d) for d in v.dims],
                **{a: str(v.attrs[a]) for a in ("long_name", "units") if v.attrs.get(a)},
            }
            for k, v in ds.data_vars.items()
        },
    }
    lat = find_coord(ds, ("lat", "latitude", "ylat", "grid_yt", "yt_ocean"), "latitude")
    lon = find_coord(ds, ("lon", "longitude", "xlon", "grid_xt", "xt_ocean"), "longitude")
    if lat is not None and lon is not None:
        la, lo = lat.values.astype(float), lon.values.astype(float)
        w, e = float(lo.min()), float(lo.max())
        if e - w > 300:  # global, whatever the lon convention (0-360, tripolar -280..80)
            w, e = -180.0, 180.0
        elif e > 180:
            w, e = (w - 360 if w > 180 else w), e - 360
        out["bbox"] = [round(w, 4), round(float(la.min()), 4), round(e, 4), round(float(la.max()), 4)]
        if (r := step(la)) is not None:
            out["spatial_resolution"] = f"{r:.3g}°"
    t = find_coord(ds, ("time",), "time")
    if t is not None and t.size:
        out["start"], out["end"] = iso(t.values[0]), iso(t.values[-1])
        if t.size > 1:
            secs = pd.to_timedelta(pd.Series(np.diff(t.values))).dt.total_seconds()
            out["time_resolution"] = time_resolution(float(secs.median()))
    return out


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--only", nargs="*", help="ids to (re)enrich; others kept from existing file")
    args = ap.parse_args()

    entries = yaml.safe_load((ROOT / "catalog" / "datasets.yaml").read_text())
    meta: dict = json.loads(OUT.read_text()) if OUT.exists() else {}
    for e in entries:
        if e["format"] not in ("zarr", "icechunk") or (args.only and e["id"] not in args.only):
            continue
        try:
            meta[e["id"]] = describe(open_ds(e))
            m = meta[e["id"]]
            try:
                m["storage_nbytes"] = storage_nbytes(e)
            except Exception as err:  # e.g. buckets without anonymous list
                print(f"     no storage size: {type(err).__name__}")
            print(f"ok   {e['id']}: {len(m['variables'])} vars, {m.get('spatial_resolution')}, {m.get('time_resolution')}, {m['nbytes'] / 1e9:.3g} GB raw, {(m.get('storage_nbytes') or 0) / 1e9:.3g} GB stored")
            for k in ("title", "summary", "description"):
                if k in m["attrs"]:
                    print(f"       {k}: {m['attrs'][k][:120]}")
        except Exception as err:  # keep going; one bad store shouldn't block the rest
            print(f"FAIL {e['id']}: {type(err).__name__}: {str(err)[:200]}")

    OUT.write_text(json.dumps(meta, indent=1, sort_keys=True) + "\n")
    print(f"wrote {len(meta)} entries -> {OUT}")


if __name__ == "__main__":
    main()
