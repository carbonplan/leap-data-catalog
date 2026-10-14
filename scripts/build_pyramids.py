# /// script
# requires-python = ">=3.11"
# dependencies = ["topozarr==0.2.0", "xproj", "pyproj", "dask", "xarray", "zarr>=3", "icechunk>=2,<3", "virtualizarr", "h5py", "obspec-utils", "arro3-core", "obstore", "pandas", "cftime", "pyyaml", "rustac", "httpx", "tqdm"]
# ///
"""Rewrite each eligible catalog entry as zarr v3 + icechunk with topozarr's recommended encoding.

Output: s3://leap-pangeo-pipeline/arco/<id>.icechunk, laid out one of two ways:
  flat     grids under PYRAMID_PX: one root group, geozarr attrs (proj/spatial)
  pyramid  larger grids: one group per level ("0" = full res) plus multiscales attrs
  copy     no regular 1D lat/lon (curvilinear, non-spatial): plain icechunk 2 rewrite, source chunks
  upgrade  icechunk v1 ids in UPGRADE: server-side object copy, then upgrade the copy to v2
  virtual  netcdf entries (one group per .nc file) and zarr v2 ids in VIRTUAL: refs to the OSN originals
Root attrs carry `zarr-layer` 2nd/98th percentile clims. Source packing (int16 + scale_factor) is kept
on flat writes. Entries without 1D lat/lon are skipped. Failures are recorded and the run continues.
Results go to catalog/arco.json; build_catalog.py reads it for `viz` assets.
Pyramid levels are separate icechunk commits, so a rerun resumes at the first missing level.

Usage:
    uv run scripts/build_pyramids.py --dry-run           # decisions only, metadata reads
    uv run scripts/build_pyramids.py [--only ID ...] [--layout flat|pyramid] [--max-gb N] [--force]
    uv run scripts/build_pyramids.py --only ostia --layout flat --trial   # first time step -> arco/trial/
    Writes need OSN creds in AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY.
"""

from __future__ import annotations

import argparse
import json
import math
import sys
import time
from dataclasses import asdict
from pathlib import Path

import numpy as np
import xarray as xr
import yaml

sys.path.insert(0, str(Path(__file__).parent))
from build_catalog import OSN, ROOT  # noqa: E402
from enrich_datasets import find_coord, open_ds  # noqa: E402

REPORT = ROOT / "catalog" / "arco.json"
BUCKET, PREFIX = "leap-pangeo-pipeline", "arco"
TILE = 256  # coarsest level is about one tile wide
PYRAMID_PX = 2048  # grids at least this wide get a pyramid; None = always flat
CLIM_SAMPLE = 50  # max steps sampled along each non-spatial dim for percentiles
# EASE-Grid 2.0 25 km stores whose empty rows/cols were dropped; regridded back to x/y metres.
EASE2 = {"casm", "glab-vod"}
EASE2_CELL = 25025.26000812306
# Legacy zarr v2 stores with no regular lat/lon grid: rewritten with the copy layout.
COPY = {"gotm-raw", "gotm-sf"}
# zarr v2 stores on OSN whose chunks are already fine: icechunk 2 refs to the v2 chunks, no data rewrite.
VIRTUAL = {"llc4320-agulhas"}
# icechunk v1 repos already chunked well: server-side copied, then the copy is upgraded to v2 (source untouched).
UPGRADE = {"climsim-lowres", "enatl60-60m"}


def to_ease2(ds: xr.Dataset) -> xr.Dataset:
    """Reindex a gappy lat/lon EASE2 dataset onto its full regular EPSG:6933 x/y grid (lazy).

    Grid is anchored at the store's own coordinates: rows sit a constant 0.29 cell off
    the nominal EASE2 origin, so snapping to it would shift the data ~7 km.
    """
    from pyproj import Transformer

    t = Transformer.from_crs("EPSG:4326", "EPSG:6933", always_xy=True)
    x = t.transform(ds.lon.values, np.zeros(ds.lon.size))[0]
    y = t.transform(np.zeros(ds.lat.size), ds.lat.values)[1]
    ix, iy = np.rint((x - x.min()) / EASE2_CELL), np.rint((y.max() - y) / EASE2_CELL)
    assert np.abs((x - x.min()) / EASE2_CELL - ix).max() < 0.05 and np.unique(iy).size == iy.size
    first = ds[next(iter(ds.data_vars))]
    ds = ds.chunk(dict(zip(first.dims, first.encoding["chunks"])))  # dask so reindex stays lazy
    ds = ds.rename({"lon": "x", "lat": "y"}).assign_coords(x=x.min() + EASE2_CELL * ix, y=y.max() - EASE2_CELL * iy)
    ds = ds.reindex(
        x=x.min() + EASE2_CELL * np.arange(ix.max() + 1), y=y.max() - EASE2_CELL * np.arange(iy.max() + 1)
    )
    ds.x.attrs = {"standard_name": "projection_x_coordinate", "units": "m"}
    ds.y.attrs = {"standard_name": "projection_y_coordinate", "units": "m"}
    return ds


