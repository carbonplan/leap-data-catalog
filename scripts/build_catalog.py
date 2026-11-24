# /// script
# requires-python = ">=3.11"
# dependencies = ["rustac", "pyyaml"]
# ///
"""Build the LEAP stac-geoparquet catalog from catalog/ plus the dynamical.org STAC catalog.

One STAC Item per dataset, one asset per store. catalog/metadata.json (scripts/enrich_datasets.py) fills what
catalog/datasets.yaml leaves out. dynamical.org Collections become Items with `leap:source: dynamical`;
a datasets.yaml entry with the same id wins. Each asset has an https `href` for the browser and,
for s3/gs stores, `alternate.<scheme>.href` with the native URI for Python.

Usage:
    uv run scripts/build_catalog.py --out catalog.parquet [--no-dynamical]
    Upload with scripts/upload_catalog.py.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import math
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

import rustac
import yaml

ROOT = Path(__file__).resolve().parents[1]
DATASETS = ROOT / 'catalog' / 'datasets.yaml'
METADATA = ROOT / 'catalog' / 'metadata.json'
FEATURED = ROOT / 'catalog' / 'featured.yaml'
OSN = 'https://nyu1.osn.mghpcc.org'
DYNAMICAL = 'https://stac.dynamical.org/catalog.json'
# Collection links that point into dynamical's own catalog tree; dropped from our Items.
DYNAMICAL_TREE_RELS = {'root', 'self', 'parent'}
STAC_EXTENSIONS = ['https://stac-extensions.github.io/alternate-assets/v1.2.0/schema.json']
MEDIA = {
    'zarr': 'application/vnd+zarr',
    'icechunk': 'application/x-icechunk',  # matches stac.dynamical.org
    'netcdf': 'application/netcdf',
    'csv': 'text/csv',
    'parquet': 'application/vnd.apache.parquet',
}
# Region of non-OSN s3 buckets referenced by the catalog.
S3_REGIONS = {
    'carbonplan-data-viewer': 'us-west-2',
    'us-west-2.opendata.source.coop': 'us-west-2',
    'nasa-waterinsight': 'us-west-2',
    'icechunk-public-data': 'us-east-1',
}
GLOBAL = [-180.0, -90.0, 180.0, 90.0]
# Placeholder for datasets with no known time range, marked with `leap:temporal_unknown`.
UNKNOWN_DATETIME = '1970-01-01T00:00:00Z'
LEAP_HOST = {'name': 'LEAP', 'roles': ['host'], 'url': 'https://leap.columbia.edu'}
# Dataset-level yaml keys copied to `leap:<key>` properties.
LEAP_PROPS = (
    'summary', 'spatial_domain', 'coverage', 'spatial_resolution', 'time_resolution', 'featured',
    'attribution', 'model_id', 'model_name', 'version', 'ongoing', 'maintainers',
)
DOMAINS = {'atmosphere', 'ocean', 'land', 'hydrology', 'carbon', 'cryosphere'}
KINDS = {'observations', 'reanalysis', 'analysis', 'simulation', 'forecast', 'ML-ready'}
# dynamical.org datacube variable fields shown on the site; the chunk and shard shapes are dropped.
CUBE_VARIABLE_KEYS = ('dimensions', 'type', 'unit', 'long_name', 'comment')
# dynamical.org Collection fields kept as `leap:<key>` properties.
DYNAMICAL_PROPS = ('attribution', 'model_id', 'model_name', 'version')


def https_href(href: str) -> str:
    """Browser URL for an s3://, gs:// or https:// location."""
    scheme, _, rest = href.partition('://')
    bucket, _, key = rest.partition('/')
    if scheme == 's3' and bucket.startswith('leap-pangeo-'):
        return f"{OSN}/{rest}"
    if scheme == 's3':
        region = S3_REGIONS.get(bucket, 'us-east-1')
        # Dotted bucket names break virtual-hosted TLS, so use path-style for them.
        if '.' in bucket:
            return f"https://s3.{region}.amazonaws.com/{rest}"
        return f"https://{bucket}.s3.{region}.amazonaws.com/{key}"
    if scheme == 'gs':
        return f"https://storage.googleapis.com/{rest}"
    assert scheme == 'https', f"unsupported href scheme: {href}"
    return href


def asset(store: dict) -> dict:
    href = store['href'].rstrip('/')
    https = store.get('https') or https_href(href)
    assert https.startswith('https://'), https
    out = {'href': https, 'type': MEDIA[store['format']], 'roles': ['data']}
    if store.get('name'):
        out['title'] = store['name']
    scheme = href.partition('://')[0]
    if scheme in ('s3', 'gs'):
        out['alternate'] = {'s3' if scheme == 's3' else 'gcs': {'href': href}}
    for k in ('group', 'virtual', 'public', 'viewer'):
        if k in store:
            out[f"leap:{k}"] = store[k]
    return out


