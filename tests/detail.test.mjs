import assert from 'node:assert/strict'
import { test } from 'node:test'
import { dimensionRows, variableRows } from '../utils/cube.ts'
import { jsonLd } from '../utils/json-ld.ts'
import {
  cfDates,
  dataRange,
  fillValue,
  mapBounds,
  sampleBox,
} from '../utils/map.ts'

const cube = {
  'cube:dimensions': {
    time: {
      type: 'temporal',
      extent: ['2021-05-01T06:00:00Z', null],
      unit: 'seconds since 1970-01-01',
    },
    lat: { type: 'spatial', axis: 'y', extent: [-89.5, 89.5], size: 180 },
    season: { type: 'other', values: ['DJF', 'MAM', 'SON'], size: 3 },
  },
  'cube:variables': {
    tas: { dimensions: ['time', 'lat'], unit: 'K', long_name: 'Air temp' },
    pr: { dimensions: ['time'], comment: 'none' },
  },
}

test('dimension rows: open time range, values, no time unit', () => {
  const [time, lat, season] = dimensionRows(cube)
  assert.deepEqual(time, {
    name: 'time',
    size: '',
    from: '2021-05-01T06:00',
    to: 'present',
    unit: '',
  })
  assert.deepEqual([lat.size, lat.from, lat.to], ['180', '-89.5', '89.5'])
  assert.deepEqual([season.from, season.to], ['DJF', 'SON'])
})

test('variables are sorted and filter on name or label', () => {
  assert.deepEqual(
    variableRows(cube).map((v) => v.name),
    ['pr', 'tas'],
  )
  assert.equal(variableRows(cube)[0].label, '')
  assert.deepEqual(
    variableRows(cube, ' AIR ').map((v) => v.name),
    ['tas'],
  )
})

test('cf time: units, bigint, calendars JavaScript cannot express', () => {
  assert.deepEqual(cfDates([0n, 31n], 'days since 2000-01-01'), [
    '2000-01-01',
    '2000-02-01',
  ])
  assert.deepEqual(cfDates([1.5], 'hours since 1970-01-01 00:00:00'), [
    '1970-01-01 01:30',
  ])
  assert.equal(cfDates([1], 'days since 2000-01-01', 'noleap'), undefined)
  assert.equal(cfDates([1], 'months since 2000-01-01'), undefined)
  assert.equal(cfDates([1], 'm'), undefined)
})

test('colour range ignores missing values and outliers', () => {
  const values = Array.from({ length: 101 }, (_, i) => i)
  assert.deepEqual(dataRange([...values, NaN, Infinity]), [2, 98])
  assert.equal(dataRange([NaN]), undefined)
  assert.equal(dataRange([3, 3, 3]), undefined)
})

test('map bounds stay inside mercator', () => {
  assert.deepEqual(mapBounds([-180, -90, 180, 90]), [
    [-180, -85],
    [180, 85],
  ])
})

test('large grids are sampled around the centre', () => {
  const box = [
    [-180, -80],
    [180, 80],
  ]
  assert.deepEqual(sampleBox(box, 100, 400)[0], [-180, -80])
  assert.deepEqual(sampleBox(box, 400, 100).slice(0, 3), [
    [-90, -40],
    [90, -40],
    [90, 40],
  ])
})

test('fill values: plain numbers and the base64 that xarray writes', () => {
  assert.equal(fillValue('AAAAAPBp+MA='), -99999)
  assert.equal(fillValue('AAAAAAAA+H8='), undefined) // NaN
  assert.equal(fillValue(-9999), -9999)
  assert.equal(fillValue('none'), undefined)
})

const detail = {
  slug: 'x',
  title: 'X',
  description: '</script><script>alert(1)</script>',
  bbox: [-180, -90, 180, 90],
  tags: [],
  citations: [],
  stores: [],
  provenance: { providers: [] },
  start: '0120-01-01T00:00:00Z',
  end: '0200-01-01T00:00:00Z',
}

test('json-ld cannot close its script element; model years are left out', () => {
  const s = jsonLd(detail)
  assert.doesNotMatch(s, /</)
  const parsed = JSON.parse(s)
  assert.equal(parsed.description, detail.description)
  assert.equal(parsed.temporalCoverage, undefined)
})