def spatial_dims(ds: xr.Dataset) -> tuple[str, str] | None:
    """(x_dim, y_dim) from 1D lon/lat or projected x/y coords, or None."""
    if ds.get("x") is not None and ds.x.attrs.get("standard_name") == "projection_x_coordinate":
        return ("x", "y")
    lat = find_coord(ds, ("lat", "latitude", "ylat", "grid_yt"), "latitude")
    lon = find_coord(ds, ("lon", "longitude", "xlon", "grid_xt"), "longitude")
    return (str(lon.dims[0]), str(lat.dims[0])) if lat is not None and lon is not None else None


def n_levels(ds: xr.Dataset, x: str, y: str) -> int:
    return max(1, math.ceil(math.log2(max(ds.sizes[x], ds.sizes[y]) / TILE)) + 1)


def layout(ds: xr.Dataset, x: str, y: str, forced: str = "auto") -> str:
    if forced != "auto":
        return forced
    return "pyramid" if PYRAMID_PX and max(ds.sizes[x], ds.sizes[y]) >= PYRAMID_PX else "flat"


def plan(e: dict, ds: xr.Dataset, max_gb: float | None) -> tuple[str, str, tuple[str, str] | None]:
    """(status, reason, dims) where status is 'build' or 'skipped'."""
    dims = spatial_dims(ds)
    if dims is None:
        return "skipped", "no 1D lat/lon", None
    # topozarr writes an affine transform; gappy or non-uniform axes (e.g. CASM's EASE2 grid) would render warped.
    for d in dims:
        step = np.diff(ds[d].values.astype(float))
        if step.size and np.ptp(step) > 0.01 * abs(np.median(step)):
            return "skipped", f"irregular {d} spacing", dims
    if max_gb is not None and ds.nbytes / 1e9 > max_gb:
        return "skipped", f"too large ({ds.nbytes / 1e9:.0f} GB > {max_gb:g})", dims
    return "build", "", dims


