import type { Store } from '@/types/types'

const icechunkStorage = (store: Store) => {
  // https-only stores (e.g. Cloudflare R2) have no s3:// alternate.
  if (store.nativeUrl!.startsWith('https://'))
    return `icechunk.http_storage('${store.url}')`
  const s3 = new URL(store.nativeUrl!)
  const https = new URL(store.url)
  const prefix = s3.pathname.slice(1)
  // AWS buckets need a region; S3-compatible hosts (OSN) need an endpoint.
  const place = https.hostname.endsWith('amazonaws.com')
    ? `region='${https.hostname.match(/s3\.([\w-]+)\.amazonaws/)?.[1]}'`
    : `endpoint_url='${https.origin}'`
  return `icechunk.s3_storage(bucket='${s3.hostname}', prefix='${prefix}', ${place}, anonymous=True)`
}

const zarrGroup = (store: Store) =>
  store.group ? `, group='${store.group}'` : ''

const zarrSnippet = (store: Store) => {
  const https = new URL(store.url)
  if (
    !store.nativeUrl?.startsWith('s3://') ||
    https.hostname.endsWith('amazonaws.com')
  )
    return `import xarray as xr

ds = xr.open_zarr('${store.url}'${zarrGroup(store)})
`
  // Some OSN stores have no consolidated metadata; https cannot list their arrays, so xarray would see none.
  const s3 = new URL(store.nativeUrl)
  return `import xarray as xr
from obstore.store import S3Store
from zarr.storage import ObjectStore

store = S3Store('${s3.hostname}', prefix='${s3.pathname.slice(1)}', endpoint='${https.origin}', region='us-east-1', skip_signature=True, virtual_hosted_style_request=False)
ds = xr.open_zarr(ObjectStore(store, read_only=True)${zarrGroup(store)})
`
}

export const openSnippet = (store: Store) =>
  store.format === 'icechunk'
    ? `import icechunk
import xarray as xr

storage = ${icechunkStorage(store)}
${
  store.virtual
    ? `# Virtual store: allow anonymous reads of the chunk containers it references.
# GRIB-backed virtual stores also need \`pip install gribberish\`.
config = icechunk.Repository.fetch_config(storage)
creds = icechunk.containers_credentials({
    p: icechunk.Credentials.HttpAccess() if p.startswith('http') else icechunk.s3_anonymous_credentials()
    for p in config.virtual_chunk_containers
})
repo = icechunk.Repository.open(storage, authorize_virtual_chunk_access=creds)`
    : 'repo = icechunk.Repository.open(storage)'
}
session = repo.readonly_session('main')
ds = xr.open_zarr(session.store${zarrGroup(store)})
`
    : zarrSnippet(store)

export const findSnippet = (
  store: Store,
  itemId: string,
  catalogUrl: string,
) => {
  const scheme = store.nativeUrl?.startsWith('gs://') ? 'gcs' : 's3'
  const href =
    store.nativeUrl && store.nativeUrl !== store.url
      ? `["alternate"]["${scheme}"]["href"]`
      : `["href"]`
  return `import rustac

item = rustac.search_sync('${catalogUrl}', ids=['${itemId}'])[0]
href = item["assets"]["${store.id}"]${href}
`
}
