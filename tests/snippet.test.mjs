import assert from 'node:assert/strict'
import { test } from 'node:test'
import { findSnippet, openSnippet } from '../utils/snippet.ts'

const OSN = 'https://nyu1.osn.mghpcc.org'
const osn = (key, extra) => ({
  id: 'data',
  url: `${OSN}/leap-pangeo-pipeline/${key}`,
  nativeUrl: `s3://leap-pangeo-pipeline/${key}`,
  format: 'icechunk',
  ...extra,
})

test('zarr on OSN opens through S3, which can list unconsolidated stores', () => {
  const s = openSnippet(osn('OSTIA/OSTIA.zarr', { format: 'zarr' }))
  assert.match(
    s,
    /S3Store\('leap-pangeo-pipeline', prefix='OSTIA\/OSTIA\.zarr', endpoint='https:\/\/nyu1/,
  )
  assert.match(s, /open_zarr\(ObjectStore\(store, read_only=True\)\)/)
})

test('zarr on gcs and aws opens over https', () => {
  const gcs = 'https://storage.googleapis.com/cmip6/a'
  const aws = 'https://b.s3.us-west-2.amazonaws.com/a.zarr'
  for (const [url, nativeUrl] of [
    [gcs, 'gs://cmip6/a'],
    [aws, 's3://b/a.zarr'],
  ])
    assert.ok(
      openSnippet({ id: 'data', url, nativeUrl, format: 'zarr' }).includes(
        `xr.open_zarr('${url}')`,
      ),
    )
})

test('icechunk uses an endpoint on OSN, a region on AWS, http when https-only', () => {
  assert.match(openSnippet(osn('GPCP-daily')), /endpoint_url='https:\/\/nyu1/)
  assert.match(
    openSnippet({
      id: 'data',
      url: 'https://s3.us-west-2.amazonaws.com/dotted.bucket/x',
      nativeUrl: 's3://dotted.bucket/x',
      format: 'icechunk',
    }),
    /bucket='dotted\.bucket', prefix='x', region='us-west-2'/,
  )
  const r2 = 'https://x.r2.dynamical.org/a.icechunk'
  assert.ok(
    openSnippet({
      id: 'data',
      url: r2,
      nativeUrl: r2,
      format: 'icechunk',
    }).includes(`http_storage('${r2}')`),
  )
})

test('group and virtual', () => {
  assert.match(
    openSnippet(osn('c', { group: 'climatology/monthly' })),
    /session\.store, group='climatology\/monthly'\)/,
  )
  assert.doesNotMatch(openSnippet(osn('c')), /authorize_virtual|group=/)
  assert.match(
    openSnippet(osn('c', { virtual: true })),
    /authorize_virtual_chunk_access=creds/,
  )
})

test('find uses the native alternate, or the href when there is none', () => {
  assert.match(
    findSnippet(osn('c'), 'x', 'u'),
    /\["data"\]\["alternate"\]\["s3"\]/,
  )
  assert.match(
    findSnippet({ id: 'data', url: 'gh', nativeUrl: 'gs://b' }, 'x', 'u'),
    /\["gcs"\]/,
  )
  assert.match(
    findSnippet({ id: 'data', url: 'h', nativeUrl: 'h' }, 'x', 'u'),
    /\["data"\]\["href"\]/,
  )
})
