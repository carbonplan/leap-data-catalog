import { Feedstock, Store, StoreFormat } from '@/types/types'
import { getColor } from '@/utils/colors'
import { decodeFlexBuffer } from '@/utils/flexbuf'
import { slugify } from '@/utils/slugify'
import { toHttpUrl } from '@/utils/store-url'
import { getThumbnail } from '@/utils/thumbnail'
import { HttpStorage, Repository } from 'icechunk-js'

// basal catalog: a single icechunk repo where each branch (except "main") is a
// dataset whose HEAD snapshot metadata carries that entry. Override at build
// time with NEXT_PUBLIC_CATALOG_REPO or per-request with ?catalog=<url>.
const defaultCatalogUrl =
  process.env.NEXT_PUBLIC_CATALOG_REPO ||
  'https://carbonplan-share.s3.us-west-2.amazonaws.com/basal/public_icechunk_catalog'

type Meta = Record<string, unknown>

interface MetadataItem {
  name: string
  value: Uint8Array
}

const str = (m: Meta, ...keys: string[]): string | undefined => {
  for (const k of keys) {
    const v = m[k]
    if (typeof v === 'string' && v.length > 0) return v
  }
  return undefined
}

const normalizeFormat = (raw?: string): StoreFormat => {
  const f = (raw ?? '').toLowerCase()
  if (f.includes('csv')) return 'csv'
  if (f.includes('zarr')) return 'zarr'
  return 'icechunk'
}

// Decode snapshot metadata from raw FlexBuffer items. We avoid
// session.getSnapshotMetadata() because the flatbuffers reader it uses throws
// on typed-vector values present in many basal entries; decodeFlexBuffer
// handles them. Per-item try/catch so one bad value can't drop the whole entry.
function readMetadata(session: unknown): Meta {
  const items = (session as { snapshot?: { metadata?: MetadataItem[] } })
    .snapshot?.metadata
  const meta: Meta = {}
  if (!items) return meta
  for (const item of items) {
    try {
      meta[item.name] = decodeFlexBuffer(item.value)
    } catch {
      // skip undecodable item
    }
  }
  return meta
}

function entryToStore(branch: string, meta: Meta): Store | null {
  if (meta['__deleted__']) return null
  const location = str(meta, 'location')
  if (!location) return null

  const format = normalizeFormat(str(meta, 'format'))
  const storageConfig = meta['storage_config'] as
    Record<string, unknown> | undefined
  const url = toHttpUrl(location, storageConfig) ?? location

  // cached variables may be a map { name: {...} } or a list of names
  const rawVars = meta['variables']
  const variables = Array.isArray(rawVars)
    ? rawVars.filter((v): v is string => typeof v === 'string')
    : rawVars && typeof rawVars === 'object'
      ? Object.keys(rawVars as Record<string, unknown>)
      : undefined
  const bbox =
    Array.isArray(meta['bbox']) && (meta['bbox'] as unknown[]).length === 4
      ? (meta['bbox'] as number[] as [number, number, number, number])
      : undefined

  const cfgStr = (k: string): string | undefined =>
    typeof storageConfig?.[k] === 'string'
      ? (storageConfig[k] as string)
      : undefined

  return {
    id: branch,
    name: str(meta, 'title', 'name') ?? branch,
    url,
    format,
    location,
    storageConfig: storageConfig
      ? {
          type: cfgStr('type'),
          bucket: cfgStr('bucket'),
          prefix: cfgStr('prefix'),
          region: cfgStr('region'),
        }
      : undefined,
    feedstock: str(meta, 'feedstock', 'feedstock_url'),
    branch,
    public: true,
    geospatial: format !== 'csv',
    variables,
    bbox,
    last_updated: str(meta, 'end_datetime', 'last_updated'),
  }
}

// Each basal branch is its own dataset. We render one Feedstock per entry,
// grouping multiple entries only when they share an explicit `feedstock` ref.
function toFeedstocks(stores: Store[], metas: Map<string, Meta>): Feedstock[] {
  const groups = new Map<string, Store[]>()
  for (const s of stores) {
    const key = s.feedstock ?? s.id
    const arr = groups.get(key) ?? []
    arr.push(s)
    groups.set(key, arr)
  }

  return Array.from(groups.values()).map((groupStores) => {
    const first = groupStores[0]
    const meta = metas.get(first.id) ?? {}
    const title = str(meta, 'title', 'name') ?? first.name ?? first.id
    const tags = Array.isArray(meta['tags'])
      ? (meta['tags'] as unknown[]).filter(
          (t): t is string => typeof t === 'string',
        )
      : undefined
    const owner = str(meta, 'owner')

    return {
      title,
      description: str(meta, 'description') ?? '',
      maintainers: owner ? [{ name: owner }] : [],
      provenance: {
        providers: owner ? [{ name: owner }] : [],
        license: str(meta, 'license') ?? '',
        license_link: str(meta, 'license_link')
          ? { title: 'License', url: str(meta, 'license_link') }
          : undefined,
      },
      tags,
      stores: groupStores,
      feedstock: first.feedstock,
      thumbnail: getThumbnail(title),
      slug: slugify(title),
      color: getColor(title),
    }
  })
}

export async function getFeedstocks(catalog?: string): Promise<Feedstock[]> {
  const url = catalog || defaultCatalogUrl

  try {
    const repo = await Repository.open({ storage: new HttpStorage(url) })
    const branches = await repo.listBranches()

    const metas = new Map<string, Meta>()
    const stores: Store[] = []
    for (const branch of branches.filter((b) => b !== 'main')) {
      const session = await repo.checkoutBranch(branch)
      const meta = readMetadata(session)
      const store = entryToStore(branch, meta)
      if (!store) continue
      metas.set(store.id, meta)
      stores.push(store)
    }

    return toFeedstocks(stores, metas).sort((a, b) =>
      a.title.localeCompare(b.title),
    )
  } catch (error) {
    throw new Error(`Failed to read basal catalog: ${error}`)
  }
}
