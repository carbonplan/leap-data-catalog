import { Feedstock, Provider, Store } from '@/types/types'
import { compareTitles, domainColor } from '@/utils/listing'
import { getThumbnail } from '@/utils/thumbnail'
import { parquetReadObjects } from 'hyparquet'

const defaultCatalogUrl =
  'https://nyu1.osn.mghpcc.org/leap-pangeo-pipeline/catalog/catalog.parquet'

// hyparquet fills every key of a union struct, so absent assets and fields are null.
type Nullable<T> = { [K in keyof T]: T[K] | null }

interface StacAsset {
  href: string
  title?: string
  type?: string
  alternate?: { [scheme: string]: { href: string } | null }
  'leap:group'?: string
  'leap:virtual'?: boolean
  'leap:viewer'?: boolean
}

interface StacLink {
  rel: string
  href: string
  title?: string | null
}

interface StacItem {
  id: string
  title: string
  description: string
  keywords?: string[] | null
  license?: string | null
  providers?: Nullable<Provider>[] | null
  links?: StacLink[] | null
  assets: Record<string, Nullable<StacAsset> | null>
  bbox: { xmin: number; ymin: number; xmax: number; ymax: number }
  start_datetime?: Date | null
  end_datetime?: Date | null
  'leap:license_text'?: string | null
  'leap:source': string
  'leap:summary'?: string | null
  'leap:featured'?: bigint | null
  'leap:model_name'?: string | null
  'leap:coverage'?: string | null
  'leap:spatial_domain'?: string | null
  'leap:spatial_resolution'?: string | null
  'leap:time_resolution'?: string | null
  'leap:ongoing'?: boolean | null
  'leap:temporal_unknown'?: boolean | null
}

function toStore(key: string, asset: Nullable<StacAsset>): Store {
  const native = Object.values(asset.alternate ?? {}).find(Boolean)?.href
  return {
    id: key,
    name: asset.title || key,
    url: asset.href!,
    nativeUrl: native || asset.href!,
    format: asset.type?.includes('icechunk') ? 'icechunk' : 'zarr',
    group: asset['leap:group'] ?? undefined,
    virtual: asset['leap:virtual'] ?? false,
    viewer: asset['leap:viewer'] ?? false,
  }
}

const rank = (item: StacItem) =>
  item['leap:featured'] == null ? undefined : Number(item['leap:featured'])

// Featured first, then A-Z: photos cycle in this order, so the featured ones differ.
const byRank = (a: StacItem, b: StacItem) =>
  (rank(a) ?? Infinity) - (rank(b) ?? Infinity) || compareTitles(a, b)

const toLink = (l: StacLink) => ({ label: l.title || l.rel, url: l.href })

function licenseLink(item: StacItem, link?: StacLink) {
  if (link) return { title: link.title || 'License', url: link.href }
  // "other" is the STAC value for a license without an SPDX id.
  return item.license && item.license !== 'other'
    ? {
        title: item.license,
        url: `https://spdx.org/licenses/${item.license}`,
      }
    : undefined
}

function toFeedstock(
  item: StacItem,
  catalogUrl: string,
  index: number,
): Feedstock {
  const links = item.links ?? []
  const license = links.find((l) => l.rel === 'license')
  const via = links.find((l) => l.rel === 'via')
  const stores = Object.entries(item.assets)
    .filter(([, a]) => a?.href)
    .map(([key, a]) => toStore(key, a!))
  const known = !item['leap:temporal_unknown']

  return {
    slug: item.id,
    title: item.title,
    summary: item['leap:summary'] ?? item.description,
    description: item.description,
    origin: item['leap:source'],
    featured: rank(item),
    modelName: item['leap:model_name'] ?? undefined,
    coverage: item['leap:coverage'] ?? undefined,
    spatialDomain: item['leap:spatial_domain'] ?? undefined,
    spatialResolution: item['leap:spatial_resolution'] ?? undefined,
    timeResolution: item['leap:time_resolution'] ?? undefined,
    start: (known && item.start_datetime?.toISOString()) || undefined,
    end: (known && item.end_datetime?.toISOString()) || undefined,
    ongoing: item['leap:ongoing'] ?? false,
    bbox: [item.bbox.xmin, item.bbox.ymin, item.bbox.xmax, item.bbox.ymax],
    tags: item.keywords ?? [],
    maintainers: [],
    provenance: {
      providers: (item.providers ?? []).map((p) => ({
        name: p.name!,
        description: p.description ?? undefined,
        roles: p.roles ?? undefined,
        url: p.url ?? undefined,
      })),
      license:
        (item.license === 'other' ? item['leap:license_text'] : item.license) ??
        '',
      license_link: licenseLink(item, license),
    },
    source: via && toLink(via),
    links: links
      .filter((l) => l.rel === 'about' || l.rel === 'example')
      .map(toLink),
    stores,
    catalogUrl,
    color: domainColor(item.keywords ?? []),
    thumbnail: getThumbnail(index),
  }
}

export async function getFeedstocks(): Promise<Feedstock[]> {
  const url = process.env.CATALOG_URL || defaultCatalogUrl

  try {
    // The file is small (~110 KB): fetch it whole so Next caches it for an hour.
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    const file = await res.arrayBuffer()
    const items = (await parquetReadObjects({ file })) as StacItem[]
    return items.sort(byRank).map((item, i) => toFeedstock(item, url, i))
  } catch (error) {
    throw new Error(`Failed to fetch feedstocks from ${url}: ${error}`)
  }
}
