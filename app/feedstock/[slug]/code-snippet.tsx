import { Store } from '@/types/types'
import { findSnippet, openSnippet } from '@/utils/snippet'
import { Button } from '@carbonplan/components'
import { Check, Down } from '@carbonplan/icons'
import { Code } from '@carbonplan/prism'
import React, { useState } from 'react'
import { Box } from 'theme-ui'

const tabs = ['open', 'find'] as const

interface CodeSnippetProps {
  store: Store
  itemId: string
  catalogUrl: string
  color: string
}

export const CodeSnippet: React.FC<CodeSnippetProps> = ({
  store,
  itemId,
  catalogUrl,
  color,
}) => {
  const [copied, setCopied] = useState(false)
  const [tick, setTick] = useState<NodeJS.Timeout | null>(null)
  const [tab, setTab] = useState<(typeof tabs)[number]>('open')

  const snippet =
    tab === 'open' ? openSnippet(store) : findSnippet(store, itemId, catalogUrl)

  const handleClick = () => {
    navigator.clipboard.writeText(snippet)
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
      <Box sx={{ display: 'flex', gap: 3, mb: 1 }}>
        {tabs.map((t) => (
          <Button
            key={t}
            size='xs'
            onClick={() => setTab(t)}
            sx={{
              color: t === tab ? color : 'secondary',
              fontFamily: 'mono',
              letterSpacing: 'mono',
              textTransform: 'uppercase',
            }}
          >
            {t}
          </Button>
        ))}
      </Box>
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
        onClick={handleClick}
      >
        {copied ? 'Copied' : 'Copy'}
      </Button>

      <Code language='python'>{snippet}</Code>
    </Box>
  )
}