def providers(entry: dict) -> list[dict]:
    """Yaml providers, plus LEAP as host when any store lives in a LEAP OSN bucket."""
    out = [dict(p) for p in entry.get('providers', [])]
    if any(s['href'].startswith('s3://leap-pangeo-') for s in entry['stores']):
        leap = next((p for p in out if p['name'] == 'LEAP'), None)
        if leap is None:
            out.append(dict(LEAP_HOST))
        else:
            leap['roles'] = sorted(set(leap.get('roles', [])) | {'host'})
            leap.setdefault('url', LEAP_HOST['url'])
    return out


def links(entry: dict) -> list[dict]:
    out = []
    if url := entry.get('source_url'):
        out.append({'rel': 'via', 'href': url, 'type': 'text/html', 'title': 'Source repository'})
    if url := entry.get('license_url'):
        out.append({'rel': 'license', 'href': url, 'title': 'License'})
    out += [{'rel': 'about', 'type': 'text/html'} | ref for ref in entry.get('references', [])]
    return out + entry.get('links', [])


def footprint(w: float, s: float, e: float, n: float, step: float = 10.0) -> list[list[float]]:
    """Closed bbox ring with a vertex every `step` degrees; globe renderers (stac-map) collapse 4-corner global boxes to a line."""
    if w > e:
        raise ValueError(f"bbox crosses the antimeridian (not supported): {[w, s, e, n]}")
    nx, ny = max(1, math.ceil((e - w) / step)), max(1, math.ceil((n - s) / step))
    xs = [w + (e - w) * i / nx for i in range(nx + 1)]
    ys = [s + (n - s) * j / ny for j in range(ny + 1)]
    return (
        [[x, s] for x in xs]
        + [[e, y] for y in ys[1:]]
        + [[x, n] for x in reversed(xs[:-1])]
        + [[w, y] for y in reversed(ys[:-1])]
    )


def keywords(entry: dict) -> list[str]:
    domain, kind = entry.get('domain', []), entry.get('kind', [])
    if unknown := (set(domain) - DOMAINS) | (set(kind) - KINDS):
        raise ValueError(f"{entry['id']}: unknown domain or kind {sorted(unknown)}")
    return domain + kind


def item(entry: dict) -> dict:
    w, s, e, n = entry.get('bbox') or GLOBAL
    start, end = entry.get('start'), entry.get('end')
    props = {
        'datetime': None if start and end else UNKNOWN_DATETIME,
        'title': entry['title'],
        'description': entry.get('description') or entry.get('summary') or entry['title'],
        'keywords': keywords(entry),
        'license': entry['license'],
        'providers': providers(entry),
        'leap:source': entry.get('source', 'leap'),
    }
    if start and end:
        props |= {'start_datetime': start, 'end_datetime': end}
    else:
        props['leap:temporal_unknown'] = True
    if text := entry.get('license_text'):
        props['leap:license_text'] = text
    props |= {f"leap:{k}": entry[k] for k in LEAP_PROPS if entry.get(k) is not None}
    if cube := entry.get('cube'):
        # One JSON string: as columns, parquet would get a struct field per variable name in the whole catalog.
        props['leap:cube'] = json.dumps(cube, separators=(',', ':'))
    return {
        'type': 'Feature',
        'stac_version': '1.1.0',
        'stac_extensions': STAC_EXTENSIONS,
        'id': entry['id'],
        'geometry': {'type': 'Polygon', 'coordinates': [footprint(w, s, e, n)]},
        'bbox': [w, s, e, n],
        'properties': props,
        'links': links(entry),
        'assets': {store['key']: asset(store) for store in entry['stores']},
    }


def relabel(entry: dict, cube: dict[str, dict]) -> dict[str, dict]:
    """Cube with the entry's hand-written `labels` and `units` applied, and `m s**-1` units written `m s-1`."""
    labels, units = entry.get('labels', {}), entry.get('units', {})
    if unknown := (labels.keys() | units.keys()) - {n for c in cube.values() for n in c['cube:variables']}:
        raise ValueError(f"{entry['id']}: unknown variables {sorted(unknown)}")

    def variable(name: str, v: dict) -> dict:
        out = v | ({'long_name': labels[name]} if name in labels else {})
        unit = units.get(name, v.get('unit'))
        return out | {'unit': unit.replace('**', '')} if unit else out

    return {
        key: c | {'cube:variables': {n: variable(n, v) for n, v in c['cube:variables'].items()}}
        for key, c in cube.items()
    }


def with_metadata(entry: dict, metadata: dict[str, dict]) -> dict:
    """Entry with the gaps filled from its stores' metadata: dates and bbox span them, resolutions are listed."""
    stores = {s['key']: metadata[key] for s in entry['stores'] if (key := f"{entry['id']}/{s['key']}") in metadata}
    found = list(stores.values())
    filled: dict = {}
    if dated := [m for m in found if 'start' in m]:
        filled |= {'start': min(m['start'] for m in dated), 'end': max(m['end'] for m in dated)}
    if boxes := [m['bbox'] for m in found if 'bbox' in m]:
        w, s, e, n = zip(*boxes)
        filled['bbox'] = [min(w), min(s), max(e), max(n)]
    for k in ('spatial_resolution', 'time_resolution'):
        if values := list(dict.fromkeys(m[k] for m in found if k in m)):
            filled[k] = ', '.join(values)
    if cube := {key: {k: m[k] for k in ('cube:dimensions', 'cube:variables')} for key, m in stores.items()}:
        filled['cube'] = relabel(entry, cube)
    return filled | entry


