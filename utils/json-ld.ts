import type { FeedstockDetail } from '@/types/types'

export const SITE = 'https://catalog.leap.columbia.edu'

const hasRealYears = (date?: string) => date && Number(date.slice(0, 4)) >= 1000

/** schema.org Dataset, as text that is safe inside a <script> element. */
export const jsonLd = (f: FeedstockDetail): string => {
  const [w, s, e, n] = f.bbox
  const data = {
    '@context': 'https://schema.org/',
    '@type': 'Dataset',
    name: f.title,
    description: f.description,
    url: `${SITE}/feedstock/${f.slug}`,
    identifier: f.slug,
    keywords: f.tags,
    isAccessibleForFree: true,
    license: f.provenance.license_link?.url,
    version: f.version,
    citation: f.citations.map((c) => c.url),
    creator: f.provenance.providers.map((p) => ({
      '@type': 'Organization',
      name: p.name,
      url: p.url,
    })),
    temporalCoverage: hasRealYears(f.start)
      ? `${f.start!.slice(0, 10)}/${f.ongoing ? '..' : f.end!.slice(0, 10)}`
      : undefined,
    spatialCoverage: {
      '@type': 'Place',
      geo: { '@type': 'GeoShape', box: `${s} ${w} ${n} ${e}` },
    },
    includedInDataCatalog: {
      '@type': 'DataCatalog',
      name: 'LEAP Data Catalog',
      url: SITE,
    },
    distribution: f.stores.map((store) => ({
      '@type': 'DataDownload',
      name: store.name,
      contentUrl: store.url,
      encodingFormat: store.format,
    })),
  }
  // Descriptions come from upstream: "</script>" must not end the element.
  return JSON.stringify(data).replaceAll('<', '\\u003c')
}
