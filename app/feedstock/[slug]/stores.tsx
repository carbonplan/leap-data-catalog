'use client'

import { TooltipWrapper } from '@/components/tooltip-wrapper'
import { Store } from '@/types/types'
import {
  formatBytes,
  formatResolution,
  formatTimeRange,
  formatTimeStep,
} from '@/utils/format'
import { Button, Column, Row } from '@carbonplan/components'
import { Down } from '@carbonplan/icons'
import React, { useState } from 'react'
import AnimateHeight from 'react-animate-height'
import { Box, Text } from 'theme-ui'
import { CodeSnippet } from './code-snippet'
import { DataViewer } from './data-viewer'
import { ZarrMapViewer } from './zarr-map-viewer'

const storeMeta = (store: Store) =>
  [
    store.format,
    formatResolution(store.spatialResolution),
    formatTimeStep(store.timeResolution),
    formatTimeRange(store.start, store.end),
    formatBytes(store.nbytes),
  ]
    .filter(Boolean)
    .join(' · ')

const VAR_LIMIT = 20

const labelStyle = {
  color: 'muted',
  fontSize: 0,
  fontFamily: 'mono',
  letterSpacing: 'mono',
  textTransform: 'uppercase',
}

export const FeedstockStore: React.FC<{
  store: Store
  color: string
  defaultExpanded?: boolean
  formatOnly?: boolean
}> = ({ store, color, defaultExpanded = false, formatOnly = false }) => {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [showMap, setShowMap] = useState(false)
  const [allVars, setAllVars] = useState(false)

  const tooltipContent = !store.public
    ? 'Private dataset. Access requires credentials or a Columbia-LEAP JupyterHub server.'
    : store.geospatial
      ? ''
      : 'This dataset contains non-geospatial data not supported by the data viewer.'

  return (
    <Box sx={{ mb: 4 }}>
      <Row>
        <Column start={[1, 1, 2, 2]} width={[6, 4, 4, 5]}>
          <Box>
            {' '}
            <Button
              sx={{
                color: color,
                fontSize: [2, 2, 2, 3],
              }}
              aria-expanded={expanded}
              onClick={() => setExpanded((prev) => !prev)}
            >
              {store.name || store.id}
              <Down
                sx={{
                  ml: 2,
                  width: 14,
                  transform: expanded ? 'rotate(315deg)' : 'rotate(135deg)',
                  transition: 'transform 0.15s',
                }}
              />
            </Button>
            <Text
              // @ts-ignore
              sx={{ ...labelStyle, display: 'block', mt: 1 }}
            >
              {formatOnly ? store.format : storeMeta(store)}
            </Text>
          </Box>
        </Column>
      </Row>

      <AnimateHeight
        duration={100}
        height={expanded ? 'auto' : 0}
        easing={'linear'}
      >
        <Row sx={{ mt: 4 }}>
          <Column start={[1, 1, 2, 2]} width={[6, 4, 3, 3]}>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ mb: 2 }}>
                {' '}
                <Text
                  // @ts-ignore
                  sx={labelStyle}
                >
                  Data Viewer
                </Text>
              </Box>

              <TooltipWrapper isExpanded tooltip={tooltipContent} color={color}>
                <DataViewer
                  store={store}
                  color={color}
                  showMap={showMap}
                  onToggle={() => setShowMap((prev) => !prev)}
                />
              </TooltipWrapper>
            </Box>
          </Column>
          <Column start={[1, 5, 7, 7]} width={[6, 4, 5, 5]}>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ mb: 2 }}>
                <Text
                  // @ts-ignore
                  sx={labelStyle}
                >
                  Load Dataset
                </Text>
              </Box>
              <CodeSnippet store={store} color={color} />
            </Box>
          </Column>
        </Row>

        {showMap && (
          <Row sx={{ mt: 3 }}>
            <Column start={[1, 1, 2, 2]} width={[6, 8, 10, 10]}>
              <ZarrMapViewer
                url={store.url}
                format={store.format}
                color={color}
                bbox={store.bbox}
                group={store.group}
              />
            </Column>
          </Row>
        )}
        {store.variables && store.variables.length > 0 && (
          <Row sx={{ mt: 4 }}>
            <Column start={[1, 1, 2, 2]} width={[6, 8, 10, 10]}>
              <Text
                // @ts-ignore
                sx={labelStyle}
              >
                Variables ({store.variables.length})
              </Text>
              <Box
                as='table'
                sx={{
                  width: '100%',
                  mt: 2,
                  borderCollapse: 'collapse',
                  fontSize: [0, 0, 0, 1],
                  fontFamily: 'mono',
                  'td, th': {
                    textAlign: 'left',
                    py: 1,
                    pr: 3,
                    borderBottom: '1px solid',
                    borderColor: 'muted',
                    verticalAlign: 'top',
                  },
                  th: { color: 'secondary', fontWeight: 'body' },
                }}
              >
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Units</th>
                    <th>Dims</th>
                  </tr>
                </thead>
                <tbody>
                  {store.variables.slice(0, allVars ? undefined : VAR_LIMIT).map((v) => (
                    <tr key={v.name}>
                      <td>{v.name}</td>
                      <td>{v.long_name}</td>
                      <td>{v.units}</td>
                      <td>{v.dims.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </Box>
              {store.variables.length > VAR_LIMIT && (
                <Button
                  size='xs'
                  inverted
                  sx={{ ...labelStyle, mt: 3 }}
                  onClick={() => setAllVars((prev) => !prev)}
                >
                  {allVars
                    ? 'Show fewer'
                    : `Show all ${store.variables.length} variables`}
                </Button>
              )}
            </Column>
          </Row>
        )}

      </AnimateHeight>
    </Box>
  )
}

export const FeedstockStores: React.FC<{
  stores: Store[] | undefined
  color: string
}> = ({ stores, color }) => {
  return (
    <>
      <Row>
        <Column start={[1, 1, 2, 2]} width={[6]}>
          <Box sx={{ mb: 4, mt: 2 }}>
            <Box sx={{ fontSize: [2, 2, 2, 3] }}> Access Data </Box>
          </Box>
        </Column>
      </Row>

      {stores ? (
        stores.map((store, i) => (
          <FeedstockStore
            key={store.id}
            store={store}
            color={color}
            defaultExpanded={i === 0}
            // Identical meta on every store repeats the facts block; show format only.
            formatOnly={
              stores.length > 1 &&
              stores.every((s) => storeMeta(s) === storeMeta(stores[0]))
            }
          />
        ))
      ) : (
        <Box sx={{ mb: 4 }}>
          <Row>
            <Column start={[1, 1, 2, 2]} width={[6, 4, 4, 5]}>
              <Box sx={{ mt: 2, fontSize: [1, 1, 1, 2] }}>
                Due to the large number of data stores associated with the
                feedstock, we have opted not to list them individually here.
                Instead, you can access information about the data stores by
                visiting the feedstock&apos;s GitHub repository linked below.
              </Box>
            </Column>
          </Row>
        </Box>
      )}
    </>
  )
}
