import type { Feedstock } from '@/types/types'

// In order: a dataset's first domain sets its tint and dot.
const DOMAINS: Record<string, string> = {
  atmosphere: '#85a2f7',
  ocean: '#64b9c4',
  land: '#7eb36a',
  hydrology: '#bc85d9',
  carbon: '#ea9755',
  cryosphere: '#e587b6',
}
const KINDS = [
  'observations',
  'analysis',
  'reanalysis',
  'forecast',
  'simulation',
  'ML-ready',
]
export const SOURCES: Record<string, string> = {
  leap: 'LEAP',
  dynamical: 'dynamical.org',
}
export const SORTS = {
  featured: 'Featured',
  az: 'A–Z',
  longest: 'Longest record',
} as const
export type Sort = keyof typeof SORTS

const domainsOf = (tags: string[]) =>
  Object.keys(DOMAINS).filter((d) => tags.includes(d))

export const domainColor = (tags: string[]) =>
  DOMAINS[domainsOf(tags)[0]] ?? '#a9b4c4'

export const hasMap = (f: Feedstock) => f.stores.some((s) => s.viewer)

export const compareTitles = (a: { title: string }, b: { title: string }) =>
  a.title.localeCompare(b.title, 'en')

/* Facets */

export type Facet = 'domain' | 'kind' | 'source' | 'map'

export const FACETS: { key: Facet; label: string; values: string[] }[] = [
  { key: 'domain', label: 'Domain', values: Object.keys(DOMAINS) },
  { key: 'kind', label: 'Kind', values: KINDS },
  { key: 'source', label: 'Source', values: Object.keys(SOURCES) },
  { key: 'map', label: 'Preview', values: ['yes'] },
]

export const facetLabel = (facet: Facet, value: string) =>
  facet === 'source' ? SOURCES[value] : facet === 'map' ? 'Has map' : value

const facetValues: Record<Facet, (f: Feedstock) => string[]> = {
  domain: (f) => domainsOf(f.tags ?? []),
  kind: (f) => KINDS.filter((k) => f.tags?.includes(k)),
  source: (f) => [f.origin],
  map: (f) => (hasMap(f) ? ['yes'] : []),
}

/* View: everything a shared url restores */

export interface View extends Record<Facet, string[]> {
  q: string
  sort: Sort
  group: boolean
  layout: 'cards' | 'rows'
  /** Model names of the expanded groups. */
  open: string[]
}

export const parseView = (search: string): View => {
  const p = new URLSearchParams(search)
  const picked = (facet: Facet) =>
    FACETS.find((f) => f.key === facet)!.values.filter((v) =>
      p.getAll(facet).includes(v),
    )
  const sort = p.get('sort') ?? ''
  return {
    q: p.get('q') ?? '',
    domain: picked('domain'),
    kind: picked('kind'),
    source: picked('source'),
    map: picked('map'),
    sort: Object.hasOwn(SORTS, sort) ? (sort as Sort) : 'featured',
    group: p.get('group') !== '0',
    layout: p.get('view') === 'rows' ? 'rows' : 'cards',
    open: [...new Set(p.getAll('open'))],
  }
}

export const formatView = (view: View): string => {
  const p = new URLSearchParams()
  if (view.q) p.set('q', view.q)
  for (const { key } of FACETS) view[key].forEach((v) => p.append(key, v))
  if (view.sort !== 'featured') p.set('sort', view.sort)
  if (!view.group) p.set('group', '0')
  if (view.layout === 'rows') p.set('view', 'rows')
  view.open.forEach((m) => p.append('open', m))
  const s = p.toString()
  return s && `?${s}`
}

export const clearedFilters = {
  q: '',
  domain: [],
  kind: [],
  source: [],
  map: [],
}

export const isSearching = (view: View) => view.q.trim() !== ''

export const toggle = (list: string[], value: string) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value]

/** OR inside a facet, AND across facets and search words. */
export const matches = (f: Feedstock, view: View, skip?: Facet): boolean => {
  const text = [
    f.title,
    f.summary,
    f.description,
    f.modelName,
    f.slug,
    SOURCES[f.origin],
    ...(f.tags ?? []),
    ...f.provenance.providers.map((p) => p.name),
  ]
    .join(' ')
    .toLowerCase()
  const words = view.q.toLowerCase().split(/\s+/)
  return (
    words.every((w) => text.includes(w)) &&
    FACETS.every(
      ({ key }) =>
        key === skip ||
        view[key].length === 0 ||
        facetValues[key](f).some((v) => view[key].includes(v)),
    )
  )
}

