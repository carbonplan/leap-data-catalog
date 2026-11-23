import { Feedstock, Provider, Store } from '@/types/types'
import { getColor } from '@/utils/colors'
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
  'leap:virtual'?: boolean
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
  'leap:license_text'?: string | null
}

function toStore(key: string, asset: Nullable<StacAsset>): Store {
  const native = Object.values(asset.alternate ?? {}).find(Boolean)?.href
  return {
    id: key,
    name: asset.title || key,
    url: asset.href!,
    nativeUrl: native || asset.href!,
    format: asset.type?.includes('icechunk') ? 'icechunk' : 'zarr',
    virtual: asset['leap:virtual'] ?? false,
    public: true,
    geospatial: true,
    xarray_open_kwargs: { engine: 'zarr', chunks: {} },
  }
}

function toFeedstock(item: StacItem, catalogUrl: string): Feedstock {
  const links = item.links ?? []
  const license = links.find((l) => l.rel === 'license')
  const via = links.find((l) => l.rel === 'via')
  const stores = Object.entries(item.assets)
    .filter(([, a]) => a?.href)
    .map(([key, a]) => toStore(key, a!))

  return {
    slug: item.id,
    title: item.title,
    description: item.description,
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
        (item.license === 'other' ? item['leap:license_text'] : null) ??
        item.license ??
        '',
      license_link: license
        ? { title: license.title || 'License', url: license.href }
        : undefined,
    },
    'ncviewjs:meta_yaml_url': via?.href,
    stores,
    catalogUrl,
    color: getColor(item.title),
    thumbnail: getThumbnail(item.title),
  }
}

export async function getFeedstocks(catalog?: string): Promise<Feedstock[]> {
  const url =
    catalog || process.env.NEXT_PUBLIC_CATALOG_URL || defaultCatalogUrl

  try {
    // The file is small (~80 KB): fetch it whole so Next caches it for an hour.
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    const file = await res.arrayBuffer()
    const items = (await parquetReadObjects({ file })) as StacItem[]
    return items.map((item) => toFeedstock(item, url))
  } catch (error) {
    throw new Error(`Failed to fetch feedstocks: ${error}`)
  }
}
