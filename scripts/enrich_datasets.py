# /// script
# requires-python = ">=3.11"
# dependencies = ["xarray", "zarr>=3", "icechunk>=2", "obstore", "pandas", "cftime", "pyyaml", "rustac"]
# ///
"""Read each LEAP store's metadata lazily (attrs, dims, 1D coords) into catalog/metadata.json.

build_catalog.py merges the result under catalog/datasets.yaml: hand edits there win. Never reads data variables.

Usage:
    uv run scripts/enrich_datasets.py [--only ID ...] [--attrs-out attrs.json]
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from urllib.parse import urlsplit

import cftime
import icechunk
import numpy as np
import pandas as pd
import xarray as xr
import yaml
from obstore.store import HTTPStore, S3Store
from zarr.abc.store import Store
from zarr.storage import ObjectStore

from build_catalog import DATASETS, METADATA, S3_REGIONS, https_href

OSN = 'https://nyu1.osn.mghpcc.org'
LAT = ('lat', 'latitude', 'ylat', 'grid_yt', 'yt_ocean')
LON = ('lon', 'longitude', 'xlon', 'grid_xt', 'xt_ocean')
MAX_VALUES = 50  # longer non-numeric dimensions are stored as an index range


def s3_location(href: str) -> tuple[str, str, dict]:
    """bucket, prefix and endpoint/region settings of an s3:// href."""
    parts = urlsplit(href)
    bucket, prefix = parts.netloc, parts.path.strip('/')
    if bucket.startswith('leap-pangeo-'):
        return bucket, prefix, {'region': 'us-east-1', 'endpoint': OSN}
    return bucket, prefix, {'region': S3_REGIONS.get(bucket, 'us-east-1')}


def icechunk_store(store: dict) -> Store:
    bucket, prefix, where = s3_location(store['href'])
    storage = icechunk.s3_storage(
        bucket=bucket, prefix=prefix, region=where['region'], endpoint_url=where.get('endpoint'),
        force_path_style=True, anonymous=True,
    )
    config = icechunk.Repository.fetch_config(storage)
    containers = (config.virtual_chunk_containers if config else None) or {}
    # Same anonymous access as the catalog's snippet: coords of a virtual store may be virtual chunks too.
    creds = icechunk.containers_credentials({
        p: icechunk.Credentials.HttpAccess() if p.startswith('http') else icechunk.s3_anonymous_credentials()
        for p in containers
    })
    return icechunk.Repository.open(storage, authorize_virtual_chunk_access=creds).readonly_session('main').store


def zarr_store(store: dict) -> Store:
    href = store['href']
    if href.startswith('s3://'):
        bucket, prefix, where = s3_location(href)
        obj = S3Store(bucket, prefix=prefix, skip_signature=True, virtual_hosted_style_request=False, **where)
    else:
        obj = HTTPStore.from_url(https_href(href))
    return ObjectStore(obj, read_only=True)


def open_store(store: dict) -> xr.Dataset:
    """Lazy dataset of one store; a datatree needs `group` in datasets.yaml, since its root has no arrays."""
    if store['format'] == 'icechunk':
        z, kwargs = icechunk_store(store), {'consolidated': False}
    else:
        z, kwargs = zarr_store(store), zarr_kwargs(store)
    ds = xr.open_zarr(z, group=store.get('group'), chunks=None, decode_times=False, **kwargs)
    if not ds.data_vars:
        raise ValueError('no variables; set `group`')
    return ds


def zarr_kwargs(store: dict) -> dict:
    # Only OSN allows anonymous listing. Elsewhere the v2 stores are read through their consolidated metadata.
    return {} if store['href'].startswith('s3://leap-pangeo-') else {'zarr_format': 2, 'consolidated': True}


def iso(t: object) -> str:
    """UTC RFC 3339 string for a numpy or cftime datetime."""
    s = t.isoformat() if isinstance(t, cftime.datetime) else pd.Timestamp(t).isoformat()
    return f"{s[:19]}Z"


def is_time(c: xr.DataArray) -> bool:
    return ' since ' in str(c.attrs.get('units', ''))


def decode(c: xr.DataArray) -> np.ndarray:
    return xr.decode_cf(c.rename('t').to_dataset(), use_cftime=None)['t'].values


def time_label(seconds: float) -> str:
    days = seconds / 86400
    for label, d, tol in (('monthly', 30.4, 3), ('annual', 365.25, 2), ('daily', 1, 0.01), ('hourly', 1 / 24, 0.001)):
        if abs(days - d) <= tol:
            return label
    if days >= 1:
        return f"{days:g} days"
    return f"{seconds / 3600:g} hours" if seconds >= 3600 else f"{round(seconds / 60):g} minutes"


