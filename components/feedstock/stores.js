import { Box, Flex, Text } from 'theme-ui'
import { Button, Expander, Link } from '@carbonplan/components'
import { RotatingArrow } from '@carbonplan/icons'
import { Code } from '@carbonplan/prism'
import AnimateHeight from 'react-animate-height'

import { useState } from 'react'
import { Check, Down } from '@carbonplan/icons'

const getSnippet = (url) => `
import xarray as xr

store = '${url}'
ds = xr.open_dataset(store, engine='zarr', chunks={})
`

const Store = ({ name, url }) => {
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
    <Box sx={{ fontSize: 1, '& pre': { fontSize: '10px', my: 2 } }}>
      <Flex sx={{ alignItems: 'center', gap: 2 }}>
        {name}
        <Expander
          value={expanded}
          onClick={() => setExpanded((prev) => !prev)}
        />
      </Flex>
      <AnimateHeight
        duration={100}
        height={expanded ? 'auto' : 0}
        easing={'linear'}
      >
        <Box sx={{ position: 'relative' }}>
          <Button
            sx={{
              fontSize: 0,
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
                <Check sx={{ ml: '3px' }} />
              ) : (
                <Down sx={{ ml: '2px' }} />
              )
            }
            onClick={() => handleClick(url)}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>

          <Code language='python'>{getSnippet(url)}</Code>

          <Button
            size={'xs'}
            href={`https://data-viewer-git-katamartin-pyramid-maps-carbonplan.vercel.app/?dataset=${url}`}
            target='_blank'
            rel='noopener noreferrer'
            suffix={
              <RotatingArrow
                sx={{ ml: '2px', mt: '-1px', width: 14, height: 14 }}
              />
            }
            sx={{
              mt: 3,
              mb: 2,
              p: 2,
              bg: 'primary',
              color: 'background',
              fontFamily: 'mono',
              textAlign: 'center',
              fontSize: 1,
              fontWeight: 'bold',
              cursor: 'pointer',
              '&:hover': {
                bg: 'secondary',
              },
              borderRadius: 'small',
              alignSelf: 'center',
            }}
          >
            Open in Data Viewer
          </Button>
        </Box>
      </AnimateHeight>
    </Box>
  )
}

export const Stores = ({ stores }) => {
  return (
    <Box>
      <Text sx={{ fontSize: 1, fontWeight: 'bold', color: 'muted' }}>
        {stores.length > 1 ? 'Stores:' : 'Store:'}
      </Text>
      <Flex sx={{ flexDirection: 'column', gap: 3, ml: 4 }}>
        {stores.map((store) => (
          <Store key={store.name} {...store} />
        ))}
      </Flex>
    </Box>
  )
}
