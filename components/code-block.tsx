/** @jsxImportSource theme-ui */
import { controlSx } from '@/components/styles'
import { Code } from '@carbonplan/prism'
import { useState } from 'react'

export const CodeBlock = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }

  return (
    <div
      sx={{
        position: 'relative',
        '& pre': {
          m: 0,
          pr: 8,
          fontSize: 1,
          '@media (max-width: 600px)': { pt: '52px', pr: 3 },
        },
      }}
    >
      <button
        type='button'
        onClick={copy}
        sx={{
          ...controlSx,
          position: 'absolute',
          top: 2,
          right: 2,
          height: 32,
        }}
      >
        <span aria-live='polite'>{copied ? 'Copied' : 'Copy'}</span>
      </button>
      <Code language='python'>{code}</Code>
    </div>
  )
}
