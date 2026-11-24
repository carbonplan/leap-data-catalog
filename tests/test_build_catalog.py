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
import upload_catalog as uc

SCHEMAS = Path(__file__).parent / 'schemas'
MANIFEST: dict[str, str] = json.loads((SCHEMAS / 'manifest.json').read_text())
ITEM_SCHEMA = 'https://schemas.stacspec.org/v1.1.0/item-spec/json-schema/item.json'
# STAC common-metadata fields and extension prefixes allowed in item properties.
STANDARD_PROPS = {
    'datetime', 'start_datetime', 'end_datetime', 'title', 'description', 'keywords', 'license', 'providers',
}
# SPDX ids in use; add new ones here after checking https://spdx.org/licenses/.
LICENSES = {
    'Apache-2.0', 'CC-BY-4.0', 'CC-BY-NC-4.0', 'CC-BY-NC-ND-4.0', 'CC0-1.0', 'other',
}
# Trimmed dynamical.org Collections: s3 native, s3 virtual, R2 https-only with license 'other'.
DYNAMICAL: list[dict] = json.loads((Path(__file__).parent / 'fixtures' / 'dynamical_collections.json').read_text())
NOW = '2026-11-23T00:00:00Z'


def retrieve(uri: str) -> Resource:
    return Resource.from_contents(json.loads((SCHEMAS / MANIFEST[uri]).read_text()))


REGISTRY = Registry(retrieve=retrieve)


@pytest.fixture(scope='module')
def items() -> list[dict]:
    return bc.load_items(collections=DYNAMICAL, now=NOW)


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
        assert p['license'] in LICENSES, (item['id'], p['license'])
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


def test_dynamical_items(items: list[dict]) -> None:
    by_id = {i['id']: i for i in items}
    gfs = by_id['noaa-gfs-analysis']
    assert gfs['properties']['leap:source'] == 'dynamical'
    assert gfs['properties']['leap:model_name'] == 'NOAA GFS'
    assert gfs['properties']['leap:attribution'].startswith('NOAA NWS NCEP GFS data')
    assert gfs['properties']['end_datetime'] == NOW and gfs['properties']['leap:ongoing'] is True
    assert 'leap:ongoing' not in by_id['ostia']['properties']
    assert not {link['rel'] for link in gfs['links']} & bc.DYNAMICAL_TREE_RELS
    data = gfs['assets']['data']
    assert data['href'] == 'https://dynamical-noaa-gfs.s3.us-west-2.amazonaws.com/noaa-gfs-analysis/v0.1.0.icechunk'
    assert data['alternate']['s3']['href'] == 's3://dynamical-noaa-gfs/noaa-gfs-analysis/v0.1.0.icechunk'
    assert data['leap:virtual'] is False and by_id['noaa-gfs-analysis-virtual']['assets']['data']['leap:virtual']
    wn = by_id['google-weathernext2-forecast-operational-virtual']
    assert wn['assets']['data']['href'].startswith('https://google-weathernext2.r2.dynamical.org/')
    assert 'alternate' not in wn['assets']['data']
    assert wn['properties']['license'] == 'other' and wn['properties']['leap:license_text']
    assert by_id['ostia']['properties']['leap:source'] == 'leap'


def test_closed_interval_is_not_ongoing() -> None:
    c = json.loads(json.dumps(DYNAMICAL[0]))
    c['extent']['temporal']['interval'][0][1] = '2025-01-01T00:00:00Z'
    assert 'ongoing' not in bc.dynamical_entry(c, NOW)


def test_bad_input_fails_the_build(monkeypatch: pytest.MonkeyPatch) -> None:
    with pytest.raises(ValueError, match='antimeridian'):
        bc.footprint(170, -10, -170, 10)
    no_license_link = dict(DYNAMICAL[0], license='other', links=[])
    with pytest.raises(ValueError, match='license'):
        bc.dynamical_entry(no_license_link, NOW)
    monkeypatch.setattr(bc, 'fetch_json', lambda url: {'links': []})
    with pytest.raises(ValueError, match='no child collections'):
        bc.dynamical_collections()


def test_leap_id_wins_over_dynamical() -> None:
    clash = dict(DYNAMICAL[0], id='ostia')
    items = bc.load_items(collections=[clash], now=NOW)
    assert [i['properties']['leap:source'] for i in items if i['id'] == 'ostia'] == ['leap']


def test_upload_scrubs_keys(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv('AWS_ACCESS_KEY_ID', 'AKIDEXAMPLE')
    monkeypatch.setenv('AWS_SECRET_ACCESS_KEY', 's3cr3t')
    assert uc.scrub('<AWSAccessKeyId>AKIDEXAMPLE</AWSAccessKeyId> s3cr3t') == '<AWSAccessKeyId>***</AWSAccessKeyId> ***'


def test_upload_refuses_non_parquet(tmp_path: Path) -> None:
    bad = tmp_path / 'catalog.parquet'
    bad.write_text('not parquet')
    with pytest.raises(SystemExit, match='not a parquet file'):
        uc.main(bad)
    assert uc.is_parquet(b'PAR1' + b'x' * 8 + b'PAR1')
