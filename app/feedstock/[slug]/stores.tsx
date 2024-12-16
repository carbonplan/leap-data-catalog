'use client'

import { TooltipWrapper } from '@/components/tooltip-wrapper'
import { Store } from '@/types/types'
import { Button, Column, Expander, Row } from '@carbonplan/components'
import React, { Suspense, useCallback, useState } from 'react'
import AnimateHeight from 'react-animate-height'
import { Box, Text } from 'theme-ui'
import { CodeSnippet } from './code-snippet'
import { DataViewer } from './data-viewer'
import DatasetReprFetcher from './dataset-repr-fetcher'
import DatasetReprFetcherServer from './dataset-repr-fetcher-server'

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
}> = ({ store, color }) => {
  const [expanded, setExpanded] = useState(false)
  const [tooltipExpanded, setTooltipExpanded] = useState(false)

  const serverDataPromise = useCallback(
    () => DatasetReprFetcherServer({ store }),
    [store],
  )

  const tooltipContent = !store.public
    ? 'Access requires credentials or a Columbia-LEAP JupyterHub server.'
    : store.geospatial
      ? ''
      : 'This dataset contains non-geospatial data not supported by the data viewer.'

  return (
    <Box sx={{ mb: 4 }}>
      <Row>
        <Column start={[1, 1, 2, 2]} width={[6, 4, 4, 5]}>
          <Box>
            {' '}
            <TooltipWrapper tooltip={tooltipContent} color={color}>
              <Button
                as='div'
                sx={{
                  color: color,
                  fontSize: [2, 2, 2, 3],
                  textTransform: 'uppercase',
                }}
                onClick={() => setExpanded((prev) => !prev)}
              >
                <Text sx={{ mr: [2] }}>{store.name || store.id}</Text>
                <Expander value={expanded} />
              </Button>
            </TooltipWrapper>
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

              <DataViewer store={store} color={color} />
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
              <CodeSnippet
                url={store.url}
                color={color}
                xarrayOpenKwargs={store.xarray_open_kwargs}
              />
            </Box>
          </Column>

          <Column start={[1, 5, 7, 7]} width={[6, 4, 5, 5]}>
            <Box sx={{ mt: 2 }}>
              <TooltipWrapper tooltip={tooltipContent} color={color}>
                <Box sx={{ mb: 2 }}>
                  <Text
                    // @ts-ignore
                    sx={labelStyle}
                  >
                    Metadata
                  </Text>
                </Box>
              </TooltipWrapper>

              <Suspense fallback={<div>Loading dataset representation...</div>}>
                <DatasetReprFetcher
                  store={store}
                  serverDataPromise={serverDataPromise}
                />
              </Suspense>
            </Box>
          </Column>
        </Row>
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

      {stores &&
        stores.map((store, index) => (
          <FeedstockStore key={store.id} store={store} color={color} />
        ))}
    </>
  )
}
