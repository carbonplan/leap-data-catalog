'use client'

import { Thumbnail } from '@/components/feedstock'
import { Feedstock } from '@/types/types'
import { formatMeta } from '@/utils/format'
import { alpha } from '@theme-ui/color'
import Link from 'next/link'
import { Box, Flex, Text } from 'theme-ui'

interface FeedstockCardProps {
  feedstock: Feedstock
  catalog?: string
}

export const FeedstockCard: React.FC<FeedstockCardProps> = ({
  feedstock,
  catalog,
}) => {
  const { slug, description, summary, thumbnail, color, title } = feedstock
  const badges = [
    feedstock.source === 'dynamical' && 'dynamical.org',
    feedstock.mapPreview && 'map preview',
    (feedstock.stores?.length ?? 0) > 1 && `${feedstock.stores?.length} stores`,
  ].filter(Boolean) as string[]

  const truncateDescription = (text: string, maxLength: number) => {
    if (text.length <= maxLength) {
      return text
    }
    return text.slice(0, maxLength).trim() + '...'
  }

  const truncatedDescription = summary ?? truncateDescription(description, 160)

  return (
    <Link
      href={
        catalog ? `/feedstock/${slug}?catalog=${catalog}` : `/feedstock/${slug}`
      }
      style={{
        textDecoration: 'none',
        color: 'inherit',
        display: 'block',
        height: '100%',
      }}
    >
      <Box
        id={slug}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          transition: 'all 0.3s ease',
          m: -2,
          p: 2,
          ':hover': {
            backgroundColor: alpha(color, 0.05),
          },
        }}
      >
        <Box sx={{ flex: '0 0 auto', position: 'relative' }}>
          <Thumbnail url={thumbnail} color={color} tags={feedstock.domain} />
        </Box>

        <Flex
          sx={{
            flexDirection: 'column',
            flex: '1 1 auto',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Flex
              sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
                mt: 2,
                mb: 2,
              }}
            >
              <Box
                sx={{
                  fontSize: [3, 3, 3, 4],
                  fontFamily: 'heading',
                  mb: 2,
                  pt: ['2px'],
                  mt: 2,
                }}
              >
                <Box>{title}</Box>
              </Box>
            </Flex>

            <Box sx={{ mb: 2 }}>
              <Text
                sx={{
                  fontSize: [2, 2, 2, 3],
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {truncatedDescription}
              </Text>
            </Box>
          </Box>
          <Box
            sx={{
              fontFamily: 'mono',
              letterSpacing: 'mono',
              fontSize: [0, 0, 0, 1],
              color: 'secondary',
              textTransform: 'uppercase',
              mt: 2,
            }}
          >
            <Box>{formatMeta(feedstock)}</Box>
            {badges.length > 0 && (
              <Box sx={{ mt: 1 }}>{badges.join(' · ')}</Box>
            )}
          </Box>
        </Flex>
      </Box>
    </Link>
  )
}
