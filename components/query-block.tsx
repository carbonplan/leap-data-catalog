/** @jsxImportSource theme-ui */
import { controlSx } from '@/components/styles'
import { Code } from '@carbonplan/prism'
import { useState } from 'react'

export const QueryBlock = ({ catalogUrl }: { catalogUrl: string }) => {
  const [copied, setCopied] = useState(false)
  const query = `import rustac

url = '${catalogUrl}'
items = rustac.search_sync(url, filter="a_contains(keywords, 'ocean')")
for item in items:
    print(item['id'], item['properties']['title'])
`
  const copy = async () => {
    await navigator.clipboard.writeText(query)
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }

  return (
    <details sx={{ mt: '34px', border: '1px solid', borderColor: 'line' }}>
      <summary sx={{ px: '14px', py: '9px', fontSize: 1, cursor: 'pointer' }}>
        Query this catalog from Python
      </summary>
      <div sx={{ position: 'relative', '& pre': { m: 0, pr: 8 } }}>
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
        <Code language='python'>{query}</Code>
      </div>
    </details>
  )
}
