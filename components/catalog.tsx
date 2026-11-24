/** @jsxImportSource theme-ui */
'use client'

import { FeedstockCard } from '@/components/feedstock-card'
import { FeedstockRow } from '@/components/feedstock-row'
import { FilterRail } from '@/components/filter-rail'
import { QueryBlock } from '@/components/query-block'
import { SearchBox } from '@/components/search-box'
import {
  checkSx,
  chipSx,
  controlSx,
  gridSx,
  headingSx,
  plainListSx,
  pressedSx,
  wrapSx,
} from '@/components/styles'
import { Feedstock } from '@/types/types'
import {
  clearedFilters,
  FACETS,
  facetLabel,
  isSearching,
  matches,
  SORTS,
  toEntries,
  toggle,
} from '@/utils/listing'
import type { Entry, Facet, Sort, View } from '@/utils/listing'
import { syncView, useView } from '@/utils/use-view'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'

// Re-reads the url after Next navigates between views of this page (logo, Back).
const UrlWatcher = () => {
  const params = useSearchParams()
  useEffect(syncView, [params])
  return null
}

const plural = (n: number, word: string) =>
  n === 1 ? `1 ${word}` : `${n} ${word}s`

interface FeaturedProps {
  feedstocks: Feedstock[]
  onBrowse: () => void
}

const Featured = ({ feedstocks, onBrowse }: FeaturedProps) => (
  <>
    <section sx={{ mt: 'clamp(28px, 6svh, 64px)' }}>
      <h2 sx={{ ...headingSx, fontSize: 3, mb: '12px' }}>Featured</h2>
      <ul
        sx={{
          ...gridSx,
          gap: '18px',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          '@media (max-width: 1000px)': {
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          },
        }}
      >
        {feedstocks
          .filter((f) => f.featured !== undefined)
          .sort((a, b) => a.featured! - b.featured!)
          .map((f) => (
            <FeedstockCard
              key={f.slug}
              entry={{ title: f.title, items: [f] }}
              featured
            />
          ))}
      </ul>
    </section>
    <button
      type='button'
      onClick={onBrowse}
      sx={{
        m: 'auto auto 0',
        pt: '26px',
        px: 3,
        pb: '22px',
        border: 0,
        bg: 'transparent',
        color: 'text',
        fontFamily: 'body',
        fontSize: '15px',
        textDecoration: 'underline',
        textUnderlineOffset: '4px',
        cursor: 'pointer',
        ':hover': { color: 'secondary' },
      }}
    >
      Browse all {plural(feedstocks.length, 'dataset')}
    </button>
  </>
)

interface ControlsProps {
  view: View
  update: (patch: Partial<View>) => void
}

