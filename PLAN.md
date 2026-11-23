# LEAP data catalog modernization plan

This file holds the working plan and the context any agent or contributor needs to pick up the work. Update the status boxes as PRs land.

Last updated: 2026-11-23

## Status

| # | PR | Covers | Branch | Status |
|---|----|--------|--------|--------|
| 0 | Housekeeping: save the reference branch, cut `modernize` | - | - | [ ] |
| 0.5 | Design research notes (no code) | 3.1 | - | [ ] |
| 1 | STAC source of truth and stac-geoparquet build | 1.1 | `modernize-01-stac-build` | [ ] |
| 2 | Web app reads the STAC parquet; Python snippet; search examples | 1.2, 1.3 | `modernize-02-web-stac` | [ ] |
| 3 | zarr-layer viewer on current stores, ncview-js link removed | 5.1 | `modernize-03-viewer` | [ ] |
| 4 | Merge dynamical.org STAC; scheduled rebuild | 2.1 | `modernize-04-dynamical` | [ ] |
| 5 | Metadata enrichment (datacube), editorial pass, remove html-reprs | 2.2 | `modernize-05-metadata` | [ ] |
| 6 | Search, facets, featured ranking | 3.1 | `modernize-06-search` | [ ] |
| 7 | GCS to icechunk 2 on OSN (`main` + `viz` branches), repoint | 4.1, 4.2, 5.2 | `modernize-07-arco` | [ ] |
| 8 | Shut down the fly.io services | 5.3 | - | [ ] |

Branching:
- `modernize` is a long-lived branch cut from an up-to-date `main`.
- Each PR branches from `modernize` once the previous PR has merged into it, and targets `modernize`.
- `modernize` merges to `main` at two milestones: after PR 2 (the site runs on STAC) and after PR 7 (the data is migrated).

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

| Path on `arco-icechunk2` | What it is | Reuse? |
|---|---|---|
| `scripts/seed_datasets.py` | consolidated JSON to `catalog/datasets.yaml` | Yes, adapted to one Item per dataset |
| `scripts/build_catalog.py` | yaml to stac-geoparquet via `rustac`; `asset()` href translation; dynamical merge; `--upload` | Yes, see the fixes below |
| `scripts/enrich_datasets.py` | lazy metadata reads into `catalog/metadata.json` | Yes, in PR 5; it writes datacube fields |
| `scripts/build_pyramids.py` | icechunk 2 rewrites (pyramid, flat, copy, upgrade, virtual layouts) into `arco/<id>.icechunk` | Partly, in PR 7, adding the two-branch layout |
| `scripts/with_osn.py` | runs a command with OSN keys from an rclone remote in env vars | Yes, as is |
| `catalog/datasets.yaml`, `catalog/metadata.json`, `catalog/arco.json` | curated entries (about 40), enriched metadata, ARCO build results | Yes, as input data |
| `utils/get-feedstocks.ts` | hyparquet loader | Yes, in PR 2 |
| `app/feedstock/[slug]/zarr-map-viewer.tsx`, `utils/crs.ts`, `utils/store-schema.ts`, `utils/store-url.ts` | zarr-layer + maplibre viewer, CRS resolution, store probing | Yes, in PR 3 |
| `components/catalog.tsx`, `components/feedstock-table.tsx` | facet UI | Ideas only, in PR 6 |

ARCO builds already done on the reference branch, recorded in `catalog/arco.json`. All of these are in `s3://leap-pangeo-pipeline/arco/`:

| Dataset | Layout |
|---|---|
| climsim-lowres, enatl60-60m | upgrade |
| corrdiff-nyc, llc4320-agulhas | virtual |
| gotm-raw, gotm-sf | copy |
| gpcp-daily, grace-tws | flat |

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
  - Until PR 4, rebuilds are manual on purpose: `python scripts/with_osn.py uv run scripts/build_catalog.py --out catalog.parquet --upload`. `with_osn.py` uses the `leappipeline` remote by default; pass `--remote <name>` first to pick another.
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
- **CORS:** every https href the browser reads needs a CORS rule on its bucket. `build_catalog.py` on the reference branch has a `browser_readable()` preflight check to reuse.
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
- Save the notes as an artifact and link it here. They inform PR 2 and PR 6.

