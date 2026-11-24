/** @jsxImportSource theme-ui */
'use client'

import { CodeBlock } from '@/components/code-block'
import { Badges, badgeSx } from '@/components/entry-parts'
import {
  controlSx,
  headingSx,
  labelSx,
  plainListSx,
  specSx,
  wrapSx,
} from '@/components/styles'
import { FeedstockDetail, Link as DataLink } from '@/types/types'
import { memberName, memberSpec } from '@/utils/listing'
import { openSnippet } from '@/utils/snippet'
import { openedFromList } from '@/utils/use-view'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ReactNode, useState } from 'react'
import { DataViewer } from './data-viewer'
import { ExternalLink, Facts, licenseOf } from './facts'
import { Variables } from './variables'

const listSx = {
  ...plainListSx,
  display: 'grid',
  gap: '7px',
  fontSize: '14.5px',
}
const citeSx = {
  m: 0,
  px: 3,
  py: '14px',
  bg: 'hinted',
  fontSize: '14.5px',
  lineHeight: 1.4,
  overflowWrap: 'anywhere',
} as const

const Section = ({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) => (
  <section sx={{ display: 'grid', gridTemplateColumns: '100%', gap: '12px' }}>
    <h2 sx={{ ...headingSx, fontSize: '22px' }}>{title}</h2>
    {children}
  </section>
)

// dynamical.org descriptions mark names with backticks.
const withCode = (text: string) =>
  text
    .split(/`([^`]+)`/)
    .map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part))

const LinkList = ({ links }: { links: DataLink[] }) => (
  <ul sx={listSx}>
    {links.map((l) => (
      <li key={l.url}>
        <ExternalLink href={l.url}>{l.label}</ExternalLink>
      </li>
    ))}
  </ul>
)

// Returns to the list as it was left; a plain link when the page was opened directly.
const ListLink = () => {
  const router = useRouter()
  return (
    <Link
      href='/'
      onClick={(e) => {
        const newTab = e.metaKey || e.ctrlKey || e.shiftKey
        if (newTab || !openedFromList(window.location.pathname)) return
        e.preventDefault()
        router.back()
      }}
      sx={{ color: 'secondary', ':hover': { color: 'text' } }}
    >
      Datasets
    </Link>
  )
}

export const DatasetPage = ({ feedstock }: { feedstock: FeedstockDetail }) => {
  const { stores, related, citations, examples } = feedstock
  const [storeId, setStoreId] = useState(stores[0].id)
  const store = stores.find((s) => s.id === storeId) ?? stores[0]

  return (
    <div sx={{ ...wrapSx, width: '100%' }}>
      <nav
        aria-label='Breadcrumb'
        sx={{ pt: '20px', pb: '12px', fontSize: 1, color: 'secondary' }}
      >
        <ListLink />
        {feedstock.modelName && ` / ${feedstock.modelName}`}
        {` / ${feedstock.title}`}
      </nav>

      <header sx={{ display: 'grid', gap: '12px', pb: '24px' }}>
        <div sx={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          <Badges entry={{ title: feedstock.title, items: [feedstock] }} />
          {feedstock.tags?.map((tag) => (
            <span key={tag} sx={{ ...badgeSx, borderColor: 'line' }}>
              {tag}
            </span>
          ))}
        </div>
        <h1
          sx={{
            ...headingSx,
            fontSize: 'clamp(28px, 4vw, 42px)',
            lineHeight: 1.08,
          }}
        >
          {feedstock.title}
        </h1>
        <p sx={{ m: 0, fontSize: 3, lineHeight: 1.4, maxWidth: '68ch' }}>
          {feedstock.summary}
        </p>
      </header>

      <div
        sx={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 300px',
          alignItems: 'start',
          gap: '56px',
          borderTop: '1px solid',
          borderColor: 'text',
          pt: '28px',
          '@media (max-width: 940px)': {
            gridTemplateColumns: 'minmax(0, 1fr)',
            gap: '38px',
          },
        }}
      >
        <div
          sx={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr)',
            gap: '38px',
          }}
        >
          <Section title='Open this dataset'>
            {stores.length > 1 && (
              <label sx={{ display: 'grid', gap: 1 }}>
                <span sx={labelSx}>Store</span>
                <select
                  value={store.id}
                  onChange={(e) => setStoreId(e.target.value)}
                  sx={{ ...controlSx, justifySelf: 'start', maxWidth: '100%' }}
                >
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <CodeBlock code={openSnippet(store)} />
            {examples.length > 0 && <LinkList links={examples} />}
          </Section>

          <Section title='Map'>
            <DataViewer key={store.id} store={store} bbox={feedstock.bbox} />
          </Section>

          <Section title='About'>
            <p
              sx={{
                m: 0,
                fontSize: 2,
                lineHeight: 1.5,
                maxWidth: '68ch',
                whiteSpace: 'pre-line',
                overflowWrap: 'anywhere',
              }}
            >
              {withCode(feedstock.description)}
            </p>
          </Section>

          <Section title='Dimensions and variables'>
            <Variables key={store.id} cube={feedstock.cubes[store.id]} />
          </Section>

          <Section title='License and citation'>
            <p sx={{ m: 0, fontSize: 2 }}>{licenseOf(feedstock)}</p>
            {feedstock.attribution && (
              <p sx={citeSx}>{feedstock.attribution}</p>
            )}
            {citations.length > 0 && (
              <div sx={citeSx}>
                <p sx={{ m: 0, mb: 2 }}>If you use this dataset, cite:</p>
                <LinkList links={citations} />
              </div>
            )}
            {!feedstock.attribution && citations.length === 0 && (
              <p sx={citeSx}>No citation found for this dataset.</p>
            )}
          </Section>

          {related.length > 0 && (
            <Section title={`Other ${feedstock.modelName} datasets`}>
              <ul sx={listSx}>
                {related.map((f) => (
                  <li key={f.slug}>
                    <Link href={`/feedstock/${f.slug}`} sx={{ color: 'text' }}>
                      {memberName(f)}
                    </Link>{' '}
                    <span sx={specSx}>{memberSpec(f)}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>

        <aside aria-label='Facts'>
          <Facts feedstock={feedstock} />
        </aside>
      </div>
    </div>
  )
}
