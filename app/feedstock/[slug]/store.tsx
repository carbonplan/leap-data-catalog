'use client'

import { TooltipWrapper } from '@/components/tooltip-wrapper'
import { Store } from '@/types/types'
import React, { useState } from 'react'
import { Box, Grid, Text } from 'theme-ui'
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
  const [tooltipExpanded, setTooltipExpanded] = useState(false)

  const tooltipContent = !store.public
    ? 'Access requires credentials or a Columbia-LEAP JupyterHub server.'
    : store.geospatial
      ? ''
      : 'This dataset contains non-geospatial data not supported by the data viewer.'

  return (
    <Box>
      <Grid gap={4} columns={[6, 6, 8, 12]}>
        {/* First row: store.name */}
        <Box sx={{ gridColumn: ['1 / -1', '1 / -1', '2 / -1', '2 / -1'] }}>
          <TooltipWrapper
            tooltip={tooltipContent}
            color={color}
            expanded={!store.public && tooltipExpanded}
            setExpanded={setTooltipExpanded}
          >
            <Text
              sx={{
                color: color,
                fontSize: [3, 3, 4, 5],
                textTransform: 'uppercase',
                fontWeight: 'bold',
              }}
            >
              {store.name || store.id}
            </Text>
          </TooltipWrapper>
        </Box>

        {/* Second row: two columns */}
        <Box sx={{ gridColumn: ['1 / -1', '1 / -1', '2 / -1', '2 / -1'] }}>
          <Grid gap={4} columns={[6, 6, 8, 12]}>
            {/* First column: DataViewer and CodeSnippet */}
            <Box sx={{ gridColumn: ['1 / -1', '1 / -1', '1 / 4', '1 / 5'] }}>
              <Box mb={3}>
                <Text
                  // @ts-ignore
                  sx={labelStyle}
                >
                  Data Viewer
                </Text>
                <DataViewer store={store} color={color} />
              </Box>
              <Box>
                <Text
                  // @ts-ignore
                  sx={labelStyle}
                >
                  Load Dataset
                </Text>
                <CodeSnippet url={store.url} color={color} />
              </Box>
            </Box>

            {/* Second column: DatasetRepr */}
            <Box sx={{ gridColumn: ['1 / -1', '1 / -1', '5 / -1', '7 / -1'] }}>
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
          </Grid>
        </Box>
      </Grid>
    </Box>
  )
}
