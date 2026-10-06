'use client'

import { FeedstockCard } from '@/components/feedstock-card'
import { FeedstockTable } from '@/components/feedstock-table'
import { SearchBox } from '@/components/search-box'
import { Feedstock } from '@/types/types'
import { Button, Column, Filter, Row, Select } from '@carbonplan/components'
import { useEffect, useMemo, useState } from 'react'
import { Box, Container, Flex, Text, ThemeUIStyleObject } from 'theme-ui'

const FACETS = ['domain', 'kind', 'coverage', 'source'] as const
type Facet = (typeof FACETS)[number]
type Selection = Record<string, boolean>

// Clicking a tag while all are on selects only that tag; emptying a facet resets it.
const pick = (prev: Selection, next: Selection): Selection => {
  const keys = Object.keys(next)
  const off = keys.filter((k) => !next[k])
  if (off.length === keys.length) return Object.fromEntries(keys.map((k) => [k, true]))
  if (keys.every((k) => prev[k]) && off.length === 1 && keys.length > 1)
    return Object.fromEntries(keys.map((k) => [k, k === off[0]]))
  return next
}

const SORTS = {
  az: 'A-Z',
  updated: 'Recently updated',
  longest: 'Longest record',
  vars: 'Most variables',
} as const
type Sort = keyof typeof SORTS

const SOURCE_LABELS: Record<string, string> = {
  leap: 'LEAP',
  dynamical: 'dynamical.org',
}
const SECTIONS: [Feedstock['source'], string][] = [
  ['leap', 'LEAP datasets'],
  ['dynamical', 'Weather forecasts and analyses from dynamical.org'],
]

const facetValues = (f: Feedstock, facet: Facet): string[] => {
  const v = f[facet]
  return Array.isArray(v) ? v : v ? [v] : []
}

// Ongoing datasets (start but no end) count as most recent.
const endKey = (f: Feedstock) => f.end ?? (f.start ? '9999' : '0000')

const sorters: Record<Sort, (a: Feedstock, b: Feedstock) => number> = {
  az: (a, b) => a.title.localeCompare(b.title),
  updated: (a, b) => endKey(b).localeCompare(endKey(a)),
  longest: (a, b) => (a.start ?? '9999').localeCompare(b.start ?? '9999'),
  vars: (a, b) => b.nVariables - a.nVariables,
}

const labelSx: ThemeUIStyleObject = {
  fontFamily: 'mono',
  letterSpacing: 'mono',
  textTransform: 'uppercase',
  fontSize: [0, 0, 0, 1],
  color: 'secondary',
}

type CatalogProps = {
  feedstocks: Feedstock[]
  error?: Error
  catalog?: string
  params?: Record<string, string | string[] | undefined>
}