def clims(ds: xr.Dataset, x: str, y: str) -> dict:
    """2nd/98th percentiles per spatial numeric var, from a strided sample of `ds`."""
    from topozarr import ZarrLayerVarConfig

    out = {}
    for name, da in ds.data_vars.items():
        if not ({x, y} <= set(da.dims) and np.issubdtype(da.dtype, np.number)):
            continue
        stride = {d: max(1, da.sizes[d] // CLIM_SAMPLE) for d in da.dims if d not in (x, y)}
        stride |= {d: max(1, da.sizes[d] // 1024) for d in (x, y)}  # caps full-res 0.05 deg frames
        da = da.isel({d: slice(None, None, s) for d, s in stride.items()})
        lo, hi = np.nanpercentile(da.values, [2, 98])
        if np.isfinite(lo) and np.isfinite(hi):
            out[str(name)] = asdict(ZarrLayerVarConfig(clim=[float(lo), float(hi)]))
    return out


def repo_for(prefix: str, storage=None, virtual_bucket: str | None = None):
    """Open or create the output repo; `virtual_bucket` adds an anonymous OSN virtual chunk container."""
    import icechunk

    storage = storage or icechunk.s3_storage(
        bucket=BUCKET, prefix=prefix, endpoint_url=OSN, region="us-east-1", force_path_style=True, from_env=True
    )
    if virtual_bucket is None:
        return icechunk.Repository.open_or_create(storage)
    url = f"s3://{virtual_bucket}/"
    config = icechunk.RepositoryConfig.default()
    config.set_virtual_chunk_container(icechunk.VirtualChunkContainer(
        url, icechunk.s3_store(region="us-east-1", endpoint_url=OSN, s3_compatible=True, force_path_style=True)
    ))
    creds = icechunk.containers_credentials({url: icechunk.s3_anonymous_credentials()})
    repo = icechunk.Repository.open_or_create(storage, config=config, authorize_virtual_chunk_access=creds)
    repo.save_config()  # persist the container so readers only need to authorize it
    return repo


PACKING = ("dtype", "scale_factor", "add_offset", "_FillValue", "units", "calendar")


def prepare(ds: xr.Dataset, x: str, y: str, crs: str) -> xr.Dataset:
    import xproj  # noqa: F401  registers .proj

    # 2D coords over the spatial dims (e.g. lat_bnds-like) can't be coarsened by topozarr.
    ds = ds.drop_vars([c for c in ds.coords if ds[c].ndim > 1 and {x, y} & set(ds[c].dims)])
    # v2 compressors/chunks from the source break v3 writes; keep only the packing
    keep = {n: {k: v.encoding[k] for k in PACKING if k in v.encoding} for n, v in ds.variables.items()}
    # float64 -> float32 via dask: astype on a lazy backend array loads it and drops encoding
    f64 = [n for n, v in ds.data_vars.items() if v.dtype == np.float64]
    # sentinels outside CF valid_range (e.g. gpcp -99999 with no _FillValue) -> NaN; skip packed vars (range is packed)
    vr = [n for n, v in ds.data_vars.items() if "valid_range" in v.attrs and v.dtype.kind == "f" and "scale_factor" not in v.encoding]
    lazy = {n: ds[n] if ds[n].chunks else ds[n].chunk(dict(zip(ds[n].dims, ds[n].encoding["chunks"]))) for n in {*f64, *vr}}
    lazy = {n: da.where((da >= da.attrs["valid_range"][0]) & (da <= da.attrs["valid_range"][1])) if n in vr else da for n, da in lazy.items()}
    ds = ds.assign({n: da.astype("float32") if n in f64 else da for n, da in lazy.items()})
    for n, v in ds.variables.items():
        v.encoding = keep[n]
        if n in f64 and v.encoding.get("dtype") == np.float64:
            v.encoding["dtype"] = np.dtype("float32")
    return ds.proj.assign_crs(spatial_ref=crs, allow_override=True)


def encoding_for(ds: xr.Dataset, x: str, y: str) -> dict:
    """topozarr's recommended chunks/shards merged with each variable's source packing."""
    from topozarr import recommend_encoding

    rec = recommend_encoding(ds, x_dim=x, y_dim=y)
    enc = {}
    for name, v in ds.variables.items():
        e = {k: v.encoding[k] for k in PACKING if k in v.encoding} | rec.get(name, {})
        if e:
            enc[str(name)] = e
    return enc


def build_flat(e: dict, ds: xr.Dataset, x: str, y: str, crs: str, prefix: str) -> dict:
    from topozarr import ZarrLayerVarConfig, attach_geozarr_metadata

    ds = prepare(ds, x, y, crs)
    enc = encoding_for(ds, x, y)
    hints = clims(ds, x, y)
    # dask chunks = shards, so each task writes whole shards
    shards = {d: s for name, v in enc.items() if "shards" in v for d, s in zip(ds[name].dims, v["shards"])}
    ds = ds.chunk(shards)
    for v in ds.variables.values():  # packing now lives in `enc`
        v.encoding = {}
    ds = attach_geozarr_metadata(
        ds, x_dim=x, y_dim=y, crs=crs, layer_hints={k: ZarrLayerVarConfig(**h) for k, h in hints.items()}
    )
    repo = repo_for(prefix)
    session = repo.writable_session("main")
    # ponytail: one commit, no mid-write resume; add time-slab commits if a hub run dies.
    ds.to_zarr(session.store, mode="w", encoding=enc, zarr_format=3, consolidated=False)
    session.commit("flat rewrite")
    return {"layout": "flat", "crs": crs, "x_dim": x, "y_dim": y, "href": f"s3://{BUCKET}/{prefix}", "clims": len(hints)}


def build(e: dict, ds: xr.Dataset, x: str, y: str, crs: str, prefix: str) -> dict:
    import zarr
    from topozarr import create_pyramid

    ds = prepare(ds, x, y, crs)
    levels = n_levels(ds, x, y)
    pyramid = create_pyramid(ds, levels=levels, x_dim=x, y_dim=y)
    repo = repo_for(prefix)
    try:  # levels committed by an earlier, interrupted run
        done = set(zarr.open_group(repo.readonly_session("main").store, mode="r").group_keys())
    except FileNotFoundError:
        done = set()
    for lvl in range(levels):
        if str(lvl) in done:
            continue
        session = repo.writable_session("main")
        pyramid.write(session.store, mode="a" if lvl else "w", levels=[lvl], progress=True)
        session.commit(f"level {lvl}")
        print(f"     level {lvl}/{levels - 1} committed")

    session = repo.writable_session("main")
    coarsest = xr.open_zarr(session.store, group=str(levels - 1), consolidated=False, chunks=None)
    hints = clims(coarsest, x, y)
    zarr.open_group(session.store, mode="a").attrs["zarr-layer"] = hints
    if session.has_uncommitted_changes:
        session.commit("zarr-layer clims")
    return {"layout": "pyramid", "levels": levels, "crs": crs, "x_dim": x, "y_dim": y, "href": f"s3://{BUCKET}/{prefix}", "clims": len(hints)}


def copy_vars(ds: xr.Dataset) -> xr.Dataset:
    """Dask-chunk on the source chunks and keep only packing encoding (v2 codecs break v3 writes)."""
    if any(v.chunks is None for v in ds.data_vars.values()):
        ds = ds.chunk({d: c for v in ds.data_vars.values() if "chunks" in v.encoding for d, c in zip(v.dims, v.encoding["chunks"])})
    for v in ds.variables.values():
        v.encoding = {k: v.encoding[k] for k in PACKING if k in v.encoding}
    return ds


def build_copy(e: dict, ds: xr.Dataset, x: str | None, y: str | None, crs: str, prefix: str) -> dict:
    # ponytail: keeps source chunking; rechunk/shard here if read patterns need it.
    session = repo_for(prefix).writable_session("main")
    copy_vars(ds).to_zarr(session.store, mode="w", zarr_format=3, consolidated=False)
    session.commit("copy rewrite")
    return {"layout": "copy", "href": f"s3://{BUCKET}/{prefix}"}


def build_upgrade(e: dict, prefix: str) -> dict:
    """Server-side copy of a v1 repo to `prefix` (no bytes leave OSN), then upgrade the copy to icechunk 2."""
    import icechunk
    from concurrent.futures import ThreadPoolExecutor

    from obstore import copy
    from obstore.store import S3Store

    bucket, _, src = e["href"].removeprefix("s3://").partition("/")
    assert bucket == BUCKET, "server-side copy needs source and target in the same bucket"
    obj = S3Store(BUCKET, endpoint=OSN, region="us-east-1", virtual_hosted_style_request=False)  # creds from env
    src = src.rstrip("/") + "/"
    paths = [o["path"] for b in obj.list(src) for o in b]
    with ThreadPoolExecutor(32) as ex:
        list(ex.map(lambda k: copy(obj, k, f"{prefix}/{k[len(src):]}"), paths))
    print(f"     copied {len(paths)} objects")
    repo = repo_for(prefix)
    icechunk.upgrade_icechunk_repository(repo, dry_run=False)
    return {"layout": "upgrade", "objects": len(paths), "href": f"s3://{BUCKET}/{prefix}"}


def build_virtual(e: dict, prefix: str, storage=None) -> dict:
    """Virtual refs to OSN originals: one group per .nc file under the href, or the zarr store at the root."""
    import zarr
    from obspec_utils.registry import ObjectStoreRegistry
    from obstore.store import S3Store
    from virtualizarr import open_virtual_dataset
    from virtualizarr.parsers import HDFParser, ZarrParser

    bucket, _, src = e["href"].removeprefix("s3://").partition("/")
    obj = S3Store(bucket, endpoint=OSN, region="us-east-1", skip_signature=True, virtual_hosted_style_request=False)
    registry = ObjectStoreRegistry({f"s3://{bucket}": obj})
    if e["format"] == "netcdf":
        parser = HDFParser()
        paths = sorted(o["path"] for b in obj.list(src.rstrip("/") + "/") for o in b if o["path"].endswith(".nc"))
        groups = [(Path(p).stem, p) for p in paths]
    else:
        parser, groups = ZarrParser(), [(None, src)]
    repo = repo_for(prefix, storage, virtual_bucket=bucket)
    try:
        done = set(zarr.open_group(repo.readonly_session("main").store, mode="r").group_keys())
    except FileNotFoundError:
        done = set()
    for group, path in groups:
        if group in done:  # rerun resumes after the last committed file
            continue
        vds = open_virtual_dataset(f"s3://{bucket}/{path}", registry=registry, parser=parser)
        session = repo.writable_session("main")
        vds.vz.to_icechunk(session.store, group=group)
        session.commit(f"virtual {group or path}")
        print(f"     {group or path} committed")
    return {"layout": "virtual", "groups": len(groups), "href": f"s3://{BUCKET}/{prefix}"}


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--only", nargs="*", help="ids to process")
    ap.add_argument("--max-gb", type=float, help="skip stores larger than this (uncompressed); default no cap")
    ap.add_argument("--layout", choices=("auto", "flat", "pyramid"), default="auto", help=f"auto: pyramid if >= {PYRAMID_PX} px")
    ap.add_argument("--trial", action="store_true", help="first time step only, to arco/trial/<id>.icechunk")
    ap.add_argument("--dry-run", action="store_true", help="print decisions, write nothing")
    ap.add_argument("--force", action="store_true", help="rebuild entries already marked built")
    args = ap.parse_args()

    entries = yaml.safe_load((ROOT / "catalog" / "datasets.yaml").read_text())
    report: dict = json.loads(REPORT.read_text()) if REPORT.exists() else {}
    for e in entries:
        eid = e["id"]
        if (args.only and eid not in args.only) or e["format"] not in ("zarr", "icechunk", "netcdf"):
            continue
        if e.get("pyramid") is False:  # already analysis-ready (e.g. CERES groups)
            print(f"skip    {eid}: pyramid: false")
            continue
        if not e["href"].startswith("s3://leap-pangeo-"):
            print(f"skip    {eid}: not on OSN")
            continue
        if not args.trial and report.get(eid, {}).get("status") == "built" and not args.force:
            print(f"done    {eid}")
            continue
        t0 = time.perf_counter()
        try:
            if eid in UPGRADE:
                if args.dry_run:
                    print(f"build   {eid}: upgrade (server-side copy, then v1 -> v2)")
                    continue
                print(f"build   {eid}: upgrade")
                result = {"status": "built", **build_upgrade(e, f"{PREFIX}/{eid}.icechunk")}
            elif e["format"] == "netcdf" or eid in VIRTUAL:
                if args.dry_run:
                    print(f"build   {eid}: virtual ({e['format']})")
                    continue
                print(f"build   {eid}: virtual")
                result = {"status": "built", **build_virtual(e, f"{PREFIX}/{eid}.icechunk")}
            else:
                ds = open_ds(e)
                crs = "EPSG:4326"
                if eid in EASE2:
                    ds, crs = to_ease2(ds), "EPSG:6933"
                if args.trial and "time" in ds.dims:
                    ds = ds.isel(time=[0])
                status, reason, dims = plan(e, ds, args.max_gb)
                gb = round(ds.nbytes / 1e9, 1)
                lay = layout(ds, *dims, args.layout) if dims else ""
                if eid in COPY and not reason.startswith("too large"):
                    status, reason, lay = "build", "", "copy"
                if args.dry_run or status == "skipped":
                    lv = f" {n_levels(ds, *dims)} levels" if lay == "pyramid" else ""
                    print(f"{status:8s}{eid}: {gb} GB {reason or f'{lay} {dims}{lv}'}")
                    if status == "skipped" and not args.dry_run and not args.trial:
                        report[eid] = {"status": status, "reason": reason, "gb": gb}
                    continue
                print(f"build   {eid}: {gb} GB {lay} {dims}")
                builder = {"pyramid": build, "flat": build_flat, "copy": build_copy}[lay]
                prefix = f"{PREFIX}/{'trial/' if args.trial else ''}{eid}.icechunk"
                result = {"status": "built", "gb": gb, **builder(e, ds, *(dims or (None, None)), crs, prefix)}
        except Exception as err:  # one bad store shouldn't stop the run
            print(f"FAIL    {eid}: {type(err).__name__}: {str(err)[:300]}")
            result = {"status": "failed", "reason": f"{type(err).__name__}: {str(err)[:300]}"}
        result["seconds"] = round(time.perf_counter() - t0)
        if args.trial:  # keeps the real entry untouched
            report.setdefault(eid, {})["trial"] = result
            print(f"trial   {eid}: {result}")
        else:
            report[eid] = result
        if not args.dry_run:
            REPORT.write_text(json.dumps(report, indent=1, sort_keys=True) + "\n")

    counts = {s: sum(r.get("status") == s for r in report.values()) for s in ("built", "skipped", "failed")}
    print(counts)


if __name__ == "__main__":
    main()
