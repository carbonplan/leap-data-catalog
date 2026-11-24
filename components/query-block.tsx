/** @jsxImportSource theme-ui */
import { CodeBlock } from '@/components/code-block'

export const QueryBlock = ({ catalogUrl }: { catalogUrl: string }) => (
  <details sx={{ mt: '34px', border: '1px solid', borderColor: 'line' }}>
    <summary sx={{ px: '14px', py: '9px', fontSize: 1, cursor: 'pointer' }}>
      Query this catalog from Python
    </summary>
    <CodeBlock
      code={`import rustac

url = '${catalogUrl}'
items = rustac.search_sync(url, filter="a_contains(keywords, 'ocean')")
for item in items:
    print(item['id'], item['properties']['title'])
`}
    />
  </details>
)
