import { Button, Expander } from '@carbonplan/components'
import { RotatingArrow } from '@carbonplan/icons'
import { Code } from '@carbonplan/prism'
import AnimateHeight from 'react-animate-height'
import { Box, Flex, Text } from 'theme-ui'

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

  return (
    <Flex
      sx={{ flexDirection: 'column', '& pre': { fontSize: '10px', my: 2 } }}
    >
      <Button
        sx={{
          textTransform: 'uppercase',
        }}
        onClick={() => setExpanded((prev) => !prev)}
      >
        <Flex
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {' '}
          <Text>{name || id}</Text>
          <Expander value={expanded} sx={{ ml: 2 }} />
        </Flex>
      </Button>
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
              fontSize: [0, 0, 0, 1],
              letterSpacing: 'mono',
              textTransform: 'uppercase',
              fontFamily: 'mono',
              color: 'secondary',
              position: 'absolute',
              mt: 2,
              mr: 2,
              right: 0,
              top: 0,
              textTransform: 'uppercase',
            }}
            suffix={
              copied ? (
                <Check sx={{ transform: 'translateY(-10%)' }} />
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
        {stores.length > 1 ? 'Stores:' : 'Store:'}
      </Text>
      <Flex sx={{ flexDirection: 'column' }}>
        {stores.map((store) => (
          <Store key={store.id} dataset={store} color={color} />
        ))}
      </Flex>
    </Flex>
  )
}
