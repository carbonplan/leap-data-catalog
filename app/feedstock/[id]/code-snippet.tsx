import { Button } from '@carbonplan/components'
import { Check, Down } from '@carbonplan/icons'
import { Code } from '@carbonplan/prism'
import React, { useState } from 'react'
import { Box } from 'theme-ui'

const getSnippet = (url: string) => `
import xarray as xr

store = '${url}'
ds = xr.open_dataset(store, engine='zarr', chunks={})
`

interface CodeSnippetProps {
  url: string
  color: string
}

export const CodeSnippet: React.FC<CodeSnippetProps> = ({ url, color }) => {
  const [copied, setCopied] = useState(false)
  const [tick, setTick] = useState<NodeJS.Timeout | null>(null)

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

  return (
    <Box
      sx={{
        position: 'relative',
        '& pre': { fontSize: '10px', my: 0 },
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
    </Box>
  )
}