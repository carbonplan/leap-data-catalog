import { Store } from '@/types/types'
import { parseBucketLocation } from '@/utils/store-url'
import { Button } from '@carbonplan/components'
import { Check, Down } from '@carbonplan/icons'
import { Code } from '@carbonplan/prism'
import React, { useState } from 'react'
import { Box } from 'theme-ui'

// Build the icechunk.Storage constructor call from catalog metadata, falling
// back to a placeholder when the location has no s3/gcs form.
const icechunkStorage = (store: Store): string => {
  const parsed = store.location ? parseBucketLocation(store.location) : null
  const cfg = store.storageConfig
  const bucket = cfg?.bucket ?? parsed?.bucket
  const prefix = cfg?.prefix ?? parsed?.prefix
  const scheme = cfg?.type ?? parsed?.scheme

  if (!bucket || prefix == null) {
    return `# icechunk repo: ${store.url}
storage = icechunk.s3_storage(...)  # configure for the store location`
  }
  if (scheme === 'gs' || scheme === 'gcs') {
    return `storage = icechunk.gcs_storage(
    bucket='${bucket}',
    prefix='${prefix}',
    anonymous=True,
)`
  }
  if (cfg?.endpoint) {
    return `storage = icechunk.s3_storage(
    bucket='${bucket}',
    prefix='${prefix}',
    endpoint_url='${cfg.endpoint}',
    region='${cfg.region ?? 'us-east-1'}',
    force_path_style=True,
    anonymous=True,
)`
  }
  return `storage = icechunk.s3_storage(
    bucket='${bucket}',
    prefix='${prefix}',
    region='${cfg?.region ?? 'us-east-1'}',
    anonymous=True,
)`
}

const getSnippet = (store: Store) => {
  if (store.format === 'icechunk') {
    return `
import icechunk
import xarray as xr

${icechunkStorage(store)}
repo = icechunk.Repository.open(storage)
session = repo.readonly_session(branch='main')
ds = xr.open_zarr(session.store, consolidated=False)
`
  }
  if (store.format === 'csv') {
    return `
import pandas as pd

df = pd.read_csv('${store.url}')
`
  }
  return `
import xarray as xr

store = '${store.url}'
ds = xr.open_dataset(store, engine='zarr')
`
}

interface CodeSnippetProps {
  store: Store
  color: string
}

export const CodeSnippet: React.FC<CodeSnippetProps> = ({ store, color }) => {
  const [copied, setCopied] = useState(false)
  const [tick, setTick] = useState<NodeJS.Timeout | null>(null)

  const handleClick = () => {
    navigator.clipboard.writeText(getSnippet(store))
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

      <Code language='python'>{getSnippet(store)}</Code>
    </Box>
  )
}