const Chips = ({ view, update }: ControlsProps) => {
  const chips = FACETS.flatMap(({ key }) =>
    view[key].map((value) => ({ key, value })),
  )
  if (chips.length === 0 && !isSearching(view)) return null
  return (
    <div sx={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
      {chips.map(({ key, value }) => (
        <button
          key={`${key} ${value}`}
          type='button'
          aria-label={`Remove filter ${facetLabel(key, value)}`}
          onClick={() => update({ [key]: toggle(view[key], value) })}
          sx={{ ...chipSx, ...pressedSx }}
        >
          {facetLabel(key, value)} <span aria-hidden>×</span>
        </button>
      ))}
      <button type='button' onClick={() => update(clearedFilters)} sx={chipSx}>
        Clear all
      </button>
    </div>
  )
}

const Tools = ({ view, update }: ControlsProps) => (
  <>
    <select
      aria-label='Sort'
      value={view.sort}
      onChange={(e) => update({ sort: e.target.value as Sort })}
      sx={controlSx}
    >
      {Object.entries(SORTS).map(([value, label]) => (
        <option key={value} value={value}>
          Sort: {label}
        </option>
      ))}
    </select>
    <div role='group' aria-label='Layout' sx={{ display: 'inline-flex' }}>
      {(['cards', 'rows'] as const).map((layout) => (
        <button
          key={layout}
          type='button'
          aria-pressed={view.layout === layout}
          onClick={() => update({ layout })}
          sx={{ ...controlSx, ...(view.layout === layout && pressedSx) }}
        >
          {layout === 'cards' ? 'Cards' : 'Rows'}
        </button>
      ))}
    </div>
  </>
)

interface ResultsProps extends ControlsProps {
  entries: Entry[]
}

const Results = ({ entries, view, update }: ResultsProps) => {
  if (entries.length === 0) {
    const query = view.q.trim()
    return (
      <div sx={{ display: 'grid', gap: 3, justifyItems: 'start', py: 6 }}>
        <p sx={{ m: 0 }}>
          No datasets match {query ? `“${query}”` : 'these filters'}.
        </p>
        <button
          type='button'
          onClick={() => update(clearedFilters)}
          sx={controlSx}
        >
          Clear search and filters
        </button>
      </div>
    )
  }

  const rows = view.layout === 'rows'
  const Item = rows ? FeedstockRow : FeedstockCard
  return (
    <ul sx={rows ? plainListSx : { ...gridSx, mt: '20px' }}>
      {entries.map((entry) => (
        <Item
          key={entry.items[0].slug}
          entry={entry}
          open={view.open.includes(entry.title)}
          onToggle={() => update({ open: toggle(view.open, entry.title) })}
        />
      ))}
    </ul>
  )
}

type CatalogProps = {
  feedstocks: Feedstock[]
}

export const Catalog = ({ feedstocks }: CatalogProps) => {
  const [view, update] = useView()
  const [railOpen, setRailOpen] = useState(false)
  const list = useRef<HTMLDivElement>(null)

  const found = feedstocks.filter((f) => matches(f, view))
  const entries = toEntries(found, view)
  const searching = isSearching(view)
  const nFilters = FACETS.reduce((n, { key }) => n + view[key].length, 0)

  const browse = () => {
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    list.current?.scrollIntoView({ behavior: still ? 'instant' : 'smooth' })
  }

  const toggleFilter = (facet: Facet, value: string) =>
    update({ [facet]: toggle(view[facet], value) })

  return (
    <div sx={wrapSx}>
      <Suspense>
        <UrlWatcher />
      </Suspense>
      <div
        sx={{
          display: 'flex',
          flexDirection: 'column',
          // 56px header
          minHeight: searching ? 0 : 'min(calc(100svh - 56px), 960px)',
        }}
      >
        <div
          sx={{
            pt: searching ? '36px' : 'clamp(32px, 7svh, 80px)',
            pb: '20px',
          }}
        >
          <h1
            sx={{
              ...headingSx,
              fontSize: 'clamp(30px, 4vw, 44px)',
              lineHeight: 1.05,
            }}
          >
            LEAP Data Catalog
          </h1>
          <p sx={{ m: 0, mt: 2, color: 'secondary' }}>
            Analysis-ready climate and Earth system datasets you can open
            straight from the cloud.
          </p>
        </div>
        <SearchBox search={view.q} setSearch={(q) => update({ q })} />
        {!searching && <Featured feedstocks={feedstocks} onBrowse={browse} />}
      </div>

      <div
        ref={list}
        sx={{
          display: 'grid',
          gridTemplateColumns: '210px minmax(0, 1fr)',
          gap: '40px',
          pt: searching ? '30px' : '36px',
          borderTop: searching ? 0 : '1px solid',
          borderColor: 'line',
          scrollMarginTop: 0,
          '@media (max-width: 860px)': {
            gridTemplateColumns: 'minmax(0, 1fr)',
            gap: '18px',
          },
        }}
      >
        <FilterRail
          id='filters'
          feedstocks={feedstocks}
          view={view}
          open={railOpen}
          onToggle={toggleFilter}
        />
        <div sx={{ minWidth: 0 }}>
          <div
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '8px 14px',
              minHeight: 42,
              pb: '10px',
              borderBottom: '1px solid',
              borderColor: 'text',
            }}
          >
            <div
              aria-live='polite'
              sx={{ display: 'flex', alignItems: 'baseline', gap: 2 }}
            >
              <h2 sx={{ ...headingSx, fontSize: 3 }}>
                {plural(found.length, 'dataset')}
              </h2>
              {entries.length < found.length && (
                <span sx={{ fontSize: 1, color: 'secondary' }}>
                  in{' '}
                  {entries.length === 1
                    ? '1 entry'
                    : `${entries.length} entries`}
                </span>
              )}
            </div>
            <label sx={checkSx}>
              <input
                type='checkbox'
                checked={view.group}
                onChange={() => update({ group: !view.group })}
              />
              Group by model
            </label>
            <Chips view={view} update={update} />
            <div
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 2,
                ml: 'auto',
              }}
            >
              <Tools view={view} update={update} />
              <button
                type='button'
                aria-expanded={railOpen}
                aria-controls='filters'
                onClick={() => setRailOpen((open) => !open)}
                sx={{
                  ...controlSx,
                  '@media (min-width: 861px)': { display: 'none' },
                }}
              >
                {nFilters ? `Filters (${nFilters})` : 'Filters'}
              </button>
            </div>
          </div>
          <Results entries={entries} view={view} update={update} />
        </div>
      </div>
      <QueryBlock catalogUrl={feedstocks[0].catalogUrl} />
    </div>
  )
}
