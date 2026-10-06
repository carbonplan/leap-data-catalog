'use client'
import { Links } from '@/components/feedstock'
import { Tags } from '@/components/feedstock/tags'
import { Feedstock } from '@/types/types'
import {
  formatBytes,
  formatCoverage,
  formatResolution,
  formatTimeRange,
  formatTimeStep,
} from '@/utils/format'
import { Column, Row } from '@carbonplan/components'
import { Box } from 'theme-ui'

const Fact: React.FC<{ label: string; value?: string }> = ({ label, value }) =>
  value ? (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          fontFamily: 'mono',
          letterSpacing: 'mono',
          textTransform: 'uppercase',
          fontSize: [0, 0, 0, 1],
          color: 'secondary',
        }}
      >
        {label}
      </Box>
      <Box sx={{ fontSize: [1, 1, 1, 2] }}>{value}</Box>
    </Box>
  ) : null

export const FeedstockDescription: React.FC<{ feedstock: Feedstock }> = ({
  feedstock,
}) => {
  return (
    <Box sx={{ mt: 2 }}>
      <Row sx={{ mb: 4 }}>
        <Column start={[1, 1, 2, 2]} width={[6, 6, 6, 6]}>
          <Box sx={{ mt: 3 }}>
            <Tags
              tags={[...feedstock.domain, ...feedstock.kind]}
              href={(t) =>
                `/?${feedstock.domain.includes(t) ? 'domain' : 'kind'}=${encodeURIComponent(t)}`
              }
            />
          </Box>
        </Column>
      </Row>
      <Row>
        <Column start={[1, 1, 2, 2]} width={[6, 8, 8, 8]}>
          <Box sx={{ fontSize: [2, 2, 2, 3] }}>
            {feedstock.summary ?? feedstock.description}
          </Box>
          {feedstock.summary &&
            feedstock.description.length > feedstock.summary.length && (
              <Box sx={{ fontSize: [1, 1, 1, 2], mt: 3, color: 'secondary' }}>
                {feedstock.description}
              </Box>
            )}
        </Column>
      </Row>
      <Row sx={{ mt: 4 }}>
        <Column
          start={[1, 1, 2, 2]}
          width={[6, 8, 10, 10]}
          sx={{
            display: 'grid',
            gridTemplateColumns: [
              'repeat(2, 1fr)',
              'repeat(3, 1fr)',
              'repeat(6, auto)',
            ],
            columnGap: 4,
          }}
        >
          <Fact label='Coverage' value={formatCoverage(feedstock)} />
          <Fact
            label='Resolution'
            value={formatResolution(feedstock.spatialResolution)}
          />
          <Fact
            label='Time range'
            value={formatTimeRange(feedstock.start, feedstock.end)}
          />
          <Fact
            label='Time step'
            value={formatTimeStep(feedstock.timeResolution)}
          />
          <Fact label='Type' value={feedstock.kind.join(', ')} />
          <Fact
            label='Size (uncompressed)'
            value={formatBytes(feedstock.nbytes)}
          />
        </Column>
        <Column start={[1, 1, 2, 2]} width={[6, 8, 10, 10]}>
          {feedstock.links && <Links links={feedstock.links} />}
        </Column>
      </Row>
    </Box>
  )
}
