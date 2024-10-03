import { TooltipWrapper } from '@/components/tooltip-wrapper'
import { Store } from '@/types/types'
import { Column, Row } from '@carbonplan/components'
import React, { useState } from 'react'
import { Box, Flex, Text } from 'theme-ui'
import { CodeSnippet } from './code-snippet'
import { DataViewer } from './data-viewer'
import { DatasetRepr } from './dataset-repr'

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
      <Row columns={[1, 1, 12, 12]}>
        <Column start={[1, 1, 2, 2]} width={[1, 1, 3, 3]}>
          <TooltipWrapper
            tooltip={tooltipContent}
            color={color}
            expanded={!store.public && tooltipExpanded}
            setExpanded={setTooltipExpanded}
          >
            <Text
              sx={{
                mr: [2],
                color: color,
                fontSize: [2, 2, 2, 3],
                textTransform: 'uppercase',
              }}
            >
              {store.name || store.id}
            </Text>
          </TooltipWrapper>
        </Column>
        <Column start={[1, 1, 5, 5]} width={[1, 1, 5, 5]}>
          <Flex sx={{ flexDirection: ['column'], gap: 4, mt: [6, 6, 0, 0] }}>
            <Flex sx={{ flexDirection: 'column', gap: 2 }}>
              <Text
                sx={{
                  color: 'muted',
                  fontSize: 0,
                  fontFamily: 'mono',
                  letterSpacing: 'mono',
                  textTransform: 'uppercase',
                }}
              >
                Data Viewer
              </Text>
              <DataViewer store={store} color={color} />
            </Flex>
            <Flex sx={{ flexDirection: 'column', gap: 2 }}>
              <Text
                sx={{
                  color: 'muted',
                  fontSize: 0,
                  fontFamily: 'mono',
                  letterSpacing: 'mono',
                  textTransform: 'uppercase',
                }}
              >
                Load Dataset
              </Text>
              <CodeSnippet url={store.url} color={color} />
            </Flex>
            <Flex sx={{ flexDirection: 'column', gap: 2 }}>
              <TooltipWrapper
                tooltip={tooltipContent}
                color={color}
                expanded={!store.public && tooltipExpanded}
                setExpanded={setTooltipExpanded}
              >
                <Text
                  sx={{
                    color: 'muted',
                    fontSize: 0,
                    fontFamily: 'mono',
                    letterSpacing: 'mono',
                    textTransform: 'uppercase',
                  }}
                >
                  Metadata
                </Text>
              </TooltipWrapper>
              <DatasetRepr url={store.url} />
            </Flex>
          </Flex>
        </Column>
      </Row>
    </Box>
  )
}
