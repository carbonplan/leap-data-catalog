# /// script
# requires-python = ">=3.11"
# dependencies = ["rustac", "duckdb"]
# ///
"""Search the LEAP STAC catalog (stac-geoparquet on OSN). Reads metadata only."""

import duckdb
import rustac

CATALOG = 'https://nyu1.osn.mghpcc.org/leap-pangeo-pipeline/catalog/catalog.parquet'


def show(title: str, items: list[dict]) -> None:
    print(f"\n{title}: {len(items)} items")
    for item in items:
        print(f"  {item['id']}: {item['properties']['title']}")


def main() -> None:
    # Keyword search. `q=` free text is ignored on geoparquet; use CQL2.
    show(
        "keyword 'ocean'",
        rustac.search_sync(CATALOG, filter="a_contains(keywords, 'ocean')"),
    )

    show(
        'bbox over the Agulhas region',
        rustac.search_sync(CATALOG, bbox=[15, -45, 30, -30]),
    )

    show(
        'datetime overlapping 2020',
        rustac.search_sync(CATALOG, datetime='2020-01-01T00:00:00Z/2020-12-31T23:59:59Z'),
    )

    # The same file is plain parquet, so DuckDB can query it over https.
    rows = duckdb.sql(
        f"SELECT id, title FROM read_parquet('{CATALOG}') WHERE list_contains(keywords, 'ocean') ORDER BY id"
    ).fetchall()
    print(f"\nDuckDB, keyword 'ocean': {len(rows)} rows")
    for id_, title in rows:
        print(f"  {id_}: {title}")

    # Find a data href; open it lazily with xarray.
    item = rustac.search_sync(CATALOG, ids=['gpcp-daily'])[0]
    asset = item['assets']['data']
    print('\nopen with icechunk:', asset['alternate']['s3']['href'])
    print('or via https:', asset['href'])
    # import xarray as xr; ds = xr.open_zarr(<zarr https href>)  # lazy, metadata only


if __name__ == '__main__':
    main()
