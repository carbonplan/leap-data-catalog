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

const getSnippet = (url: string) => `
import xarray as xr

store = '${url}'
ds = xr.open_dataset(store, engine='zarr', chunks={})
`

const Store: React.FC<StoreProps> = ({ dataset, color }) => {
  const { id, name, url, 'ncviewjs:rechunking': rechunking } = dataset
  const pyramid =
    rechunking && rechunking.length > 0 ? rechunking[0].path : null
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [tick, setTick] = useState<NodeJS.Timeout | null>(null)
  const [tooltipExpanded, setTooltipExpanded] = useState(false)

  const handleClick = (url: string) => {
    const blank = document.createElement('textarea')
    document.body.appendChild(blank)
    blank.value = getSnippet(url)
    blank.select()
    document.execCommand('copy')
    document.body.removeChild(blank)
    if (tick) {
      clearTimeout(tick)
    }
    setCopied(true)
    const timeout = setTimeout(() => {
      setCopied(false)
    }, 1000)
    setTick(timeout)
  }

  const tooltipContent = !dataset.public
    ? 'Access requires credentials or a Columbia-LEAP JupyterHub server.'
    : dataset.geospatial
      ? ''
      : 'This dataset contains non-geospatial data not supported by the data viewer.'

  return (
    <Flex
      sx={{ flexDirection: 'column', '& pre': { fontSize: '10px', my: 2 } }}
    >
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
