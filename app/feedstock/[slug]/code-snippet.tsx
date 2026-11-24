import { Store } from '@/types/types'
import { Button } from '@carbonplan/components'
import { Check, Down } from '@carbonplan/icons'
import { Code } from '@carbonplan/prism'
import React, { useState } from 'react'
import { Box } from 'theme-ui'

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

const openSnippet = (store: Store) =>
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
ds = xr.open_zarr(session.store)
`
    : `import xarray as xr

ds = xr.open_zarr('${store.url}')
`

const findSnippet = (store: Store, itemId: string, catalogUrl: string) => {
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

const tabs = ['open', 'find'] as const

interface CodeSnippetProps {
  store: Store
  itemId: string
  catalogUrl: string
  color: string
}

export const CodeSnippet: React.FC<CodeSnippetProps> = ({
  store,
  itemId,
  catalogUrl,
  color,
}) => {
  const [copied, setCopied] = useState(false)
  const [tick, setTick] = useState<NodeJS.Timeout | null>(null)
  const [tab, setTab] = useState<(typeof tabs)[number]>('open')

  const snippet =
    tab === 'open' ? openSnippet(store) : findSnippet(store, itemId, catalogUrl)

  const handleClick = () => {
    navigator.clipboard.writeText(snippet)
    if (tick) {
      clearTimeout(tick)
    }
    setCopied(true)
    const timeout = setTimeout(() => {
      setCopied(false)
    }, 1000)
    setTick(timeout)
  }

  return (
    <Box
      sx={{
        position: 'relative',
        '& pre': { fontSize: '10px', my: 0 },
      }}
    >
      <Box sx={{ display: 'flex', gap: 3, mb: 1 }}>
        {tabs.map((t) => (
          <Button
            key={t}
            size='xs'
            onClick={() => setTab(t)}
            sx={{
              color: t === tab ? color : 'secondary',
              fontFamily: 'mono',
              letterSpacing: 'mono',
              textTransform: 'uppercase',
            }}
          >
            {t}
          </Button>
        ))}
      </Box>
      <Button
        sx={{
          color: color,
          fontSize: [0, 0, 0, 1],
          letterSpacing: 'mono',
          textTransform: 'uppercase',
          fontFamily: 'mono',
          position: 'absolute',
          mt: 2,
          mr: 2,
          right: 0,
          top: 0,
        }}
        suffix={
          copied ? (
            <Check
              sx={{
                transform: ['translateY(-15%)'],
              }}
            />
          ) : (
            <Down sx={{ transform: 'rotate(135deg) translateY(1px)' }} />
          )
        }
        onClick={handleClick}
      >
        {copied ? 'Copied' : 'Copy'}
      </Button>

      <Code language='python'>{snippet}</Code>
    </Box>
  )
}
