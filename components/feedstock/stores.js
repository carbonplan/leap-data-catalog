import { Button, Expander } from '@carbonplan/components'
import { RotatingArrow } from '@carbonplan/icons'
import { Code } from '@carbonplan/prism'
import AnimateHeight from 'react-animate-height'
import { Box, Flex, Text } from 'theme-ui'
import { TooltipWrapper } from '@/components/tooltip'

import { Check, Down } from '@carbonplan/icons'
import { useState } from 'react'

const getSnippet = (url) => `
import xarray as xr

store = '${url}'
ds = xr.open_dataset(store, engine='zarr', chunks={})
`

const Store = ({ dataset, color }) => {
  const { id, name, url, 'ncviewjs:rechunking': rechunking } = dataset
  // Checking if rechunking is not null and has at least one item
  const pyramid =
    rechunking && rechunking.length > 0 ? rechunking[0].path : null
  const [expanded, setExpanded] = useState(false)

  const [copied, setCopied] = useState(false)
  const [tick, setTick] = useState(null)
  const [tooltipExpanded, setTooltipExpanded] = useState(false)

  const handleClick = (url) => {
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

  const tooltipContent = dataset.public
    ? ''
    : 'This dataset is private. Access requires credentials or a Columbia-LEAP JupyterHub server.'

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
        <Box
          sx={{
            position: 'relative',
          }}
        >
          <Button
            sx={{
              color: color,
              fontSize: [0, 0, 0, 1],
              letterSpacing: 'mono',
              textTransform: 'uppercase',
              fontFamily: 'mono',
              position: 'absolute',
              mt: 2,
              mr: 2,
              right: 0,
              top: 0,
              textTransform: 'uppercase',
            }}
            suffix={
              copied ? (
                <Check
                  sx={{
                    transform: ['translateY(-15%)'],
                  }}
                />
              ) : (
                <Down sx={{ transform: 'rotate(135deg) translateY(1px)' }} />
              )
            }
            onClick={() => handleClick(url)}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>

          <Code language='python'>{getSnippet(url)}</Code>

          <Button
            href={`https://ncview-js.staging.carbonplan.org/?dataset=${
              pyramid || url
            }`}
            target='_blank'
            rel='noopener noreferrer'
            onClick={(e) => {
              if (!dataset.public) {
                e.preventDefault() // Prevents the link from being followed
              }
            }}
            suffix={
              <RotatingArrow
                sx={{
                  transform: ['translateY(-6%)'],
                }}
              />
            }
            sx={{
              color: color,
              fontSize: [0, 0, 0, 1],
              letterSpacing: 'mono',
              textTransform: 'uppercase',
              fontFamily: 'mono',
              mt: 3,
              mb: 2,
              cursor: dataset.public ? 'pointer' : 'not-allowed', // Changes cursor to indicate disabled state
              color: dataset.public ? color : 'secondary', // Grey out the button when disabled
              pointerEvents: dataset.public ? 'auto' : 'none', // Disables pointer events when dataset is not public
            }}
          >
            Open in Data Viewer
          </Button>
        </Box>
      </AnimateHeight>
    </Flex>
  )
}

export const Stores = ({ stores, color }) => {
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
