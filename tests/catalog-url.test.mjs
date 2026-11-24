import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isAllowedCatalog } from '../utils/catalog-url.ts'

test('allows LEAP OSN buckets only', () => {
  const ok = 'https://nyu1.osn.mghpcc.org/leap-pangeo-pipeline/catalog/x.parquet'
  assert.ok(isAllowedCatalog(ok))
  for (const bad of [
    'http://169.254.169.254/latest/meta-data',
    'http://nyu1.osn.mghpcc.org/leap-pangeo-pipeline/x.parquet',
    'https://nyu1.osn.mghpcc.org.evil.com/leap-pangeo-pipeline/x.parquet',
    'https://nyu1.osn.mghpcc.org@evil.com/leap-pangeo-pipeline/x.parquet',
    'https://nyu1.osn.mghpcc.org/leap-pangeo-x/../other/x.parquet',
    'https://nyu1.osn.mghpcc.org/leap-pangeo-x/%2e%2e/other/x.parquet',
    'not a url',
  ])
    assert.equal(isAllowedCatalog(bad), false, bad)
})
