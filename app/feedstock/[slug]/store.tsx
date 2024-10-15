'use client'

import { TooltipWrapper } from '@/components/tooltip-wrapper'
import { Store } from '@/types/types'
import { Button, Column, Expander, Row } from '@carbonplan/components'
import React, { useState } from 'react'
import AnimateHeight from 'react-animate-height'
import { Box, Text } from 'theme-ui'
import { CodeSnippet } from './code-snippet'
import { DataViewer } from './data-viewer'
import { DatasetRepr } from './dataset-repr'

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
  datasetRepr: { repr: any; error: string | null }
}> = ({ store, color, datasetRepr }) => {
  const [expanded, setExpanded] = useState(false)
  const [tooltipExpanded, setTooltipExpanded] = useState(false)

  const tooltipContent = !store.public
    ? 'Access requires credentials or a Columbia-LEAP JupyterHub server.'
    : store.geospatial
      ? ''
      : 'This dataset contains non-geospatial data not supported by the data viewer.'

  return (
    <Box sx={{ mb: 4 }}>
      <Row>
        <Column start={[1, 1, 2, 2]} width={[6, 4, 3, 5]}>
          <Box>
            <TooltipWrapper
              tooltip={tooltipContent}
              color={color}
              expanded={!store.public && tooltipExpanded}
              setExpanded={setTooltipExpanded}
            >
              <Button
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
            <Box>
              <Text
                // @ts-ignore
                sx={labelStyle}
              >
                Data Viewer
              </Text>
              <DataViewer store={store} color={color} />
            </Box>
          </Column>
          <Column start={[1, 5, 7, 7]} width={[6, 4, 5, 5]}>
            <Box>
              <Text
                // @ts-ignore
                sx={labelStyle}
              >
                Load Dataset
              </Text>
              <CodeSnippet url={store.url} color={color} />
            </Box>
          </Column>

          <Column start={[1, 5, 7, 7]} width={[6, 4, 5, 5]}>
            <Box>
              <TooltipWrapper
                tooltip={tooltipContent}
                color={color}
                expanded={!store.public && tooltipExpanded}
                setExpanded={setTooltipExpanded}
              >
                <Text
                  // @ts-ignore
                  sx={labelStyle}
                >
                  Metadata
                </Text>
              </TooltipWrapper>
              <DatasetRepr data={datasetRepr.repr} error={datasetRepr.error} />
            </Box>
          </Column>
        </Row>
      </AnimateHeight>
    </Box>
  )
}
