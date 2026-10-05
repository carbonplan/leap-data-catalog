import { Feedstock, Store, StoreFormat } from '@/types/types'
import { getColor } from '@/utils/colors'
import { slugify } from '@/utils/slugify'
import { parseBucketLocation } from '@/utils/store-url'
import { getThumbnail } from '@/utils/thumbnail'
import { parquetReadObjects } from 'hyparquet'

// stac-geoparquet catalog (one STAC Item per dataset), built by
// scripts/build_catalog.py. Override at build time with NEXT_PUBLIC_CATALOG_URL
// or per-request with ?catalog=<url>.
const defaultCatalogUrl =
  process.env.NEXT_PUBLIC_CATALOG_URL ||
  'https://nyu1.osn.mghpcc.org/leap-pangeo-pipeline/catalog/catalog.parquet'

interface Asset {
  href: string
  type?: string
  s3_href?: string | null
  endpoint?: string | null
  region?: string | null
}

interface Row {
  id: string
  title: string
  description?: string
  license?: string
  providers?: string[]
  keywords?: string[]
  source_url?: string | null
  public?: boolean
  virtual?: boolean
  start_datetime?: Date | null
  end_datetime?: Date | null
  bbox?: { xmin: number; ymin: number; xmax: number; ymax: number }
  assets: { data: Asset; viz?: Asset | null }
}

const FORMATS: Record<string, StoreFormat> = {
  'application/x-icechunk': 'icechunk',
  'application/vnd+zarr': 'zarr',
  'text/csv': 'csv',
}

function toStore(r: Row): Store {
  const { data, viz } = r.assets
  const format = FORMATS[data.type ?? ''] ?? 'zarr'
  const loc = data.s3_href ? parseBucketLocation(data.s3_href) : null
  return {
    id: r.id,
    name: r.title,
    url: data.href,
    format,
    location: data.s3_href ?? undefined,
    storageConfig: loc
      ? {
          type: loc.scheme,
          bucket: loc.bucket,
          prefix: loc.prefix,
          region: data.region ?? undefined,
          endpoint: data.endpoint ?? undefined,
        }
      : undefined,
    public: r.public ?? true,
    geospatial: format === 'zarr' || format === 'icechunk',
    virtual: r.virtual ?? false,
    vizUrl: viz?.href,
    bbox: r.bbox
      ? [r.bbox.xmin, r.bbox.ymin, r.bbox.xmax, r.bbox.ymax]
      : undefined,
    last_updated: r.end_datetime?.toISOString(),
  }
}

function toFeedstock(r: Row): Feedstock {
  const providers = r.providers ?? []
  return {
    title: r.title,
    description: r.description ?? '',
    maintainers: providers.map((name) => ({ name })),
    provenance: {
      providers: providers.map((name) => ({ name })),
      license: r.license ?? '',
    },
    tags: r.keywords,
    stores: [toStore(r)],
    feedstock: r.source_url ?? undefined,
    thumbnail: getThumbnail(r.title),
    slug: slugify(r.title),
    color: getColor(r.title),
  }
}

export async function getFeedstocks(catalog?: string): Promise<Feedstock[]> {
  const url = catalog || defaultCatalogUrl
  try {
    // Catalog is small (tens of KB); fetch whole file rather than range requests.
    const res = await fetch(url)
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    const rows = (await parquetReadObjects({
      file: await res.arrayBuffer(),
    })) as unknown as Row[]
    return rows
      .map(toFeedstock)
      .sort((a, b) => a.title.localeCompare(b.title))
  } catch (error) {
    throw new Error(`Failed to read catalog ${url}: ${error}`)
  }
}
