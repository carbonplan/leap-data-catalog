'use client'

import { Thumbnail } from '@/components/feedstock'
import { Feedstock } from '@/types/types'
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
  const { slug, description, provenance, tags, thumbnail, color, title } =
    feedstock

  const truncateDescription = (text: string, maxLength: number) => {
    if (text.length <= maxLength) {
      return text
    }
    return text.slice(0, maxLength).trim() + '...'
  }

  const truncatedDescription = truncateDescription(description, 200)

  return (
    <Link
      href={
        catalog ? `/feedstock/${slug}?catalog=${catalog}` : `/feedstock/${slug}`
      }
      passHref
      legacyBehavior
    >
      <Box
        as='a'
        sx={{
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
            <Thumbnail url={thumbnail} color={color} tags={tags} />
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
                <Text sx={{ fontSize: [2, 2, 2, 3] }}>
                  {truncatedDescription}
                </Text>
              </Box>
            </Box>
          </Flex>
        </Box>
      </Box>
    </Link>
  )
}
