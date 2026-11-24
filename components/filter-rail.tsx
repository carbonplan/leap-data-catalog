/** @jsxImportSource theme-ui */
import { checkSx, labelSx } from '@/components/styles'
import { Feedstock } from '@/types/types'
import { domainColor, facetCounts, facetLabel } from '@/utils/listing'
import type { Facet, View } from '@/utils/listing'

export const DomainDot = ({ color }: { color: string }) => (
  <span
    aria-hidden
    sx={{
      flex: 'none',
      width: 9,
      height: 9,
      borderRadius: '50%',
      bg: color,
    }}
  />
)

interface FilterRailProps {
  id: string
  feedstocks: Feedstock[]
  view: View
  /** Phones only; wider screens always show the rail. */
  open: boolean
  onToggle: (facet: Facet, value: string) => void
}

export const FilterRail: React.FC<FilterRailProps> = ({
  id,
  feedstocks,
  view,
  open,
  onToggle,
}) => (
  <aside
    id={id}
    aria-label='Filters'
    sx={{
      display: 'grid',
      alignContent: 'start',
      gap: 4,
      '@media (max-width: 860px)': {
        display: open ? 'grid' : 'none',
        gridTemplateColumns: '1fr 1fr',
        p: 3,
        border: '1px solid',
        borderColor: 'line',
      },
    }}
  >
    {facetCounts(feedstocks, view).map(({ key, label, values }) => (
      <fieldset key={key} sx={{ m: 0, p: 0, border: 0, minWidth: 0 }}>
        <legend sx={{ ...labelSx, p: 0, mb: '6px' }}>{label}</legend>
        {values.map(({ value, count }) => (
          <label key={value} sx={checkSx}>
            <input
              type='checkbox'
              checked={view[key].includes(value)}
              onChange={() => onToggle(key, value)}
            />
            {key === 'domain' && <DomainDot color={domainColor([value])} />}
            <span>{facetLabel(key, value)}</span>
            <span
              sx={{
                ml: 'auto',
                color: 'secondary',
                fontSize: '13px',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {count}
            </span>
          </label>
        ))}
      </fieldset>
    ))}
  </aside>
)
