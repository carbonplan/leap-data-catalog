import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  domainColor,
  entrySpec,
  facetCounts,
  formatView,
  matches,
  memberName,
  parseView,
  toEntries,
} from '../utils/listing.ts'

const item = (slug, extra) => ({
  slug,
  title: slug,
  summary: '',
  description: '',
  origin: 'leap',
  ongoing: false,
  bbox: [-180, -90, 180, 90],
  tags: [],
  stores: [],
  provenance: { providers: [] },
  ...extra,
})
const years = (a, b) => ({
  start: `${a}-01-01T00:00Z`,
  end: `${b}-12-31T00:00Z`,
})
const spec = (extra) =>
  entrySpec({ title: '', items: [item('x', extra)] }).replaceAll('\u00a0', ' ')
const view = (search = '') => parseView(search)
const titles = (items, search) =>
  toEntries(items, view(search)).map((e) => e.title)

test('view survives the url; defaults give no query; junk is dropped', () => {
  const s =
    '?q=ocean+%28carbon&domain=ocean&domain=carbon&kind=ML-ready&source=leap&map=yes&sort=longest&group=0&view=rows&open=NOAA+GFS'
  assert.equal(formatView(view(s)), s)
  assert.equal(formatView(view()), '')
  assert.equal(formatView(view('?domain=x&sort=toString&view=y&utm=1')), '')
})

test('search: every word, any field, no regex', () => {
  const f = item('era5', {
    title: 'ERA5 (ARCO)',
    provenance: { providers: [{ name: 'Google' }] },
  })
  const hit = (q) => matches(f, { ...view(), q })
  assert.ok(hit('(') && hit('google ERA5') && hit('  ') && hit('leap'))
  assert.ok(!hit('era5 ocean'))
})

test('facets: OR inside, AND across, counts ignore their own selection', () => {
  const all = [
    item('a', { tags: ['ocean', 'forecast'] }),
    item('b', { tags: ['land', 'forecast'] }),
    item('c', { tags: ['land', 'simulation'], stores: [{ viewer: true }] }),
  ]
  const v = view('?domain=ocean&domain=land&kind=forecast')
  assert.deepEqual(
    all.filter((f) => matches(f, v)).map((f) => f.slug),
    ['a', 'b'],
  )
  const [domain, kind, , map] = facetCounts(all, v)
  assert.deepEqual(domain.values, [
    { value: 'ocean', count: 1 },
    { value: 'land', count: 1 },
  ])
  assert.deepEqual(kind.values, [
    { value: 'forecast', count: 2 },
    { value: 'simulation', count: 1 },
  ])
  assert.deepEqual(map.values, [{ value: 'yes', count: 0 }])
})

test('grouping keeps every dataset; a group of one shows as itself', () => {
  const all = ['GFS b', 'GFS a', 'HRRR a'].map((t) =>
    item(t, { modelName: t.split(' ')[0], origin: 'dynamical' }),
  )
  const entries = toEntries([...all, item('GFS')], view())
  assert.deepEqual(
    entries.map((e) => [e.title, e.items.length]),
    [
      ['GFS', 1],
      ['GFS', 2],
      ['HRRR a', 1],
    ],
  )
  assert.equal(toEntries(all, view('?group=0')).length, 3)
})

test('sorting', () => {
  const all = [
    item('Srtm', years(2000, 2000)),
    item('Metaflux', { ...years(2001, 2021), featured: 1 }),
    item('Control', years('0120', '0200')),
    item('Undated'),
    item('A', { ...years(2020, 2026), origin: 'dynamical' }),
  ]
  assert.deepEqual(titles(all, '?sort=longest'), [
    'Control',
    'Metaflux',
    'A',
    'Srtm',
    'Undated',
  ])
  assert.equal(titles(all, '?sort=az')[0], 'A')
  // featured are not repeated first, unless a search hides them above
  assert.deepEqual(titles(all, '')[0], 'Control')
  assert.equal(titles(all, '?q=t').at(0), 'Metaflux')
})

test('spec line leaves out what is missing', () => {
  assert.equal(spec(), '')
  assert.equal(spec(years(1982, 2023)), 'Global · 1982–2023')
  assert.equal(spec(years('0120', '0200')), 'Global · model years 120–200')
  assert.equal(spec({ bbox: [-180, -50, 180, 50] }), '50°S to 50°N')
  assert.equal(spec({ bbox: [0, 0, 10, 10] }), 'Regional')
  assert.equal(spec({ coverage: 'regional' }), 'Regional')
  assert.equal(
    spec({
      ...years(2020, 2026),
      ongoing: true,
      spatialDomain: 'Global',
      spatialResolution:
        '0-240 hours: 0.25 degrees (~20km), 246-840 hours: 0.5 degrees (~40km)',
      timeResolution: 'Forecasts initialized every 1 hours',
    }),
    'Global · 0.25° then 0.5° · hourly · 2020–present',
  )
  assert.equal(
    spec({ spatialDomain: 'Peru', timeResolution: '3.0 hours' }),
    'Peru · 3 hours',
  )
})

test('names in a group drop the model only at a word break', () => {
  const name = (title) => memberName({ title, modelName: 'NOAA RTMA' })
  assert.equal(name('NOAA RTMA analysis, virtual'), 'Analysis, virtual')
  assert.equal(name('NOAA RTMA-RU analysis'), 'NOAA RTMA-RU analysis')
  assert.equal(name('NOAA RTMA'), 'NOAA RTMA')
})

test('first domain follows the fixed order', () => {
  assert.equal(domainColor(['carbon', 'ocean']), domainColor(['ocean']))
  assert.equal(domainColor(['x']), '#a9b4c4')
})
