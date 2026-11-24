'use client'

import { Store } from '@/types/types'
import { Button, Column, Expander, Row } from '@carbonplan/components'
import React, { useState } from 'react'
import AnimateHeight from 'react-animate-height'
import { Box, Text } from 'theme-ui'
import { CodeSnippet } from './code-snippet'
import { DataViewer } from './data-viewer'

const labelStyle = {
  color: 'muted',
  fontSize: 0,
  fontFamily: 'mono',
  letterSpacing: 'mono',
  textTransform: 'uppercase',
}

export const FeedstockStore: React.FC<{
  store: Store
  label: string
  itemId: string
  catalogUrl: string
  color: string
}> = ({ store, label, itemId, catalogUrl, color }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <Box sx={{ mb: 4 }}>
      <Row>
        <Column start={[1, 1, 2, 2]} width={[6, 4, 4, 5]}>
          <Box>
            {' '}
            <Button
              as='div'
              sx={{
                color: color,
                fontSize: [2, 2, 2, 3],
              }}
              onClick={() => setExpanded((prev) => !prev)}
            >
              <Text sx={{ mr: [2] }}>{label}</Text>
              <Expander value={expanded} />
            </Button>
          </Box>
        </Column>
      </Row>

      <AnimateHeight
        duration={100}
        height={expanded ? 'auto' : 0}
        easing={'linear'}
      >
        <Row sx={{ mt: 4 }}>
          <Column start={[1, 1, 2, 2]} width={[6, 4, 5, 5]}>
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

              {/* mount lazily so collapsed stores do not fetch */}
              {expanded && <DataViewer store={store} color={color} />}
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
                store={store}
                itemId={itemId}
                catalogUrl={catalogUrl}
                color={color}
              />
            </Box>
          </Column>
        </Row>
      </AnimateHeight>
    </Box>
  )
}

export const FeedstockStores: React.FC<{
  stores: Store[]
  itemId: string
  catalogUrl: string
  color: string
}> = ({ stores, itemId, catalogUrl, color }) => {
  // one store: "Access Data" is the expander itself; several: a header, then one expander per store
  const single = stores.length === 1
  return (
    <>
      {!single && (
        <Row>
          <Column start={[1, 1, 2, 2]} width={[6]}>
            <Box sx={{ mb: 4, mt: 2 }}>
              <Box sx={{ fontSize: [2, 2, 2, 3] }}> Access Data </Box>
            </Box>
          </Column>
        </Row>
      )}

      {stores.map((store) => (
        <FeedstockStore
          key={store.id}
          store={store}
          label={single ? 'Access Data' : store.name || store.id}
          itemId={itemId}
          catalogUrl={catalogUrl}
          color={color}
        />
      ))}
    </>
  )
}
