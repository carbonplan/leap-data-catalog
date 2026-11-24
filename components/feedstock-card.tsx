/** @jsxImportSource theme-ui */
import {
  Badges,
  DatasetLink,
  GroupMembers,
  GroupToggle,
  stretchSx,
} from '@/components/entry-parts'
import { headingSx, specSx } from '@/components/styles'
import { entrySpec } from '@/utils/listing'
import type { Entry } from '@/utils/listing'
import { sizedPhoto } from '@/utils/thumbnail'
import { Image } from 'theme-ui'

interface FeedstockCardProps {
  entry: Entry
  open?: boolean
  onToggle?: () => void
  /** Larger photo, no spec line or badges. */
  featured?: boolean
}

export const FeedstockCard: React.FC<FeedstockCardProps> = ({
  entry,
  open = false,
  onToggle,
  featured,
}) => {
  const first = entry.items[0]
  const group = entry.items.length > 1 && onToggle

  return (
    <li sx={{ minWidth: 0 }}>
      <div
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '7px',
        }}
      >
        <div
          sx={{
            position: 'relative',
            height: featured ? 'clamp(120px, 21svh, 210px)' : 120,
            overflow: 'hidden',
            bg: 'hinted',
            '::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              bg: first.color,
              opacity: 0.42,
              mixBlendMode: 'multiply',
            },
          }}
        >
          <Image
            src={sizedPhoto(first.thumbnail, 640)}
            alt=''
            loading={featured ? 'eager' : 'lazy'}
            width={640}
            height={240}
            sx={{
              display: 'block',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'grayscale(100%)',
            }}
          />
        </div>
        <h3 sx={{ ...headingSx, fontSize: 3, lineHeight: 1.2 }}>
          {group ? (
            entry.title
          ) : (
            <DatasetLink feedstock={first} sx={stretchSx}>
              {entry.title}
            </DatasetLink>
          )}
        </h3>
        <p sx={{ m: 0, fontSize: 1, lineHeight: 1.4, color: 'secondary' }}>
          {first.summary}
        </p>
        {!featured && (
          <>
            <p sx={specSx}>{entrySpec(entry)}</p>
            <div sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Badges entry={entry} />
            </div>
          </>
        )}
        {group && (
          <GroupToggle
            entry={entry}
            open={open}
            onToggle={onToggle}
            sx={stretchSx}
          />
        )}
      </div>
      {group && <GroupMembers entry={entry} open={open} />}
    </li>
  )
}