## PR 1 (1.1): STAC source of truth and stac-geoparquet build

Python only; no web change.

New files:
- `catalog/datasets.yaml`: one entry per dataset with a `stores:` list. Start from the reference branch's file and regroup rows that share a `title`.
- `scripts/seed_datasets.py`: one-off conversion from consolidated-web-catalog.json.
  - Drop the `ncsa.osn.xsede.org` entries.
  - Map `stores[]` to assets.
  - Map `maintainers` to providers with role `processor`.
  - Map `links` to STAC links.
- `scripts/build_catalog.py` (PEP 723): reads the yaml, builds Items, and writes `catalog.parquet` with `rustac`. `--upload` uploads it with `obstore`.
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
  providers: [{name, roles, url}]
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
- html-reprs stays until PR 5.

Done when:
- `npm run build` passes.
- `npm run dev` shows the home page, search, a detail page, and a correct snippet.
- A slug that is missing from the build renders on demand.

## PR 3 (5.1, early): zarr-layer viewer on current stores

- Add `@carbonplan/zarr-layer`, `zarrita` and `maplibre-gl`, dynamically imported. Port `zarr-map-viewer.tsx`, `utils/crs.ts`, `utils/store-schema.ts` and `utils/store-url.ts` from the reference branch.
- Show the viewer only where an asset has `leap:viewer: true` in `datasets.yaml`: rectilinear, web-sized chunks, CORS-readable. Other datasets show no map until their `viz` branch exists in PR 7.
- Remove the ncview-js link (`data-viewer.tsx`). After this PR nothing in the app uses zarr-proxy.

## PR 4 (2.1): merge dynamical.org STAC; scheduled rebuild

- In `build_catalog.py`, crawl `https://stac.dynamical.org/catalog.json` and convert its Collections to Items.
  - Set `leap:source: dynamical`, keep their assets and links, and dedupe by id.
  - Test the mapping against a saved fixture in `tests/fixtures/`.
- Add `.github/workflows/build-catalog.yml`: weekly cron plus a run on push to `catalog/datasets.yaml`. It installs uv, runs the tests, then builds and uploads with OSN secrets.
- The UI gets a source badge or filter for LEAP vs dynamical.

## PR 5 (2.2): metadata enrichment and editorial pass

- `scripts/enrich_datasets.py`:
  - Lazy reads only (metadata, dims, coords) that fill `cube:dimensions`, `cube:variables`, the temporal extent and the bbox.
  - Results go to `catalog/metadata.json`. Values in `datasets.yaml` override them.
  - Vendor the datacube schema for the tests.
- Editorial pass on titles, summaries and descriptions. The user reviews the wording.
- Remove `utils/get-xarray-html-repr.ts` and `app/feedstock/[slug]/dataset-repr*.tsx`. Replace them with a variable and dimension table built from `cube:*`.

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

- Starts after PRs 3 and 5 are on `main`.
- Search the `leap-stc` and `carbonplan` orgs for other users of zarr-proxy, ncview-js and html-reprs.
- Confirm with the user, then scale the fly apps to zero. After one quiet week, destroy them.

---

## Verification for every PR

- **Python:** `uv run pytest tests/` (offline), `uv run scripts/build_catalog.py --out catalog.parquet`, then a `rustac.search` smoke test.
- **Web:** `npm run build`, then `npm run dev`. Check the home page, the facets, one LEAP and one dynamical detail page, the snippet copy button, and the viewer where it is enabled.
- **Data:** only lazy reads locally. Heavier work runs on Coiled with the user's approval.

## Open questions

- The spacetimer API and its recommended encodings (PR 7).
- Whether the OSN bucket's CORS rule allows browser reads of `catalog/` and `arco/` (PR 1, PR 3).
- Which OSN key the GitHub Action uses (PR 4).
- Whether to keep, add a `viz` branch to, or rebuild the 8 existing single-branch ARCO repos (PR 7).
