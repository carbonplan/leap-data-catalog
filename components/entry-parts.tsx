/** @jsxImportSource theme-ui */
import { plainListSx, specSx } from '@/components/styles'
import { Feedstock } from '@/types/types'
import { hasMap, memberName, memberSpec, SOURCES } from '@/utils/listing'
import type { Entry } from '@/utils/listing'
import { markOpened } from '@/utils/use-view'
import Link from 'next/link'
import { ReactNode } from 'react'
import { ThemeUICSSObject } from 'theme-ui'

// Makes the whole positioned parent clickable without wrapping it in a link.
export const stretchSx: ThemeUICSSObject = {
  '::after': { content: '""', position: 'absolute', inset: 0 },
}

interface DatasetLinkProps {
  feedstock: Feedstock
  children: ReactNode
  className?: string
}

export const DatasetLink = ({
  feedstock,
  children,
  className,
}: DatasetLinkProps) => {
  const href = `/feedstock/${feedstock.slug}`
  return (
    <Link
      href={href}
      onClick={() => markOpened(href)}
      className={className}
      sx={{
        color: 'text',
        textDecoration: 'none',
        ':hover': {
          textDecoration: 'underline',
          textUnderlineOffset: '3px',
        },
      }}
    >
      {children}
    </Link>
  )
}

const badgeSx: ThemeUICSSObject = {
  px: '7px',
  py: '5px',
  fontFamily: 'mono',
  fontSize: '11.5px',
  lineHeight: 1,
  letterSpacing: '.04em',
  whiteSpace: 'nowrap',
  border: '1px solid',
}

export const Badges = ({ entry }: { entry: Entry }) => {
  const { origin } = entry.items[0]
  return (
    <>
      <span
        sx={{ ...badgeSx, borderColor: origin === 'leap' ? 'text' : 'line' }}
      >
        {SOURCES[origin] ?? origin}
      </span>
      {entry.items.some(hasMap) && (
        <span sx={{ ...badgeSx, borderColor: 'hinted', bg: 'hinted' }}>
          Map
        </span>
      )}
    </>
  )
}

interface GroupToggleProps {
  entry: Entry
  open: boolean
  onToggle: () => void
  className?: string
}

export const GroupToggle = ({
  entry,
  open,
  onToggle,
  className,
}: GroupToggleProps) => (
  <button
    type='button'
    aria-expanded={open}
    aria-controls={`group-${entry.items[0].slug}`}
    aria-label={`Show ${entry.items.length} datasets: ${entry.title}`}
    onClick={onToggle}
    className={className}
    sx={{
      p: 0,
      border: 0,
      bg: 'transparent',
      color: 'text',
      fontFamily: 'body',
      fontSize: 1,
      lineHeight: 1.4,
      textAlign: 'left',
      width: 'fit-content',
      textDecoration: 'underline',
      textUnderlineOffset: '3px',
      cursor: 'pointer',
    }}
  >
    <span aria-hidden sx={{ display: 'inline-block', mr: 1 }}>
      {open ? '▾' : '▸'}
    </span>
    Show {entry.items.length} datasets
  </button>
)

export const GroupMembers = ({
  entry,
  open,
  sideBySide,
}: {
  entry: Entry
  open: boolean
  sideBySide?: boolean
}) => (
  <ul
    id={`group-${entry.items[0].slug}`}
    hidden={!open}
    sx={{ ...plainListSx, mt: 2 }}
  >
    {entry.items.map((f) => (
      <li
        key={f.slug}
        sx={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          gap: '2px 18px',
          py: '6px',
          borderTop: '1px solid',
          borderColor: 'line',
          fontSize: '14.5px',
          ...(sideBySide && {
            '@media (min-width: 601px)': {
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.1fr)',
            },
          }),
        }}
      >
        <DatasetLink feedstock={f}>{memberName(f)}</DatasetLink>
        <span sx={specSx}>{memberSpec(f)}</span>
      </li>
    ))}
  </ul>
)
