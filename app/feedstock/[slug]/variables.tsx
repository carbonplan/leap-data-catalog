/** @jsxImportSource theme-ui */
import { controlSx, labelSx } from '@/components/styles'
import { Cube } from '@/types/types'
import { dimensionRows, variableRows } from '@/utils/cube'
import { ReactNode, useState } from 'react'
import { ThemeUICSSObject } from 'theme-ui'

const FILTER_ABOVE = 8

const tableSx: ThemeUICSSObject = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 1,
  th: {
    ...labelSx,
    textAlign: 'left',
    fontWeight: 400,
    whiteSpace: 'nowrap',
    py: 2,
    pl: 0,
    pr: '14px',
    borderBottom: '1px solid',
    borderColor: 'text',
  },
  td: {
    py: '9px',
    pl: 0,
    pr: '14px',
    verticalAlign: 'top',
    borderBottom: '1px solid',
    borderColor: 'line',
  },
}

const nameSx: ThemeUICSSObject = { fontFamily: 'mono', fontSize: '13px' }

const Table = ({
  columns,
  children,
}: {
  columns: string[]
  children: ReactNode
}) => (
  // Focusable, so a wide table can be scrolled with the keyboard.
  <div
    tabIndex={0}
    role='region'
    aria-label={`${columns[0]} table`}
    sx={{ overflowX: 'auto' }}
  >
    <table sx={tableSx}>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c} scope='col'>
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
)

export const Variables = ({ cube }: { cube?: Cube }) => {
  const [query, setQuery] = useState('')
  if (!cube)
    return (
      <p sx={{ m: 0, fontSize: 1, color: 'secondary' }}>
        No variable list for this store.
      </p>
    )
  const count = Object.keys(cube['cube:variables']).length
  const rows = variableRows(cube, query)

  return (
    <>
      <Table columns={['Dimension', 'Size', 'From', 'To', 'Units']}>
        {dimensionRows(cube).map((d) => (
          <tr key={d.name}>
            <td sx={nameSx}>{d.name}</td>
            <td>{d.size}</td>
            <td>{d.from}</td>
            <td>{d.to}</td>
            <td>{d.unit}</td>
          </tr>
        ))}
      </Table>
      {count > FILTER_ABOVE && (
        <input
          type='search'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Filter ${count} variables`}
          aria-label='Filter variables'
          sx={{ ...controlSx, cursor: 'text', mt: 2 }}
        />
      )}
      <Table columns={['Variable', 'Units', 'Dimensions']}>
        {rows.map((v) => (
          <tr key={v.name}>
            <td sx={{ overflowWrap: 'anywhere', minWidth: 160 }}>
              <span sx={nameSx}>{v.name}</span>
              {v.label && (
                <span
                  sx={{
                    display: 'block',
                    maxWidth: '60ch',
                    fontSize: '13px',
                    color: 'secondary',
                  }}
                >
                  {v.label}
                </span>
              )}
            </td>
            <td>{v.unit}</td>
            <td sx={nameSx}>{v.dimensions.join(', ')}</td>
          </tr>
        ))}
        {rows.length === 0 && (
          <tr>
            <td colSpan={3}>No variables match.</td>
          </tr>
        )}
      </Table>
    </>
  )
}
