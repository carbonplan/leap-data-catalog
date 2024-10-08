import { TooltipWrapper } from '@/components/tooltip-wrapper'
import { Store } from '@/types/types'
import { Column, Row } from '@carbonplan/components'
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

export const FeedstockStore: React.FC<{ store: Store; color: string }> = ({
  store,
  color,
}) => {
  const [tooltipExpanded, setTooltipExpanded] = useState(false)

  const tooltipContent = !store.public
    ? 'Access requires credentials or a Columbia-LEAP JupyterHub server.'
    : store.geospatial
      ? ''
      : 'This dataset contains non-geospatial data not supported by the data viewer.'

  return (
    <Box sx={{ ml: [3, 4, 5, 6] }}>
      <Row columns={[6, 6, 8, 12]}>
        <Column start={[1, 1, 2, 2]} width={[6, 6, 6, 10]}>
          <Grid columns={[1, 1, 2, 2]}>
            <Box sx={{ mb: 2 }}>
              <TooltipWrapper
                tooltip={tooltipContent}
                color={color}
                expanded={!store.public && tooltipExpanded}
                setExpanded={setTooltipExpanded}
              >
                <Text
                  sx={{
                    color: color,
                    fontSize: [2, 2, 2, 3],
                    textTransform: 'uppercase',
                  }}
                >
                  {store.name || store.id}
                </Text>
              </TooltipWrapper>
            </Box>
            <Box>
              <Box>
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
                <DatasetRepr url={store.url} />
              </Box>
            </Box>
          </Grid>
        </Column>
      </Row>
    </Box>
  )
}
