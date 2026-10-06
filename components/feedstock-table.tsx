'use client'

import { Feedstock } from '@/types/types'
import {
  formatCoverage,
  formatResolution,
  formatTimeRange,
} from '@/utils/format'
import Link from 'next/link'
import { Box, ThemeUIStyleObject } from 'theme-ui'

const COLUMNS = '3fr 2fr 2fr 1.5fr 1.5fr 0.7fr'
const HEADERS = ['Dataset', 'Domain', 'Coverage', 'Resolution', 'Time', 'Vars']

const mono: ThemeUIStyleObject = {
  fontFamily: 'mono',
  letterSpacing: 'mono',
  fontSize: [0, 0, 0, 1],
}

// Compact dynamical.org-style table. Below the md breakpoint only title + meta show.
export const FeedstockTable: React.FC<{
  feedstocks: Feedstock[]
  catalog?: string
}> = ({ feedstocks, catalog }) => (
  <Box>
    <Box
      sx={{
        ...mono,
        display: ['none', 'none', 'grid'],
        gridTemplateColumns: COLUMNS,
        gap: 3,
        color: 'secondary',
        textTransform: 'uppercase',
        pb: 2,
        borderBottom: '1px solid',
        borderColor: 'muted',
      }}
    >
      {HEADERS.map((h) => (
        <Box key={h}>{h}</Box>
      ))}
    </Box>
    {feedstocks.map((f) => (
      <Link
        key={f.slug}
        href={
          catalog
            ? `/feedstock/${f.slug}?catalog=${catalog}`
            : `/feedstock/${f.slug}`
        }
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: ['1fr', '1fr', COLUMNS],
            gap: [1, 1, 3],
            py: 3,
            borderBottom: '1px solid',
            borderColor: 'muted',
            alignItems: 'baseline',
            ':hover': { color: f.color },
          }}
        >
          <Box sx={{ fontSize: [2, 2, 2, 3] }}>
            {f.title}
            {f.source === 'dynamical' && (
              <Box as='span' sx={{ ...mono, color: 'secondary', ml: 2 }}>
                dynamical.org
              </Box>
            )}
          </Box>
          <Box sx={{ ...mono, color: 'secondary' }}>{f.domain.join(', ')}</Box>
          <Box sx={mono}>{formatCoverage(f) || '–'}</Box>
          <Box sx={mono}>{formatResolution(f.spatialResolution) || '–'}</Box>
          <Box sx={mono}>{formatTimeRange(f.start, f.end) || '–'}</Box>
          <Box sx={mono}>{f.nVariables || '–'}</Box>
        </Box>
      </Link>
    ))}
  </Box>
)