/** Facet values that some dataset has, counted without the facet's own selection. */
export const facetCounts = (feedstocks: Feedstock[], view: View) =>
  FACETS.map((facet) => {
    const of = facetValues[facet.key]
    const matched = feedstocks.filter((f) => matches(f, view, facet.key))
    return {
      ...facet,
      values: facet.values
        .filter((v) => feedstocks.some((f) => of(f).includes(v)))
        .map((value) => ({
          value,
          count: matched.filter((f) => of(f).includes(value)).length,
        })),
    }
  })

/* Entries: one dataset, or the datasets of one model */

export interface Entry {
  title: string
  items: Feedstock[]
}

const duration = ({ items }: Entry) => {
  const spans = items.filter((f) => f.start && f.end)
  if (spans.length === 0) return -1
  return (
    Math.max(...spans.map((f) => Date.parse(f.end!))) -
    Math.min(...spans.map((f) => Date.parse(f.start!)))
  )
}

const sorters: Record<Sort, (view: View) => (a: Entry, b: Entry) => number> = {
  az: () => compareTitles,
  longest: () => (a, b) => duration(b) - duration(a) || compareTitles(a, b),
  featured: (view) => {
    // Without a search the featured datasets are already shown above the list.
    const rank = ({ items }: Entry) =>
      Math.min(
        ...items.map(
          (f) =>
            (isSearching(view) ? f.featured : undefined) ??
            (f.origin === 'leap' ? 1e6 : 2e6),
        ),
      )
    return (a, b) => rank(a) - rank(b) || compareTitles(a, b)
  },
}

export const toEntries = (feedstocks: Feedstock[], view: View): Entry[] => {
  const groups = new Map<string, Feedstock[]>()
  for (const f of feedstocks) {
    const key = view.group && f.modelName ? `model ${f.modelName}` : f.slug
    groups.set(key, [...(groups.get(key) ?? []), f])
  }
  return [...groups.values()]
    .map((items) => ({
      title: items.length > 1 ? items[0].modelName! : items[0].title,
      items: items.sort(compareTitles),
    }))
    .sort(sorters[view.sort](view))
}

/* Text */

const capitalize = (s: string) => s && s[0].toUpperCase() + s.slice(1)

const latitude = (y: number) =>
  `${Math.abs(Math.round(y))}°${y < 0 ? 'S' : 'N'}`

const coverage = (f: Feedstock): string => {
  if (f.spatialDomain) return f.spatialDomain
  if (f.coverage) return capitalize(f.coverage)
  const [w, s, e, n] = f.bbox
  // A whole-globe box without dates is the build's placeholder.
  if (w === -180 && s === -90 && n === 90 && !f.start) return ''
  if (e - w < 350) return 'Regional'
  return n - s >= 130 ? 'Global' : `${latitude(s)} to ${latitude(n)}`
}

const resolution = (f: Feedstock): string =>
  (f.spatialResolution ?? '')
    .replace(/ degrees?/g, '°')
    .replace(/ \(~[^)]*\)/g, '')
    .replace(/^[\d-]+ hours: (.*), [\d-]+ hours: (.*)$/, '$1 then $2')

const frequency = (f: Feedstock): string =>
  (f.timeResolution ?? '')
    .replace(/^Forecasts initialized /, '')
    .replace(/^every (1 hours|hour)$|^1 hour$/, 'hourly')
    .replace(/^1 day$/, 'daily')
    .replace(/^(\d+)\.0 /, '$1 ')

const dates = ({ start, end, ongoing }: Feedstock): string => {
  if (!start || !end) return ''
  const [a, b] = [start, end].map((d) => Number(d.slice(0, 4)))
  if (a < 1000) return a === b ? `model year ${a}` : `model years ${a}–${b}`
  if (ongoing) return `${a}–present`
  return a === b ? `${a}` : `${a}–${b}`
}

// Lines wrap between parts, not inside them ("3 km").
const line = (parts: string[]) =>
  parts
    .filter(Boolean)
    .map((part) => part.replaceAll(' ', '\u00a0'))
    .join('\u00a0· ')

export const memberSpec = (f: Feedstock) =>
  line([resolution(f), frequency(f), dates(f)])

export const entrySpec = ({ items }: Entry): string => {
  if (items.length === 1)
    return line([coverage(items[0]), memberSpec(items[0])])
  const places = new Set(items.map(coverage))
  const resolutions = [...new Set(items.map(resolution))].join(', ')
  const years = items.flatMap((f) => f.start?.slice(0, 4) ?? []).sort()
  return line([
    `${items.length} datasets`,
    places.size === 1 ? [...places][0] : '',
    resolutions.length < 26 ? resolutions : '',
    years.length ? `from ${years[0]}` : '',
  ])
}

/** Title without the model name, for use under a heading that has it. */
export const memberName = ({ title, modelName }: Feedstock): string => {
  const rest =
    modelName && title.startsWith(modelName) && title.slice(modelName.length)
  return rest && /^[ ,]/.test(rest)
    ? capitalize(rest.replace(/^[ ,]+/, ''))
    : title
}
