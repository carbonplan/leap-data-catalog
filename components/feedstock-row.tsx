/** @jsxImportSource theme-ui */
import {
  Badges,
  DatasetLink,
  GroupMembers,
  GroupToggle,
} from '@/components/entry-parts'
import { DomainDot } from '@/components/filter-rail'
import { headingSx, specSx } from '@/components/styles'
import { entrySpec } from '@/utils/listing'
import type { Entry } from '@/utils/listing'

interface FeedstockRowProps {
  entry: Entry
  open: boolean
  onToggle: () => void
}

export const FeedstockRow: React.FC<FeedstockRowProps> = ({
  entry,
  open,
  onToggle,
}) => {
  const first = entry.items[0]
  const group = entry.items.length > 1

  return (
    <li
      sx={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        gap: '4px 20px',
        py: '15px',
        borderBottom: '1px solid',
        borderColor: 'line',
        '@media (max-width: 600px)': {
          gridTemplateColumns: 'minmax(0, 1fr)',
        },
      }}
    >
      <div sx={{ display: 'grid', gap: '4px', minWidth: 0 }}>
        <h3
          sx={{
            ...headingSx,
            display: 'flex',
            alignItems: 'baseline',
            gap: '9px',
            fontSize: 3,
            lineHeight: 1.25,
          }}
        >
          <DomainDot color={first.color} />
          {group ? (
            entry.title
          ) : (
            <DatasetLink feedstock={first}>{entry.title}</DatasetLink>
          )}
        </h3>
        <p sx={{ m: 0, fontSize: '15px', lineHeight: 1.4, maxWidth: '78ch' }}>
          {first.summary}
        </p>
        <p sx={specSx}>{entrySpec(entry)}</p>
        {group && <GroupToggle entry={entry} open={open} onToggle={onToggle} />}
        {group && <GroupMembers entry={entry} open={open} sideBySide />}
      </div>
      <div
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          gap: '6px',
        }}
      >
        <Badges entry={entry} />
      </div>
    </li>
  )
}
