# LEAP data catalog modernization plan

This file holds the working plan and the context any agent or contributor needs to pick up the work. Update the status boxes as PRs land.

Last updated: 2026-11-23

## Status

| #   | PR                                                              | Covers        | Branch                    | Status                                                          |
| --- | --------------------------------------------------------------- | ------------- | ------------------------- | --------------------------------------------------------------- |
| 0   | Housekeeping: save the reference branch, cut `modernize`        | -             | -                         | [x]                                                             |
| 0.5 | Design research notes (no code)                                 | 3.1           | -                         | [x] `docs/design-research.md`                                   |
| 1   | STAC source of truth and stac-geoparquet build                  | 1.1           | `modernize-01-stac-build` | [x] merged into `modernize` (#185, squash)                      |
| 2   | Web app reads the STAC parquet; Python snippet; search examples | 1.2, 1.3      | `modernize-02-web-stac`   | [x] merged into `modernize` (#186)                              |
| 3   | zarr-layer viewer on current stores, ncview-js link removed     | 5.1           | `modernize-03-viewer`     | [x] merged into `modernize` (#187)                              |
| 3.5 | Quick UI fixes from the first review                            | -             | `modernize-03b-ui-fixes`  | [x] merged into `modernize` (#188); parquet uploaded 2026-11-23 |
| 4   | Merge dynamical.org STAC; scheduled rebuild                     | 2.1           | `modernize-04-dynamical`  | [x] merged into modernize (#189); first CI upload 2026-11-24 |
| 5   | Metadata enrichment (datacube), editorial pass, variable table  | 2.2           | `modernize-05-metadata`   | [ ]                                                             |
| 6   | Search, facets, featured ranking                                | 3.1           | `modernize-06-search`     | [ ]                                                             |
| 7   | GCS to icechunk 2 on OSN (`main` + `viz` branches), repoint     | 4.1, 4.2, 5.2 | `modernize-07-arco`       | [ ]                                                             |
| 8   | Shut down the fly.io services                                   | 5.3           | -                         | [ ]                                                             |

Next up: PR 5 (metadata enrichment), on a branch off `modernize`. Work stays on `modernize`; it does not merge to `main` yet.
Small follow-ups:

- Vercel preview deploys fail on `modernize` and on #187-#189 (not caused by PR 4). Read the Vercel build log.

- eslint 10 vs `eslint-config-next` peer warnings and Node 23 engine warnings. Pin eslint 9 or use Node 22/24.
- The OSTIA store is empty.
- The default colour range in the viewer.

Branching:

- `modernize` is a long-lived branch cut from an up-to-date `main`.
- Each PR branches from `modernize` once the previous PR has merged into it, and targets `modernize`.
- **Never merge `modernize` into `main`.** All PRs target `modernize`. Only the user merges to `main`. Agents also do not merge any PR unless the user explicitly asks.

---

## Context

### Why

The site still uses the pangeo-forge model:

- Every dataset ("feedstock") had a `meta.yaml` file.
- Those files were collated into `consolidated-web-catalog.json` in `leap-stc/data-management`, which the site fetches.

Pangeo-forge is no longer used, and the format is bespoke. The site also depends on two fly.io services:

- `html-reprs.fly.dev` renders xarray HTML reprs.
- `ncview-js.staging.carbonplan.org` is the old viewer, backed by zarr-proxy.

### Goals

1. A standard STAC catalog, stored as one stac-geoparquet file, that both the site and Python users can read.
2. The dynamical.org datasets merged in, to widen the public dataset options.
3. Better metadata, keyword facets and fast search, with a light "featured" ranking.
4. LEAP public datasets moved from GCS to OSN as icechunk 2 repos. Each repo has a time-series branch and a web-viz branch.
5. A zarr-layer viewer reading icechunk directly, with the fly.io services shut down.

### What `main` looks like today

- Next.js 16 App Router on Vercel, with no static export (`next.config.mjs` is empty). The UI uses `@carbonplan/components` and theme-ui.
- `utils/get-feedstocks.ts` fetches `https://raw.githubusercontent.com/leap-stc/data-management/main/catalog/output/consolidated-web-catalog.json` with `revalidate: 3600`.
- `types/types.ts` defines the `Feedstock`, `Store`, `Provenance` and `Maintainer` types.
- `app/feedstock/[slug]/page.tsx` uses `generateStaticParams`. Because `dynamicParams` defaults to true, an unknown slug renders on demand.
- `utils/get-xarray-html-repr.ts` calls `html-reprs.fly.dev`. It is used by `app/feedstock/[slug]/dataset-repr*.tsx`.
- `app/feedstock/[slug]/data-viewer.tsx` links to ncview-js.
- The home page and search live in `components/catalog.tsx`, `components/search-box.tsx` and `components/tag-filter.tsx`.

### Reference branch: `arco-icechunk2`

An earlier prototype of almost all of this lives on `arco-icechunk2` (also on `origin`). Use it as a reference, not a base: copy a piece only where it holds up. It contains:

| Path on `arco-icechunk2`                                                                                  | What it is                                                                                    | Reuse?                                        |
| --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `scripts/seed_datasets.py`                                                                                | consolidated JSON to `catalog/datasets.yaml`                                                  | Yes, adapted to one Item per dataset          |
| `scripts/build_catalog.py`                                                                                | yaml to stac-geoparquet via `rustac`; `asset()` href translation; dynamical merge; `--upload` | Yes, see the fixes below                      |
| `scripts/enrich_datasets.py`                                                                              | lazy metadata reads into `catalog/metadata.json`                                              | Yes, in PR 5; it writes datacube fields       |
| `scripts/build_pyramids.py`                                                                               | icechunk 2 rewrites (pyramid, flat, copy, upgrade, virtual layouts) into `arco/<id>.icechunk` | Partly, in PR 7, adding the two-branch layout |
| `scripts/with_osn.py`                                                                                     | runs a command with OSN keys from an rclone remote in env vars                                | Yes, as is                                    |
| `catalog/datasets.yaml`, `catalog/metadata.json`, `catalog/arco.json`                                     | curated entries (about 40), enriched metadata, ARCO build results                             | Yes, as input data                            |
| `utils/get-feedstocks.ts`                                                                                 | hyparquet loader                                                                              | Yes, in PR 2                                  |
| `app/feedstock/[slug]/zarr-map-viewer.tsx`, `utils/crs.ts`, `utils/store-schema.ts`, `utils/store-url.ts` | zarr-layer + maplibre viewer, CRS resolution, store probing                                   | Yes, in PR 3                                  |
| `components/catalog.tsx`, `components/feedstock-table.tsx`                                                | facet UI                                                                                      | Ideas only, in PR 6                           |

ARCO builds already done on the reference branch, recorded in `catalog/arco.json`. All of these are in `s3://leap-pangeo-pipeline/arco/`:

| Dataset                       | Layout  |
| ----------------------------- | ------- |
| climsim-lowres, enatl60-60m   | upgrade |
| corrdiff-nyc, llc4320-agulhas | virtual |
| gotm-raw, gotm-sf             | copy    |
| gpcp-daily, grace-tws         | flat    |

These are single-branch repos. PR 7 decides whether to keep them, add a `viz` branch, or rebuild them.

### Design flaws in the reference branch to fix

- **Items.** Use one STAC Item per dataset with one asset per store. The branch makes one row per store and regroups rows by `title`.
- **Providers.** `providers` must be STAC Provider objects (`{name, roles, url}`), not strings.
- **Custom fields.** Custom fields take a `leap:` prefix (`leap:featured`, `leap:source`, `leap:viewer`). Facet terms go in the standard `keywords` field.
- **Variables.** Use the Datacube extension (`cube:dimensions`, `cube:variables`) instead of the ad-hoc `variables` / `n_variables` fields. It also replaces html-reprs.
- **Asset access.** Do not use the storage extension for now. Each asset carries an https `href` (browser) plus `alternate.s3.href` (alternate-assets extension) with the `s3://` URI for Python.
- **Validation.** Every Item is checked against the vendored JSON schemas in tests. The branch never validated.

---

## Decisions

- **Catalog location: OSN, not GCS.**
  - Write path: `s3://leap-pangeo-pipeline/catalog/catalog.parquet` on endpoint `https://nyu1.osn.mghpcc.org`.
  - Public URL: `https://nyu1.osn.mghpcc.org/leap-pangeo-pipeline/catalog/catalog.parquet`.
  - Why: the data is moving to OSN (PR 7), OSN has no egress fees, and the team already chose this location in October 2026.
- **Source of truth: `catalog/datasets.yaml` in this repo.** It is hand-edited and reviewed in PRs. The per-feedstock yaml files in `leap-stc/data-management` are retired.
- **Rebuilds.**
  - Manual rebuild: `uv run scripts/build_catalog.py --out catalog.parquet`, then `uv run python scripts/with_osn.py uv run --locked scripts/upload_catalog.py catalog.parquet`. From PR 4 the `build-catalog` workflow does this. `with_osn.py` uses the `leappipeline` remote by default; pass `--remote <name>` first to pick another.
  - PR 4 adds a GitHub Action that rebuilds weekly and on pushes to `catalog/datasets.yaml`.
  - The Action uses an OSN write key stored as a GitHub secret. Picking or creating a scoped key is the user's call.
- **New datasets need no redeploy.** Detail pages render on demand and revalidate hourly. Keep this, and add `export const revalidate = 3600` to the detail page to make it explicit.
- **External tooling.** Add an "Open in stac-map" link (devseed) only. Do not embed stac-map or adopt stac-browser: both are item and map explorers, not dataset catalogs.
- **Data stays where it is when the bucket is not LEAP's.** ERA5 and cm26 (`gs://cmip6`), ldeo-hpd (CarbonPlan AWS), GLAD, NASA RASI and NEX-GDDP stay external. `leap-pangeo-manual` already counts as OSN.

## Constraints and conventions

- **Python.**
  - Use `uv` (never pip or conda). Scripts are PEP 723 (`# /// script`) so `uv run scripts/x.py` works.
  - Use `pathlib` for paths, type hints on every function signature, small functions, and no large nested try/except blocks.
  - Use `obstore` / `obspec` / `obspec-utils` for cloud I/O, not fsspec, gcsfs or s3fs.
- **Tests.** Run `uv run pytest tests/<file>.py`. Tests must pass offline (vendored schemas, saved fixtures).
- **Cloud data.**
  - Locally, only lazy reads: metadata, dims, coords.
  - Anything heavier (copies, rechunks, pyramids, value checks) runs on a Coiled VM in-region. Prefer graviton `r/m/c8g` or `c9g` instances.
  - Large GCS stores need an explicit go from the user before copying.
- **Credentials.**
  - OSN write keys come from the user's rclone remote `leappipeline` (pipeline bucket) or `leapinbox` (inbox bucket).
  - Pass them only as the `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` env vars. Never print them, write them to a file, or commit them.
  - Never pass pipeline keys through LEAP-batch-jobs `job_env`: those inputs and the SkyPilot logs are public.
- **Data safety.**
  - Never delete originals. Virtual icechunk refs depend on them.
  - Repoint catalog hrefs only after a verified build.
- **Process.** Ask for go / no-go before major changes, and keep diffs small.

## Known gotchas

- **icechunk-js 0.6.0:** `session.getSnapshotMetadata()` throws `RangeError: Offset is outside the bounds of the DataView` on typed-vector flexbuffer values. Read arrays directly and avoid that call.
- **SSR:** dynamically import `maplibre-gl`, `icechunk-js` and `@carbonplan/zarr-layer` (`next/dynamic`, `ssr: false`), or the build breaks.
- **Old Pangeo OSN (`ncsa.osn.xsede.org`)** times out on every request. Its 12 entries were dropped.
- **Curvilinear grids** (LLC4320, eNATL) get no pyramid.
- **CASM:** the old `CASM/casm.zarr` was all NaN and has been deleted. The real data is `CASM/obstore/casm.zarr`, and the raw `.nc` files are in `leap-pangeo-manual/CASM`. Invalid or empty stores may be wiped.
- **Virtualizing a zarr v2 source** with `ZarrParser` needs `arro3-core`.
- **Dotted bucket names** break virtual-hosted TLS. Use path-style https URLs for them (see `asset()` on the reference branch).
- **CORS on OSN:**
  - Simple GETs, including a bounded `Range: bytes=a-b` (CORS-safelisted), get `access-control-allow-origin: *` from any origin.
  - Preflights (OPTIONS) return 403 unless the origin is `https://catalog.leap.columbia.edu` and no headers are requested. So a suffix range `bytes=-N` or any custom header fails everywhere, including production.
  - Chromium on localhost: no range gives 200, `bytes=0-10` gives 206, `bytes=-10` fails to fetch.
- **CORS elsewhere:** every https href the browser reads needs a CORS rule on its bucket. `build_catalog.py` on the reference branch has a `browser_readable()` preflight check to reuse.
- **lat/lon jitter:** float32-jittered lat/lon must be snapped to an exact linspace before topozarr. See the reference branch's commit `87e073e`.

---

## Step 0: housekeeping

1. On `arco-icechunk2`, commit the modified files plus `utils/format.ts` as a WIP reference commit, then push it.
   - Do not commit `catalog.parquet`, `scripts/__pycache__/` or this `PLAN.md`.
2. Run `git checkout main && git pull`.
3. Run `git checkout -b modernize`, commit `PLAN.md` there, then `git push -u origin modernize`.

## Step 0.5: design research (about 1 hour, no code)

- Review dynamical.org's catalog, the source.coop catalog and the Earthmover marketplace.
- Write short notes covering card layout, facets, featured items, detail page structure, access snippets and the map preview.
- Done: notes are in `docs/design-research.md`, kept in the repo so agents can read them. They inform PR 2, PR 5 and PR 6.

## PR 1 (1.1): STAC source of truth and stac-geoparquet build

Python only; no web change.

New files:

- `catalog/datasets.yaml`: one entry per dataset with a `stores:` list. Start from the reference branch's file and regroup rows that share a `title`.
- `scripts/seed_datasets.py`: one-off conversion from consolidated-web-catalog.json.
  - Drop the `ncsa.osn.xsede.org` entries.
  - Map `stores[]` to assets.
  - Map `maintainers` to providers with role `processor`.
  - Map `links` to STAC links.
- `scripts/build_catalog.py` (PEP 723): reads the yaml, builds Items, and writes `catalog.parquet` with `rustac`. Upload moved to `scripts/upload_catalog.py` in PR 4.
- `scripts/with_osn.py`: copied from the reference branch.
- `tests/test_build_catalog.py`, offline:
  - Structural checks: required fields, unique ids, Provider objects, an https `href` for every `s3://` or `gs://` source, and `leap:` prefixes on custom fields.
  - Schema checks: Items validate against the STAC 1.1 Item and alternate-assets schemas, vendored in `tests/schemas/`, using `jsonschema`.
- `pyproject.toml`: minimal, dev deps only (pytest, jsonschema, rustac, pyyaml, obstore).

Item shape:

```yaml
type: Feature
stac_version: 1.1.0
stac_extensions: [alternate-assets]
id: <dataset-id>
bbox / geometry: global by default
properties:
  datetime: null
  start_datetime: ...
  end_datetime: ...
  title: ...
  description: ...
  keywords: [...]
  license: <SPDX id or "other">
  providers: [{ name, roles, url }]
links: [license link, source repo, docs]
assets:
  <store-name>:
    href: https://...
    type: <zarr/icechunk media type, matching dynamical.org>
    roles: [data]
    title: ...
    alternate:
      s3:
        href: s3://...
```

Done when:

- `uv run scripts/build_catalog.py --out catalog.parquet` writes a file that validates.
- `uv run pytest tests/test_build_catalog.py` passes with no network.
- `rustac.search("catalog.parquet", q="ocean")` returns rows.
- The file is uploaded to OSN, `curl -I` on the public URL returns 200, and a CORS preflight from a browser origin succeeds.

### PR 1 implementation notes (2026-11-23)

What was built:

- `catalog/datasets.yaml` holds 25 datasets and 40 stores. It was produced by a one-off regroup of the reference branch's curated yaml, not re-seeded from the consolidated JSON, so the curated summaries, domain/kind values and fixed hrefs are kept. `scripts/seed_datasets.py` was not ported because a re-seed would discard that curation.
- Each yaml entry now holds `stores: [{key, name, href, format, group?, virtual?}]`, and the `key` becomes the asset key.
  - Single-store datasets use `data`.
  - Multi-store dataset ids are the shared id prefix (`ldeo-hpd`, `era5`, `ceres-ebaf`, and so on).
- `start`, `end` and `bbox` come from the reference `metadata.json`, unioned across each dataset's stores.
- Licenses are normalized to SPDX ids. 10 datasets are `other`: they keep their original text in `leap:license_text`, or a `license` link when the original was a URL. That cleanup belongs to PR 5.
- Providers are objects. The build adds `LEAP` with role `host` when any store is in a `leap-pangeo-*` bucket.
- Two typos were fixed: `Zendodo` and a comma-joined name.
- The icechunk media type is `application/x-icechunk`, matching dynamical.org. Zarr uses `application/vnd+zarr`.
- Custom fields: `leap:summary`, `leap:spatial_domain`, `leap:coverage`, `leap:spatial_resolution`, `leap:time_resolution` and `leap:featured` (int rank, 4 datasets) on Items; `leap:group` and `leap:virtual` on assets.

Known limits:

- Four datasets have no known time range: corrdiff-nyc, gotm, caravan, glad-lclu. They get a placeholder `datetime` of 1970-01-01 plus `leap:temporal_unknown: true`. PR 5 must fill real extents.
  - Datasets with no known bbox default to global, so bbox searches over-match until PR 5.
- `rustac.search(..., q=...)` free-text search is ignored on geoparquet and returns every item. Use CQL2 instead, e.g. `filter="a_contains(keywords, 'ocean')"`. Use this in the PR 2 snippet and examples.

Checks:

- The OSN CORS preflight passes for origin `https://catalog.leap.columbia.edu` (GET).
- Preview and localhost origins are untested and may need a CORS rule for `npm run dev`.

Upload (done 2026-11-23, user approved overwrite):

- `uv run python scripts/with_osn.py uv run --locked scripts/upload_catalog.py catalog.parquet` (no bare `python` on PATH).
- `https://nyu1.osn.mghpcc.org/leap-pangeo-pipeline/catalog/catalog.parquet` returns 200, 83473 bytes. A remote `rustac.search_sync(url, filter="a_contains(keywords, 'ocean')")` returns 7 items.
- This replaced the reference branch's 2026-10-05 build, so `arco-icechunk2` previews now read the new schema and may break. That branch is reference only.

Follow-ups (2026-11-23):

- [x] PR #185 squash-merged into `modernize` (the repo allows squash merges only).
- [x] Step 0.5 notes: `docs/design-research.md`.
- [x] CORS check. Preflight from `http://localhost:3000` and Vercel preview origins returns 403; only `https://catalog.leap.columbia.edu` is allowed. The pipeline key gets AccessDenied on `GetBucketCors`, so it cannot change the rule either; that needs the OSN/LEAP bucket admins.
  - PR 2 is not blocked: `getFeedstocks` runs in server components (`app/page.tsx`, `app/feedstock/[slug]/page.tsx`), and server fetches do not use CORS. Keep the parquet read server-side.
  - PR 3 turned out not to be affected; see "PR 3 implementation notes". Browser reads skip the preflight.

Tests: `uv run pytest tests/test_build_catalog.py` runs 14 tests offline. Schemas are vendored in `tests/schemas/` with a `manifest.json` mapping each URL to its file. To refresh them, re-crawl `item.json` and the extension schemas.

## PR 2 (1.2 + 1.3): web app reads STAC; Python snippet; search examples

- `utils/get-feedstocks.ts`:
  - Read the parquet with `hyparquet` (`parquetReadObjects`) and map each Item to the existing `Feedstock` / `Store` types, so components barely change.
  - Read the URL from `NEXT_PUBLIC_CATALOG_URL`, with the OSN URL as the default. Keep the `?catalog=` override.
- `types/types.ts`: add the fields components need (`keywords`, assets). Remove the pangeo-forge-only fields once nothing uses them.
- `app/feedstock/[slug]/code-snippet.tsx`: Python access through the catalog: `rustac.search(url, ids=[...])`, then the asset href, then `xr.open_zarr(...)` or icechunk `open_session`.
- `app/feedstock/[slug]/page.tsx`: add `export const revalidate = 3600`.
- README section plus `examples/search_catalog.py`:
  - rustac search by keyword, bbox and datetime
  - DuckDB `read_parquet` over https
  - opening a found asset with xarray
- Add an "Open in stac-map" link pointing at the parquet URL.
- html-reprs stays until PR 5. (Superseded: removed in PR 3.5.)

Added after PR 1 and step 0.5 (2026-11-23):

- **Read the parquet on the server.** Keep `getFeedstocks` in server components (`app/page.tsx`, `app/feedstock/[slug]/page.tsx`). OSN CORS only allows `https://catalog.leap.columbia.edu`, so a browser read fails on localhost and Vercel previews.
- **Free-text search.** `rustac` `q=` free text does nothing on geoparquet. Snippets and examples use CQL2, e.g. `filter="a_contains(keywords, 'ocean')"`.
- **hyparquet decoding.**
  - The parquet is snappy-compressed, so `hyparquet` needs no extra codecs.
  - Nested columns (`assets`, `providers`, `links`) decode to JS objects. `datetime` / `start_datetime` / `end_datetime` decode as timestamps; check whether they come back as `Date` or BigInt.
  - `bbox` is a struct (`xmin`/`ymin`/`xmax`/`ymax`) in stac-geoparquet, not an array.
  - Geometry is WKB; skip it.
- **Mapping to the existing types** (keeps components mostly untouched):

  | `Feedstock` field         | From the Item                                                                                                                                                    |
  | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `slug`                    | `id`                                                                                                                                                             |
  | `title`                   | `title`                                                                                                                                                          |
  | `description`             | `description`                                                                                                                                                    |
  | `tags`                    | `keywords`                                                                                                                                                       |
  | `provenance.providers`    | `providers`                                                                                                                                                      |
  | `provenance.license`      | `license` (show `leap:license_text` when the license is `other`)                                                                                                 |
  | `provenance.license_link` | `links[rel=license]`                                                                                                                                             |
  | `links`                   | `links[rel=via]`                                                                                                                                                 |
  | `stores[]`                | one per asset; `url` is the native `alternate.*.href`, falling back to the https `href`; keep the https href for the browser; `name` is the asset `title` or key |
  - `maintainers` has no source. Default it to `[]` and hide the section when it is empty.
  - Slugs change from `slugify(title)` to the Item id, so old `/feedstock/<slug>` links can 404. This is acceptable; do not add redirects.

- **Snippet** (`code-snippet.tsx`), following `docs/design-research.md`. Use two tabs with a copy button if `@carbonplan/components` makes that cheap; otherwise use one block. Each tab must work as pasted:
  - **open:** an icechunk repo via `icechunk.s3_storage(bucket=..., prefix=..., endpoint_url=..., anonymous=True)` + `readonly_session("main")` + `xr.open_zarr(session.store)`, or a zarr store via `xr.open_zarr(<https or s3 href>)`.
  - **find:** `rustac.search_sync(CATALOG_URL, ids=[id])`, then `assets[key]["alternate"]["s3"]["href"]`.
- **Examples.** `examples/search_catalog.py` is a PEP 723 uv script. Its keyword and bbox queries run against the live OSN URL; it never opens data beyond metadata.

Done when:

- `npm run build` passes.
- `npm run dev` shows the home page, search, a detail page, and a correct snippet.
- A slug that is missing from the build renders on demand.

### PR 2 implementation notes (2026-11-23)

What was built (an agent wrote it and the lead reviewed it; 4 commits on `modernize-02-web-stac`):

- `utils/get-feedstocks.ts`: fetches the whole parquet on the server with `fetch(url, { next: { revalidate: 3600 } })`, decodes it with `hyparquet` `parquetReadObjects`, and maps Items per the table above.
  - hyparquet fills every key of the union asset struct, so absent fields come back as `null`; the mapper filters them.
- `Store.url` is the https href, used by the browser, html-reprs and the viewer. `Store.nativeUrl` is the `alternate.*.href`. `Store.format` is `zarr` or `icechunk`; `Store.virtual` comes from `leap:virtual`.
- `public` and `geospatial` are hard-coded true. `ncviewjs:meta_yaml_url` is set from the `via` link so the Repository block still renders.
- Snippet:
  - The `open` tab uses `icechunk.s3_storage(..., anonymous=True)`, with `endpoint_url` for OSN and `region` for AWS.
  - Virtual stores add `authorize_virtual_chunk_access` with anonymous credentials for every `config.virtual_chunk_containers` prefix. Without it, metadata opens but chunk reads fail.
  - The `find` tab does a `rustac` id lookup.
- The "Open in stac-map" link is `https://developmentseed.org/stac-map/?href=<encoded parquet url>`. It has not been opened in a browser.
- `examples/search_catalog.py` covers keyword (7 hits), bbox, datetime (14 hits) and DuckDB (7 rows).

Verified:

- `npm run build` passes, and `next start` lists 25 datasets.
- Snippets opened lazily for a zarr store (cm26), an icechunk store (GPCP-daily) and a virtual icechunk store (nasa-rasi HISTORICAL).
- `uv run pytest tests/` gives 14 passed.

Known issues:

- `leap-pangeo-pipeline/OSTIA/OSTIA.zarr` has global attrs but no arrays, so `open_zarr` returns an empty dataset. This is a data problem: fix the store or drop it. Other stores were not checked for emptiness.
- `/feedstock/[slug]` builds as dynamic (`ƒ`), not ISR, probably because of the `?catalog=` searchParams. The fetch is still cached for an hour.
- Not tested: the `find` tab run as pasted, and the tab and copy buttons in a real browser.

Merged as #186. The user ran it locally with `npm run dev` on 2026-11-23 and it works.

## PR 3 (5.1, early): zarr-layer viewer on current stores

- Add `@carbonplan/zarr-layer`, `zarrita` and `maplibre-gl`, dynamically imported. Port `zarr-map-viewer.tsx`, `utils/crs.ts`, `utils/store-schema.ts` and `utils/store-url.ts` from the reference branch.
- Show the viewer only where an asset has `leap:viewer: true` in `datasets.yaml`: rectilinear, web-sized chunks, CORS-readable. Other datasets show no map until their `viz` branch exists in PR 7.
- Remove the ncview-js link (`data-viewer.tsx`). After this PR nothing in the app uses zarr-proxy.

Decisions made at the start of PR 3 (2026-11-23):

- **CORS: read directly, no proxy.** The proxy planned at the start was built, then removed in review (`d86cb12`). The viewer's requests (icechunk-js + zarr-layer) are all CORS-safelisted (none, or bounded Range), and OSN answers them with `allow-origin: *`. See "Known gotchas". The browser test from localhost read every flagged store directly.
- **The `viewer: true` flag goes on stores in `datasets.yaml`.** `build_catalog.py` copies it to `leap:viewer`.
- **Local testing before upload:** serve a local build over http and set `NEXT_PUBLIC_CATALOG_URL` to it. After rebuilding the parquet, delete `.next/cache/fetch-cache`. Uploading to OSN needs the user's go.

### PR 3 implementation notes (2026-11-23)

What was built (an agent wrote it and the lead reviewed it; 4 commits on `modernize-03-viewer`, stacked on `modernize-02-web-stac`):

- `app/feedstock/[slug]/zarr-map-viewer.tsx`: maplibre + `@carbonplan/zarr-layer` + `icechunk-js`, loaded with `next/dynamic` and `ssr: false`. It has a variable select, a colorbar with a range control, and a slider for each non-spatial dim.
  - Icechunk only, EPSG:4326 only; `zarrita` and `crs.ts` are not ported.
  - It mounts only when the store expander is open.
- `utils/store-schema.ts`: `arraysFromStore()` reads per-node metadata and avoids `getSnapshotMetadata()`.
- `data-viewer.tsx`: the ncview-js link is gone. Nothing references zarr-proxy any more; the only remaining hit is a README link to the ncview-js issues page.
- Deps: `@carbonplan/zarr-layer` ^0.11, `maplibre-gl` ^5.24, `icechunk-js` ^0.6.

Viewer stores (8). Each passed a lazy metadata probe: 1-D lat/lon, chunks of 0.5 MB or less, on OSN.

- gpcp-daily, metaflux daily and monthly, grace-tws, glab-vod, lcspp-avhrr (about 265 requests per view, so slow), pisco eo and tmax.

Rejected, with the reason:

- Chunks too big: era5, chirps, casm, modis-lai, ldeo-hpd.
- Curvilinear or 2-D coords: cm26, llc4320, enatl60, corrdiff, srtm.
- Not a lat/lon grid: climsim, gotm, caravan.
- No CORS: ldeo-hpd, glad-lclu.
- Unknown dim names: pco2-testbed (`ylat`/`xlon`).
- Groups not supported by the viewer: ceres-ebaf. Chunks are 0.26 MB, so this is a cheap win once group support exists.
- nex-gddp: 1,414 arrays in groups.
- OSTIA: empty store.
- nasa-rasi: unverified. CORS and chunks are fine, but the virtual chunk read drew a near-blank canvas.

Verified:

- `npm run build` passes; `uv run pytest tests/` gives 15 passed.
- Playwright from `http://localhost:3000` with no proxy: all 8 stores create a map canvas and every OSN data request succeeds.
  - The only failures are the old `html-reprs.fly.dev` calls, which fail from localhost.
  - Canvas dumps for gpcp, grace, glab and lcspp show real colour variation (hundreds of colours).
  - metaflux and pisco show 2 colours, which is consistent with the 0-1 default range saturating. Check by eye.

Open issues (for PR 5 or PR 7):

- The default colour range is 0-1 when the metadata has no `valid_min`/`valid_max`, so several variables saturate until the range is dragged. Use per-variable defaults.
- The map does not fit to the dataset bbox.
- ceres-ebaf needs group support. pco2-testbed needs `ylat`/`xlon` added to the LAT/LON dim sets.
- Catalog rebuilt from `modernize-03-viewer` and uploaded 2026-11-23: 84674 bytes, 25 items, 8 `leap:viewer` assets. The live site reads it only once PR 2 is deployed.

## PR 3.5: quick UI fixes from the first review (2026-11-23)

From the user's first click-through of the local app. Small, bounded fixes only; design changes go to the UI/UX review in PR 6. All four are done; see the implementation notes below for what was actually built.

- **Next.js dev overlay shows "1 issue".** Open the overlay, record the error, fix it. Likely a hydration or key warning; unknown until read.
- **Metadata panel fails** with "Failed to load dataset representation: NetworkError". Cause: it calls `html-reprs.fly.dev` (`utils/get-xarray-html-repr.ts`), not OSN, so the OSN CORS fix does not help. Fix now: hide the panel (or show "coming soon"). PR 5 replaces it with a `cube:*` table and PR 8 shuts the service down.
- **"Access Data" section on a detail page (e.g. OSTIA).** The asset key renders as all-caps `DATA`. Make "Access Data" itself the expander/button and show the asset title, not the raw key (`app/feedstock/[slug]/stores.tsx:148`).
- **"Open in stac-map" draws the catalog wrong.** Bboxes in the parquet are valid (checked 2026-11-23), but 23 of 25 are global (-180..180, about -90..90), and stac-map draws those as thin lines along the antimeridian on its globe. Try: check the WKB geometry, densify the global polygon or clamp latitude to about +-85. If stac-map still cannot draw global footprints, remove the link (`app/feedstock/[slug]/details.tsx:39`).

Done when: `npm run build` passes; `npm run dev` shows no Next.js issue badge; OSTIA and gpcp-daily detail pages show no error panel.

### PR 3.5 implementation notes (2026-11-23)

- **Next.js issue:** `legacyBehavior` on the card `<Link>` (deprecated in Next 16). `components/feedstock-card.tsx` now uses a plain `<Link>` with an inline style; theme-ui `Box as={Link}` fails typecheck on `href`.
- **Metadata panel:** the html-repr code is deleted, not hidden: `utils/get-xarray-html-repr.ts` and `app/feedstock/[slug]/dataset-repr*.tsx`. PR 5 only adds the `cube:*` table.
- **Access Data:** with one store, "Access Data" is the expander itself. With several, the header stays and each expander shows the asset title. No uppercase.
- **stac-map:** the cause is the 4-corner polygon. On a globe, every corner of a global box sits on the antimeridian, so it draws as a line. `build_catalog.py` `footprint()` now adds a vertex every 10 degrees; `bbox` is unchanged.
  - Checked in Chrome by swapping the local build in for the OSN URL (Playwright route): global boxes draw as outlines along latitude lines.
  - Rebuilt parquet uploaded to OSN 2026-11-23 (90062 bytes); the live stac-map link reads it.
- Verified: `uv run pytest tests/` gives 16 passed; `npm run build` passes; Playwright on `/`, ostia, gpcp-daily and metaflux shows no console errors and no issue badge.

## PR 4 (2.1): merge dynamical.org STAC; scheduled rebuild

- In `build_catalog.py`, crawl `https://stac.dynamical.org/catalog.json` and convert its Collections to Items.
  - Set `leap:source: dynamical`, keep their assets and links, and dedupe by id.
  - Test the mapping against a saved fixture in `tests/fixtures/`.
- Add `.github/workflows/build-catalog.yml`: weekly cron plus a run on push to `catalog/datasets.yaml`. It installs uv, runs the tests, then builds and uploads with OSN secrets.
- The UI gets a source badge or filter for LEAP vs dynamical. (Moved to PR 6 facets; detail pages already list dynamical.org as a provider.)

### PR 4 implementation notes (2026-11-23)

- **Mapping** (`dynamical_entry()`): each Collection becomes a datasets.yaml-shaped entry, so `item()` builds it like any LEAP dataset.
  - One `data` asset: the `icechunk-https` href, plus `alternate.s3` from the `icechunk` asset. The 6 Google WeatherNext stores are https-only on Cloudflare R2 and get no alternate.
  - `leap:virtual` comes from `icechunk:virtual_chunk_containers`. Open-ended intervals end at the build time.
  - Links: their `root`/`self`/`parent` are dropped; `about`, `example`, `via` and `license` are kept.
  - `keywords`: `atmosphere` plus `forecast` or `analysis` from the id. License `other` (5 WeatherNext) gets `leap:license_text` from the first license link title.
  - A datasets.yaml entry with the same id wins. All 49 Collections are included, virtual twins too.
  - `cube:*` is not copied: it is keyed by variable name, so stac-geoparquet would make one struct column per variable across all Items. PR 5 must store it another way (JSON string column or a sidecar file).
- **Snippet:** https-only icechunk stores use `icechunk.http_storage`; virtual-container credentials use `Credentials.HttpAccess()` for http prefixes. GRIB-backed virtual stores need `gribberish`; the snippet says so.
  - Checked by opening noaa-gfs-analysis, noaa-gfs-analysis-virtual and google-weathernext2-forecast-operational-virtual lazily with the snippet code.
- **Upload split:** `scripts/upload_catalog.py` depends only on `obstore`, locked with hashes (`upload_catalog.py.lock`). It refuses non-parquet files and scrubs both key values from error messages. `build_catalog.py --upload` is gone; `--no-dynamical` skips the crawl.
- **Workflow** `.github/workflows/build-catalog.yml`:
  - Build job (no secrets): pytest, build with the live crawl, artifact.
  - Upload job: only on main/modernize, never on PRs. Environment `osn-catalog` (deployment branches main and modernize). Installs the locked dependency first; the upload step alone gets the secrets and runs `--offline`.
  - Actions pinned to commit SHAs. `contents: read`, `persist-credentials: false`, one upload at a time. zizmor reports no findings.
  - The weekly schedule only runs from the default branch, so it starts once `modernize` reaches `main`. Pushes to `modernize` that touch the catalog sources upload right away. Manual `workflow_dispatch` runs also need the workflow on the default branch.
  - Remaining risk: anyone who can push to main or modernize can edit the workflow to read the secrets. `main` does not require PR reviews.
- **Secrets (2026-11-23):** the user set `OSN_ACCESS_KEY_ID` and `OSN_SECRET_ACCESS_KEY` on the `osn-catalog` environment by piping them from the rclone `leappipeline` remote into `gh secret set`, so they never showed on screen.
  - Checked without printing values: environment-only (no repo-wide secrets), branches limited to main and modernize, both values non-empty with no stray whitespace.
  - Neither value appears in shell history, the Claude session transcripts, the working tree, or the repo's git history.
  - First use: run 45298954443 (push to modernize after the #189 merge). Both jobs passed; the log shows the keys only as `***`, and a local check confirmed neither real value appears in the saved log. The public parquet is 112,993 bytes, 74 Items (25 leap, 49 dynamical).
- **Verified:** `uv run pytest tests/` gives 20 passed; all 49 live Collections build and validate (74 Items, 113 KB); `npm run build` against the local 74-item catalog renders 77 pages; GFS virtual and WeatherNext detail pages return 200 with the right snippet.

## PR 5 (2.2): metadata enrichment and editorial pass

- `scripts/enrich_datasets.py`:
  - Lazy reads only (metadata, dims, coords) that fill `cube:dimensions`, `cube:variables`, the temporal extent and the bbox.
  - Results go to `catalog/metadata.json`. Values in `datasets.yaml` override them.
  - Vendor the datacube schema for the tests.
- Editorial pass on titles, summaries and descriptions. The user reviews the wording.
- Add a variable and dimension table built from `cube:*` where the html-repr panel was (the html-repr code was removed in PR 3.5).

## PR 6 (3.1): search, facets, featured

- Controlled vocabularies, checked by `build_catalog.py`, both stored in `keywords`:
  - domain: atmosphere, ocean, land, hydrology, carbon, cryosphere
  - kind: observations, reanalysis, analysis, simulation, forecast, ML-ready
- `leap:featured` is an integer rank; lower comes first, and unset items are not featured.
- UI, following the step 0.5 notes:
  - Client-side text search over title, summary and keywords.
  - Select-only facet chips.
  - Featured items first, then alphabetical.
  - Update `components/catalog.tsx`, `components/search-box.tsx` and `components/tag-filter.tsx`.

UI/UX review items (user feedback, 2026-11-23):

- **Catalog-level snippet on the home page.** A code block near the top: the catalog parquet URL plus a short `rustac` search (keyword via CQL2, bbox). It shows users the catalog is a STAC file they can query directly.
- **Rethink the "open" / "find" tabs on the detail page.** Users do not see a real difference between them. Options:
  - One block: find the item, then open it, as a single script.
  - Keep "open" as the main snippet and move "find" into an "about this catalog" note that links to the home page snippet.
- **"find" output is opaque.** If it stays, show what it returns: print the item id/title and the resolved `href`, e.g.
  `item = rustac.search_sync(CATALOG_URL, ids=["ostia"])[0]` then `print(item["assets"]["data"]["alternate"]["s3"]["href"])`.
- **More card images.** `utils/thumbnail.ts` hashes each title into a pool of only 8 Unsplash photos, so 25 datasets (more after PR 4) repeat images often.
  - Grow the pool to about 30, matching the current style: satellite/aerial Earth, clouds, ocean, ice, terrain. Unsplash license; keep the same URL params (`auto=format&fit=crop&q=80`).
  - Optional: let an Item set its own image via a STAC asset with `roles: [thumbnail]` in `datasets.yaml`, falling back to the pool. dynamical.org Items may already carry one.

## PR 7 (4.1 + 4.2 + 5.2): icechunk 2 on OSN with time-series and viz branches

1. **Checklist (go/no-go gate).** Inventory every LEAP GCS store: size, zarr version, chunking, CRS, and whether it is curvilinear.
   - Reuse the existing inventory artifact (https://claude.ai/artifact/MpdE8NrcK1sLpVN5LanS8W) where it is still valid.
   - The user approves a per-dataset list.
2. **Migrate.** Add `scripts/migrate_dataset.py <id>`, adapting `build_pyramids.py` from the reference branch. It runs on Coiled only.
   - Output repo: `s3://leap-pangeo-pipeline/arco/<id>.icechunk`.
   - Branch `main`: time-series chunking and sharding chosen by spacetimer. Check the spacetimer API before writing code.
   - Branch `viz`: spatial chunks for web display. High-res rectilinear datasets get topozarr pyramids (pin `topozarr==0.2.0` or newer after checking). Curvilinear datasets get no pyramid.
   - Virtualize instead of rewriting where the source chunks are already good and the original is kept (corrdiff, llc4320). Never delete the originals.
3. **Verify.** Open both branches and compare a sample of values against the source. Record the result in `catalog/arco.json`.
4. **Repoint.** For verified datasets only:
   - Add icechunk assets, with `roles: [data]` for the `main` branch and `roles: [visual]` for the `viz` branch, each recording its branch.
   - Switch the viewer to read the `viz` branch through `icechunk-js` (see the gotcha above).
5. This PR can be split into batches of datasets if it gets too large.

## PR 8 (5.3): shut down the fly.io services

- Starts after PRs 3 and 5 are on `modernize` and the user has deployed them.
- Search the `leap-stc` and `carbonplan` orgs for other users of zarr-proxy, ncview-js and html-reprs.
- Confirm with the user, then scale the fly apps to zero. After one quiet week, destroy them.

---

## Verification for every PR

- **Python:** `uv run pytest tests/` (offline), `uv run scripts/build_catalog.py --out catalog.parquet`, then a `rustac.search` smoke test.
- **Web:** `npm run build`, then `npm run dev`. Check the home page, the facets, one LEAP and one dynamical detail page, the snippet copy button, and the viewer where it is enabled.
- **Data:** only lazy reads locally. Heavier work runs on Coiled with the user's approval.

## Open questions

- The spacetimer API and its recommended encodings (PR 7).
- OSN CORS preflights deny every origin except production and allow no request headers. Simple GETs work everywhere, so this only matters if a client starts sending suffix ranges or custom headers. Ask the admins to allow `Range` in preflights? (low priority)
- Which OSN key the GitHub Action uses (PR 4).
- Whether to keep, add a `viz` branch to, or rebuild the 8 existing single-branch ARCO repos (PR 7).
