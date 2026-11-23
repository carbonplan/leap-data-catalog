import { Feedstock, Store, StoreFormat, Variable } from '@/types/types'
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
  group?: string | null
}

interface Row {
  id: string
  // Rows sharing a title (within a source) form one dataset with several stores.
  title: string
  name?: string | null
  summary?: string | null
  description?: string
  license?: string
  providers?: string[]
  keywords?: string[]
  source_url?: string | null
  public?: boolean
  virtual?: boolean
  cors?: boolean | null
  source?: 'leap' | 'dynamical'
  domain?: string[]
  kind?: string[]
  coverage?: 'global' | 'regional' | null
  spatial_domain?: string | null
  spatial_resolution?: string | null
  time_resolution?: string | null
  variables?: Variable[]
  // hyparquet returns int64 as bigint.
  nbytes?: number | bigint | null
  featured?: boolean
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
    name: r.name ?? r.title,
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
    cors: r.cors ?? true,
    mapPreview:
      (r.public ?? true) &&
      (format === 'zarr' || format === 'icechunk') &&
      !r.virtual &&
      (r.cors ?? true),
    vizUrl: viz?.href,
    group: data.group ?? undefined,
    bbox: r.bbox
      ? [r.bbox.xmin, r.bbox.ymin, r.bbox.xmax, r.bbox.ymax]
      : undefined,
    last_updated: r.end_datetime?.toISOString(),
    variables: r.variables ?? [],
    spatialResolution: r.spatial_resolution ?? undefined,
    timeResolution: r.time_resolution ?? undefined,
    start: r.start_datetime?.toISOString(),
    end: r.end_datetime?.toISOString(),
    nbytes: r.nbytes != null ? Number(r.nbytes) : undefined,
  }
}

const unique = (xs: string[]) => Array.from(new Set(xs))

// One dataset per group of rows; metadata comes from the first row, ranges span all.
function toFeedstock(rows: Row[]): Feedstock {
  const [r] = rows
  const providers = unique(rows.flatMap((x) => x.providers ?? []))
  const stores = rows.map(toStore)
  const starts = stores.map((s) => s.start).filter(Boolean) as string[]
  const ends = stores.map((s) => s.end)
  return {
    title: r.title,
    summary: r.summary ?? undefined,
    description: r.description ?? '',
    maintainers: providers.map((name) => ({ name })),
    provenance: {
      providers: providers.map((name) => ({ name })),
      license: r.license ?? '',
    },
    tags: r.keywords,
    stores,
    feedstock: r.source_url ?? undefined,
    thumbnail: getThumbnail(r.title),
    slug: slugify(r.title),
    color: getColor(r.title),
    source: r.source ?? 'leap',
    domain: unique(rows.flatMap((x) => x.domain ?? [])).sort(),
    kind: unique(rows.flatMap((x) => x.kind ?? [])),
    coverage: r.coverage ?? undefined,
    spatialDomain: r.spatial_domain ?? undefined,
    spatialResolution: r.spatial_resolution ?? undefined,
    timeResolution: r.time_resolution ?? undefined,
    start: starts.sort()[0],
    // Any open-ended store makes the dataset open-ended.
    end: ends.includes(undefined)
      ? undefined
      : (ends as string[]).sort().at(-1),
    nVariables: Math.max(...stores.map((s) => s.variables?.length ?? 0)),
    mapPreview: stores.some((s) => s.mapPreview),
    nbytes: stores.some((s) => s.nbytes)
      ? stores.reduce((n, s) => n + (s.nbytes ?? 0), 0)
      : undefined,
    featured: rows.some((x) => x.featured),
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
    const groups = new Map<string, Row[]>()
    for (const r of rows) {
      const key = `${r.source}:${r.title}`
      groups.set(key, [...(groups.get(key) ?? []), r])
    }
    return Array.from(groups.values(), toFeedstock).sort((a, b) =>
      a.title.localeCompare(b.title),
    )
  } catch (error) {
    throw new Error(`Failed to read catalog ${url}: ${error}`)
  }
}