export const Catalog = ({
  feedstocks,
  error,
  catalog,
  params = {},
}: CatalogProps) => {
  const param = (k: string) => {
    const v = params[k]
    return typeof v === 'string' ? v : undefined
  }

  // All values seen per facet; a facet with everything selected is no filter.
  const options = useMemo(
    () =>
      Object.fromEntries(
        FACETS.map((facet) => [
          facet,
          Array.from(
            new Set(feedstocks.flatMap((f) => facetValues(f, facet))),
          ).sort(),
        ]),
      ) as Record<Facet, string[]>,
    [feedstocks],
  )

  const [search, setSearch] = useState(param('q') ?? '')
  const [sort, setSort] = useState<Sort>(
    (param('sort') as Sort) in SORTS ? (param('sort') as Sort) : 'az',
  )
  const [view, setView] = useState(param('view') === 'list' ? 'list' : 'grid')
  const [mapOnly, setMapOnly] = useState(param('map') === '1')
  const [selected, setSelected] = useState<Record<Facet, Selection>>(
    () =>
      Object.fromEntries(
        FACETS.map((facet) => {
          const picked = param(facet)?.split(',')
          return [
            facet,
            Object.fromEntries(
              options[facet].map((o: string) => [
                o,
                !picked || picked.includes(o),
              ]),
            ),
          ]
        }),
      ) as Record<Facet, Selection>,
  )

  const active = (facet: Facet) =>
    Object.keys(selected[facet]).filter((k) => selected[facet][k])
  const isFiltered = (facet: Facet) =>
    active(facet).length < options[facet].length

  // Mirror state into the URL so views are shareable; keeps ?catalog=.
  useEffect(() => {
    const q = new URLSearchParams()
    if (catalog) q.set('catalog', catalog)
    if (search) q.set('q', search)
    FACETS.forEach((f) => isFiltered(f) && q.set(f, active(f).join(',')))
    if (mapOnly) q.set('map', '1')
    if (sort !== 'az') q.set('sort', sort)
    if (view !== 'grid') q.set('view', view)
    const qs = q.toString()
    window.history.replaceState(null, '', qs ? `?${qs}` : location.pathname)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selected, mapOnly, sort, view, catalog])

  const filtered = useMemo(() => {
    const re = search
      ? new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      : null
    return feedstocks
      .filter(
        (f) =>
          !re ||
          [
            f.title,
            f.summary,
            f.description,
            f.spatialDomain,
            ...f.domain,
            ...f.kind,
            ...(f.stores ?? []).flatMap((s) => [
              s.name,
              ...(s.variables ?? []).flatMap((v) => [v.name, v.long_name]),
            ]),
          ].some((t) => t && re.test(t)),
      )
      .filter((f) =>
        FACETS.every(
          (facet) =>
            !isFiltered(facet) ||
            facetValues(f, facet).some((v) => selected[facet][v]),
        ),
      )
      .filter((f) => !mapOnly || f.mapPreview)
      .sort(sorters[sort])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedstocks, search, selected, mapOnly, sort])

  const anyFilter = !!search || mapOnly || FACETS.some((f) => isFiltered(f))

  const reset = () => {
    setSearch('')
    setMapOnly(false)
    setSelected(
      Object.fromEntries(
        FACETS.map((f) => [
          f,
          Object.fromEntries(options[f].map((o) => [o, true])),
        ]),
      ) as Record<Facet, Selection>,
    )
  }

  if (error) {
    return (
      <div style={{ color: 'red', fontWeight: 'bold' }}>
        Error loading catalog - {error.message}
      </div>
    )
  }

  const results = (items: Feedstock[]) =>
    view === 'list' ? (
      <FeedstockTable feedstocks={items} catalog={catalog} />
    ) : (
      <Row
        columns={[1, 2, 3, 3]}
        gap={[4, 5, 5, 6]}
        sx={{ gridAutoRows: '1fr' }}
      >
        {items.map((f) => (
          <FeedstockCard key={f.slug} feedstock={f} catalog={catalog} />
        ))}
      </Row>
    )

  // A-Z keeps the LEAP / dynamical.org sections; other sorts flatten.
  // The unfiltered default view leads with featured datasets.
  const showFeatured = sort === 'az' && !anyFilter
  const rest = showFeatured ? filtered.filter((f) => !f.featured) : filtered
  const sections =
    sort === 'az'
      ? [
          ...(showFeatured
            ? [['Featured', filtered.filter((f) => f.featured)] as const]
            : []),
          ...SECTIONS.map(
            ([source, label]) =>
              [label, rest.filter((f) => f.source === source)] as const,
          ),
        ].filter(([, items]) => items.length > 0)
      : [[null, filtered] as const]

  return (
    <Box>
      <Container>
        <Box as='section' sx={{ pt: 8, pb: 10 }}>
          <Row columns={[6, 8, 12, 12]} sx={{ mb: 5 }}>
            <Column start={1} width={[6, 6, 4, 4]}>
              <Text
                sx={{
                  color: 'primary',
                  fontSize: [4, 4, 4, 6],
                  fontFamily: 'heading',
                  width: '100%',
                }}
              >
                Data Catalog
              </Text>
            </Column>
            <Column
              start={[1, 1, 5, 5]}
              width={[6, 8, 8, 8]}
              sx={{ mt: [3, 3, 0, 0] }}
            >
              <SearchBox search={search} setSearch={setSearch} />
              <Box
                sx={{
                  mt: 4,
                  display: 'grid',
                  gridTemplateColumns: ['1fr', '110px 1fr'],
                  rowGap: 2,
                  columnGap: 3,
                  alignItems: 'baseline',
                }}
              >
                {FACETS.map((facet) => (
                  <Box key={facet} sx={{ display: 'contents' }}>
                    <Text sx={labelSx}>{facet}</Text>
                    <Filter
                      values={selected[facet]}
                      setValues={(v: Selection) =>
                        setSelected((s) => ({ ...s, [facet]: pick(s[facet], v) }))
                      }
                      labels={
                        facet === 'source'
                          ? Object.fromEntries(
                              options.source.map((o) => [
                                o,
                                SOURCE_LABELS[o] ?? o,
                              ]),
                            )
                          : undefined
                      }
                      multiSelect
                      showAll
                    />
                  </Box>
                ))}
                <Text sx={labelSx}>Map</Text>
                <Filter
                  values={{ 'has map preview': mapOnly }}
                  setValues={(v: Selection) => setMapOnly(v['has map preview'])}
                  multiSelect
                />
              </Box>
            </Column>
          </Row>

          <Flex
            sx={{
              alignItems: 'baseline',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 3,
              mb: 4,
            }}
          >
            <Flex sx={{ gap: 3, alignItems: 'baseline' }}>
              <Text sx={labelSx}>
                {filtered.length} of {feedstocks.length} datasets
              </Text>
              {anyFilter && (
                <Button size='xs' inverted sx={labelSx} onClick={reset}>
                  Clear filters
                </Button>
              )}
            </Flex>
            <Flex sx={{ gap: 4, alignItems: 'baseline' }}>
              <Select
                size='xs'
                value={sort}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setSort(e.target.value as Sort)
                }
                sxSelect={labelSx}
                aria-label='Sort'
              >
                {Object.entries(SORTS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </Select>
              <Filter
                values={{ grid: view === 'grid', list: view === 'list' }}
                setValues={(v: Selection) => setView(v.list ? 'list' : 'grid')}
              />
            </Flex>
          </Flex>

          {filtered.length === 0 && <Box>No datasets match these filters.</Box>}
          {sections.map(([label, items]) => (
            <Box key={label ?? 'all'} sx={{ mb: 7 }}>
              {label && (
                <Text
                  as='h2'
                  sx={{
                    fontFamily: 'heading',
                    fontSize: [3, 3, 3, 4],
                    mb: 4,
                  }}
                >
                  {label}
                </Text>
              )}
              {results(items)}
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  )
}
