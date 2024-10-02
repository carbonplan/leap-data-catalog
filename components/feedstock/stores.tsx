import React, { useState } from 'react'
import { Button, Expander } from '@carbonplan/components'
import { RotatingArrow, Arrow, Check, Down } from '@carbonplan/icons'
import { Code } from '@carbonplan/prism'
import AnimateHeight from 'react-animate-height'
import { Box, Flex, Text } from 'theme-ui'
import { TooltipWrapper } from '@/components/tooltip-wrapper'
import { DataViewer } from '@/components/data-viewer'
import { CodeSnippet } from '@/components/code-snippet'
interface Rechunking {
  path: string
}

interface Dataset {
  id: string
  name?: string
  url: string
  'ncviewjs:rechunking'?: Rechunking[]
  public?: boolean
  geospatial?: boolean
}

interface StoreProps {
  dataset: Dataset
  color: string
}

interface StoresProps {
  stores: Dataset[]
  color: string
}

const Store: React.FC<StoreProps> = ({ dataset, color }) => {
  const { id, name, url, 'ncviewjs:rechunking': rechunking } = dataset
  const [expanded, setExpanded] = useState(false)

  const [tooltipExpanded, setTooltipExpanded] = useState(false)

  const tooltipContent = !dataset.public
    ? 'Access requires credentials or a Columbia-LEAP JupyterHub server.'
    : dataset.geospatial
      ? ''
      : 'This dataset contains non-geospatial data not supported by the data viewer.'

  return (
    <Flex sx={{ flexDirection: 'column' }}>
      <TooltipWrapper
        tooltip={tooltipContent}
        color={color}
        expanded={!dataset.public && tooltipExpanded}
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
          <Text sx={{ mr: [2] }}>{name || id}</Text>
          <Expander value={expanded} />
        </Button>
      </TooltipWrapper>

      <AnimateHeight
        duration={100}
        height={expanded ? 'auto' : 0}
        easing={'linear'}
      >
        <CodeSnippet url={url} color={color} />
      </AnimateHeight>
    </Flex>
  )
}

export const Stores: React.FC<StoresProps> = ({ stores, color }) => {
  return (
    <Flex
      sx={{
        flexDirection: 'column',
        gap: [3, 3, 3, 4],
        mt: 4,
        justifyContent: 'space-between',
      }}
    >
      {stores.map((store) => (
        <Store key={store.id} dataset={store} color={color} />
      ))}
    </Flex>
  )
}
