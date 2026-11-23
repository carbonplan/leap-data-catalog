# Design research: dataset catalog UX (step 0.5)

Surveyed 2026-11-23 from page text, fetched with curl. Visual styling and JS-only controls such as copy buttons and tabs were not seen. Items marked "not verified" could not be confirmed.

## dynamical.org

Listing (https://dynamical.org/catalog/):
- A single list grouped under provider headings, with a jump index at the top and links to their STAC catalog and STAC browser.
- Each entry has a title, a type tag ("time-optimized", "map-optimized"), and one spec line joined by ` · `: coverage, variable count, resolution, time span, update cadence.
- No thumbnails, search, filters or pagination.

Detail page (`/catalog/noaa-gfs-forecast`), in order:
1. Breadcrumb, notice banner, then the title with status tags.
2. A metadata list: id, domain and resolution, STAC links.
3. Description, then related datasets.
4. Examples: notebooks plus snippets.
5. Explore: map, Dimensions table (min, max, units), Variables table (id, description, units, notes).
6. Details: license, citation with DOI, source, storage, chunks and shards table, compression.

Snippets:
- Snippets are stored as data in STAC: `examples: [{title, variants: [{label, language, code}]}]`.
- There are three variants: their `dynamical_catalog.open(id)` client, pystac + icechunk + xarray, and an LLM "prompt".
- Probably rendered as tabs; not verified.

STAC to UI mapping:
- `cube:dimensions` and `cube:variables` fill the tables. `summaries`, `extent`, `license`, `providers` and `attribution` fill the metadata list. `assets` fill the snippets.
- Description copy is in custom fields (`description_summary`, `description_details`).

## Source Cooperative (https://source.coop/)

- The homepage and `/products` both open with a "Featured" block (4 items) in the same card style as the full list.
- Each card shows title, a 1-2 line description, "Provided by <org> • Published on <date>", a visibility badge, and keyword tag chips.
- Search and facets were not seen; they may be JS-rendered. Detail pages were not seen.
- To avoid: uneven, uncurated descriptions with bare URLs.

## Earthmover marketplace

- `app.earthmover.io/marketplace` is a JS or login app, so no content was seen.
- The marketing page describes datasets as read-only Icechunk repos you subscribe to, with updates arriving as commits. A listing has a name, description, README, license, thumbnail and pricing.
- The site nav groups by domain: weather, climate, ocean, earth observation, geophysics. This is a usable domain taxonomy.

## What LEAP adopts

Adapted to our design, which uses Items and one asset per store with `alternate.s3.href`:

| PR | Adopt |
|----|-------|
| 2 | Render the UI from STAC fields only (`title`, `description`, `leap:summary`, `license`, `providers`, `assets`). No copy hard-coded in components. |
| 2 | Snippet tabs with a copy button. One tab is xarray/icechunk open of the asset's native href; the other is a rustac lookup by id. Search examples use rustac `filter=` (CQL2) and DuckDB `read_parquet`. An LLM "prompt" tab is optional. |
| 5 | Replace the html-repr with a Dimensions table and a Variables table from `cube:dimensions` and `cube:variables`. Add the variable count to cards. |
| 5 | Detail page order: title with tags, metadata list, description, access snippets, explore (map, dimensions, variables), then details (license, citation, source, storage). |
| 6 | Cards get a spec line (coverage · variables · resolution · time span) plus provider and keyword chips. Do not use provider grouping as the only navigation. |
| 6 | Multi-select facet chips for domain and kind, with state in URL query params. Free text searches title, summary, keywords and, after PR 5, variable names. No surveyed site had this, so it is our own design. |
| 6 | A "Featured" block above the full list, ordered by `leap:featured` rank. Same card style as the list. |

Not checked: copy and tab behaviour, sort and pagination, Source Cooperative detail pages, and the Earthmover listing UI.
