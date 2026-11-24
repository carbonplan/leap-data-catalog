# carbonplan / leap-data-catalog

**LEAP data catalog**

![GitHub deployments](https://img.shields.io/github/deployments/carbonplan/leap-data-catalog/production?label=vercel)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

This repository contains the prototype for a data catalog for the [LEAP project](https://leap.columbia.edu/). It is built using [Next.js](https://nextjs.org/) and [Vercel](https://vercel.com/).

## to build the site locally

Assuming you already have `Node.js` installed, you can install the build dependencies as:

```shell
npm install .
# or
yarn install
# or
pnpm install
```

To start a development version of the site, simply run:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The site reads a stac-geoparquet file from OSN. Set `NEXT_PUBLIC_CATALOG_URL` to read another one.

## search the catalog

The same file can be searched from Python with [rustac](https://github.com/stac-utils/rustac) or DuckDB:

```bash
uv run examples/search_catalog.py
```

Free-text `q=` does nothing on geoparquet; filter with CQL2, e.g. `rustac.search_sync(url, filter="a_contains(keywords, 'ocean')")`. Browse the catalog on a map with [stac-map](https://developmentseed.org/stac-map/?href=https%3A%2F%2Fnyu1.osn.mghpcc.org%2Fleap-pangeo-pipeline%2Fcatalog%2Fcatalog.parquet).

## license

All the code in this repository is [MIT](https://choosealicense.com/licenses/mit/)-licensed, but we request that you please provide attribution if reusing any of our digital content (graphics, logo, articles, etc.).

## about us

CarbonPlan is a nonprofit organization that uses data and science for climate action. We aim to improve the transparency and scientific integrity of climate solutions with open data and tools. Find out more at [carbonplan.org](https://carbonplan.org/) or get in touch by [opening an issue](https://github.com/carbonplan/ncview-js/issues/new) or [sending us an email](mailto:hello@carbonplan.org).
