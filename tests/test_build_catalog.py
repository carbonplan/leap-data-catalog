"""Offline checks for scripts/build_catalog.py: structure plus JSON-schema validation against vendored schemas."""

from __future__ import annotations

import asyncio
import json
import re
from pathlib import Path

import jsonschema
import pytest
import rustac
from referencing import Registry, Resource

import build_catalog as bc

SCHEMAS = Path(__file__).parent / 'schemas'
MANIFEST: dict[str, str] = json.loads((SCHEMAS / 'manifest.json').read_text())
ITEM_SCHEMA = 'https://schemas.stacspec.org/v1.1.0/item-spec/json-schema/item.json'
# STAC common-metadata fields and extension prefixes allowed in item properties.
STANDARD_PROPS = {
    'datetime', 'start_datetime', 'end_datetime', 'title', 'description', 'keywords', 'license', 'providers',
}
SPDX_OR_OTHER = re.compile(r'^[\w\-.+]+$')


def retrieve(uri: str) -> Resource:
    return Resource.from_contents(json.loads((SCHEMAS / MANIFEST[uri]).read_text()))


REGISTRY = Registry(retrieve=retrieve)


@pytest.fixture(scope='module')
def items() -> list[dict]:
    return bc.load_items()


def validate(item: dict) -> None:
    for uri in [ITEM_SCHEMA, *item['stac_extensions']]:
        schema = retrieve(uri).contents
        cls = jsonschema.validators.validator_for(schema)
        cls(schema, registry=REGISTRY).validate(item)


def test_items_validate(items: list[dict]) -> None:
    for item in items:
        validate(item)


def test_invalid_item_fails_schema(items: list[dict]) -> None:
    bad = json.loads(json.dumps(items[0]))
    bad['properties']['providers'] = ['LEAP']  # providers must be objects
    with pytest.raises(jsonschema.ValidationError):
        validate(bad)


def test_ids_unique_and_slugs(items: list[dict]) -> None:
    ids = [i['id'] for i in items]
    assert len(ids) == len(set(ids))
    assert all(re.fullmatch(r'[a-z0-9]+(-[a-z0-9]+)*', i) for i in ids)


def test_custom_props_prefixed(items: list[dict]) -> None:
    for item in items:
        extra = set(item['properties']) - STANDARD_PROPS
        assert all(k.startswith('leap:') for k in extra), (item['id'], extra)
        for a in item['assets'].values():
            assert all(k in {'href', 'type', 'roles', 'title', 'alternate'} or k.startswith('leap:') for k in a)


def test_viewer_flag_copied(items: list[dict]) -> None:
    assert any(a.get('leap:viewer') is True for i in items for a in i['assets'].values())


def test_license_and_providers(items: list[dict]) -> None:
    for item in items:
        p = item['properties']
        assert SPDX_OR_OTHER.match(p['license']), item['id']
        assert p['providers'] and all(isinstance(x, dict) and x['name'] for x in p['providers'])


def test_assets_have_https_and_native_href(items: list[dict]) -> None:
    for item in items:
        for a in item['assets'].values():
            assert a['href'].startswith('https://'), a
            native = next(iter(a.get('alternate', {}).values()), {}).get('href', a['href'])
            assert native.startswith(('s3://', 'gs://', 'https://'))


@pytest.mark.parametrize(
    ('href', 'expected'),
    [
        ('s3://leap-pangeo-pipeline/GPCP-daily', 'https://nyu1.osn.mghpcc.org/leap-pangeo-pipeline/GPCP-daily'),
        ('s3://carbonplan-data-viewer/a.zarr', 'https://carbonplan-data-viewer.s3.us-west-2.amazonaws.com/a.zarr'),
        (
            's3://us-west-2.opendata.source.coop/x/store.icechunk',
            'https://s3.us-west-2.amazonaws.com/us-west-2.opendata.source.coop/x/store.icechunk',
        ),
        ('gs://cmip6/GFDL_CM2_6/control/surface', 'https://storage.googleapis.com/cmip6/GFDL_CM2_6/control/surface'),
        ('https://example.org/a.zarr', 'https://example.org/a.zarr'),
    ],
)
def test_https_href(href: str, expected: str) -> None:
    assert bc.https_href(href) == expected


def test_leap_host_added() -> None:
    entry = {'providers': [{'name': 'Zenodo'}], 'stores': [{'href': 's3://leap-pangeo-pipeline/x'}]}
    assert bc.providers(entry)[-1] == bc.LEAP_HOST
    entry['providers'] = [{'name': 'LEAP'}]
    assert bc.providers(entry) == [{'name': 'LEAP', 'roles': ['host'], 'url': bc.LEAP_HOST['url']}]
    entry['stores'] = [{'href': 'gs://cmip6/x'}]
    assert bc.providers(entry) == [{'name': 'LEAP'}]


def test_temporal(items: list[dict]) -> None:
    for item in items:
        p = item['properties']
        if p['datetime'] is None:
            assert p['start_datetime'] <= p['end_datetime'], item['id']
        else:
            assert p['leap:temporal_unknown'] is True


def test_parquet_roundtrip(items: list[dict], tmp_path: Path) -> None:
    out = tmp_path / 'catalog.parquet'
    asyncio.run(bc.write(items, out))
    hits = rustac.search_sync(str(out), ids=['ostia'])
    assert [h['id'] for h in hits] == ['ostia']
    assert hits[0]['assets']['data']['alternate']['s3']['href'].startswith('s3://')


def test_footprint_densified_and_closed() -> None:
    ring = bc.footprint(-180, -90, 180, 90)
    assert ring[0] == ring[-1] == [-180, -90]
    assert len(ring) == 2 * (36 + 18) + 1
    assert {tuple(p) for p in ring} >= {(-180, -90), (180, -90), (180, 90), (-180, 90)}
    assert bc.footprint(0, 0, 1, 1) == [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]