def dimension(ds: xr.Dataset, name: str) -> dict:
    """datacube dimension; `size` is extra. Without a usable coordinate, an index range."""
    size = int(ds.sizes[name])
    out: dict = {'type': 'other', 'extent': [0, size - 1], 'size': size}
    c = ds.coords.get(name)
    if c is None or c.ndim != 1:
        return out
    if is_time(c):
        t = decode(c)
        return {'type': 'temporal', 'extent': [iso(t.min()), iso(t.max())], 'size': size}
    if units := str(c.attrs.get('units', '')):
        out['unit'] = units
    if not np.issubdtype(c.dtype, np.number):
        return {'type': 'other', 'values': [str(v) for v in c.values], 'size': size} if size <= MAX_VALUES else out
    out['extent'] = [float(np.nanmin(c.values)), float(np.nanmax(c.values))]
    for names, axis in ((LON, 'x'), (LAT, 'y')):
        if name in names:
            return out | {'type': 'spatial', 'axis': axis}
    return out


def variable(v: xr.DataArray) -> dict:
    out: dict = {'dimensions': [str(d) for d in v.dims], 'type': 'data'}
    for key, attr in (('unit', 'units'), ('long_name', 'long_name')):
        if text := str(v.attrs.get(attr, '')).strip():
            out[key] = text
    return out


def bbox(ds: xr.Dataset) -> tuple[list[float], float] | None:
    """Bounds and latitude spacing from 1D lat/lon coordinates."""
    lat, lon = (next((ds.coords[n] for n in names if n in ds.coords and ds.coords[n].ndim == 1), None) for names in (LAT, LON))
    if lat is None or lon is None or lat.size < 2:
        return None
    la, lo = lat.values.astype(float), lon.values.astype(float)
    w, e = float(np.nanmin(lo)), float(np.nanmax(lo))
    if e - w > 300:  # global in any longitude convention
        w, e = -180.0, 180.0
    elif e > 180:
        w, e = w - 360, e - 360
    step = float(np.median(np.abs(np.diff(la))))
    return [round(w, 4), round(float(np.nanmin(la)), 4), round(e, 4), round(float(np.nanmax(la)), 4)], step


def time_range(ds: xr.Dataset) -> dict:
    if 'valid_time_start' in ds.attrs:  # ARCO ERA5 pre-allocates 1900-2050
        return {'start': f"{ds.attrs['valid_time_start']}T00:00:00Z", 'end': f"{ds.attrs['valid_time_stop']}T23:00:00Z"}
    name = next((d for d in ('time', 'date') if d in ds.coords and ds.coords[d].ndim == 1 and is_time(ds.coords[d])), None)
    if name is None:
        return {}
    t = np.sort(decode(ds.coords[name]))
    return {'start': iso(t[0]), 'end': iso(t[-1])}


def frequency(ds: xr.Dataset) -> str | None:
    for d in ('time', 'date'):
        if d in ds.coords and ds.coords[d].size > 2 and is_time(ds.coords[d]):
            t = decode(ds.coords[d])
            return time_label(float(pd.to_timedelta(pd.Series(np.diff(t))).dt.total_seconds().median()))
    return None


def describe(ds: xr.Dataset) -> dict:
    out: dict = {
        'cube:dimensions': {str(d): dimension(ds, str(d)) for d in ds.sizes},
        'cube:variables': {str(k): variable(v) for k, v in ds.data_vars.items()},
    } | time_range(ds)
    if 'valid_time_start' in ds.attrs:
        out['cube:dimensions']['time']['extent'] = [out['start'], out['end']]
    if found := bbox(ds):
        out['bbox'], step = found
        out['spatial_resolution'] = f"{step:.3g}°"
    if freq := frequency(ds):
        out['time_resolution'] = freq
    return out


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--only', nargs='*', help='ids to read; the others keep their existing metadata')
    ap.add_argument('--attrs-out', type=Path, help='also write global and variable attrs here, for research')
    args = ap.parse_args()

    meta: dict = json.loads(METADATA.read_text()) if METADATA.exists() else {}
    attrs: dict = {}
    failed = []
    for entry in yaml.safe_load(DATASETS.read_text()):
        if args.only and entry['id'] not in args.only:
            continue
        for store in entry['stores']:
            key = f"{entry['id']}/{store['key']}"
            try:
                ds = open_store(store)
                meta[key] = describe(ds)
            except Exception as err:  # one unreachable store must not lose the others; it keeps its old entry
                failed.append(key)
                print(f"FAIL {key}: {type(err).__name__}: {str(err)[:300]}", flush=True)
                continue
            attrs[key] = {'global': ds.attrs, 'variables': {k: v.attrs for k, v in ds.data_vars.items()}}
            m = meta[key]
            print(f"ok   {key}: {dict(ds.sizes)} {len(ds.data_vars)} vars {m.get('spatial_resolution')} "
                  f"{m.get('time_resolution')} {m.get('start')} {m.get('end')} {m.get('bbox')}", flush=True)

    METADATA.write_text(json.dumps(meta, indent=1, sort_keys=True) + '\n')
    if args.attrs_out:
        args.attrs_out.write_text(json.dumps(attrs, indent=1, default=str))
    print(f"wrote {len(meta)} stores -> {METADATA}; failed: {failed or 'none'}")


if __name__ == '__main__':
    main()