def fetch_json(url: str) -> dict:
    with urllib.request.urlopen(url, timeout=60) as r:
        return json.load(r)


def dynamical_collections(root: str = DYNAMICAL) -> list[dict]:
    children = [link['href'] for link in fetch_json(root)['links'] if link['rel'] == 'child']
    if not children:
        raise ValueError(f"no child collections in {root}")  # else the upload would drop every dynamical item
    with ThreadPoolExecutor(8) as pool:
        return list(pool.map(fetch_json, children))


def dynamical_entry(c: dict, now: str) -> dict:
    """datasets.yaml-shaped entry for a dynamical.org Collection; open-ended time ranges end at `now`."""
    native, https = c['assets']['icechunk'], c['assets']['icechunk-https']
    [bbox] = c['extent']['spatial']['bbox']
    [[start, end]] = c['extent']['temporal']['interval']
    links = [link for link in c['links'] if link['rel'] not in DYNAMICAL_TREE_RELS]
    summary = {k: v[0] for k, v in c.get('summaries', {}).items() if v}
    entry = {
        'id': c['id'],
        'title': c['title'],
        'summary': c['description'],
        'description': c.get('description_summary') or c['description'],
        'domain': ['atmosphere'],
        'kind': ['forecast' if 'forecast' in c['id'] else 'analysis'],
        'license': c['license'],
        'providers': c['providers'],
        'bbox': bbox,
        'start': start,
        'end': end or now,
        'source': 'dynamical',
        'links': links,
        'stores': [
            {
                'key': 'data',
                # Some stores (Cloudflare R2) are https-only; those get no s3 alternate.
                'href': native['href'] if native['href'].startswith('s3://') else https['href'],
                'https': https['href'].rstrip('/'),
                'format': 'icechunk',
                'name': native.get('title'),
                'virtual': 'icechunk:virtual_chunk_containers' in native,
            }
        ],
    } | {k: summary[k] for k in ('spatial_domain', 'spatial_resolution', 'time_resolution') if k in summary}
    entry |= {k: c[k] for k in DYNAMICAL_PROPS if k in c}
    if 'cube:variables' in c:
        variables = {n: {k: v[k] for k in CUBE_VARIABLE_KEYS if k in v} for n, v in c['cube:variables'].items()}
        entry['cube'] = {'data': {'cube:dimensions': c['cube:dimensions'], 'cube:variables': variables}}
    if end is None:
        entry['ongoing'] = True
    if c['license'] == 'other':
        title = next((link.get('title') for link in links if link['rel'] == 'license'), None)
        if not title:
            raise ValueError(f"{c['id']}: license 'other' needs a titled license link")
        entry['license_text'] = title
    return entry


def load_items(
    path: Path = DATASETS,
    collections: list[dict] | None = None,
    now: str | None = None,
    featured: list[str] | None = None,
) -> list[dict]:
    metadata = json.loads(METADATA.read_text())
    entries = [with_metadata(e, metadata) for e in yaml.safe_load(path.read_text())]
    now = now or datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    leap_ids = {e['id'] for e in entries}
    entries += [dynamical_entry(c, now) for c in collections or [] if c['id'] not in leap_ids]
    by_id = {e['id']: e for e in entries}
    assert len(by_id) == len(entries), 'duplicate dataset ids'
    for rank, dataset_id in enumerate(featured or [], start=1):
        if dataset_id not in by_id:
            raise ValueError(f"{FEATURED.name}: unknown dataset {dataset_id}")
        by_id[dataset_id]['featured'] = rank
    return [item(e) for e in entries]


async def write(items: list[dict], out: Path) -> None:
    # snappy: the web app's hyparquet reads it without extra codecs (ZSTD needs a plugin).
    await rustac.write(str(out), items, parquet_compression='snappy')
    back = (await rustac.read(str(out)))['features']
    assert len(back) == len(items), (len(back), len(items))


async def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--out', type=Path, default=Path('catalog.parquet'))
    ap.add_argument('--no-dynamical', action='store_true', help='skip the dynamical.org crawl (offline builds)')
    args = ap.parse_args()

    if args.no_dynamical:
        items = load_items()  # the featured list names dynamical.org datasets too
    else:
        items = load_items(collections=dynamical_collections(), featured=yaml.safe_load(FEATURED.read_text()))
    await write(items, args.out)
    print(f"wrote {len(items)} items ({sum(len(i['assets']) for i in items)} assets) -> {args.out}")


if __name__ == '__main__':
    asyncio.run(main())
