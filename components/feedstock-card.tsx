'use client'

import { License, Thumbnail } from '@/components/feedstock'
import { Feedstock } from '@/types/types'
import { alpha } from '@theme-ui/color'
import { useState } from 'react'
import { Box, Flex, Text } from 'theme-ui'
import Link from 'next/link'

interface FeedstockCardProps {
  feedstock: Feedstock
}

export const FeedstockCard: React.FC<FeedstockCardProps> = ({ feedstock }) => {
  const { slug, description, provenance, tags, thumbnail, color, title } =
    feedstock

  const { license, license_link } = provenance

  const [isHovered, setIsHovered] = useState(false)

  const truncateDescription = (text: string, maxLength: number) => {
    if (text.length <= maxLength) {
      return text
    }
    return text.slice(0, maxLength).trim() + '...'
  }

  const truncatedDescription = truncateDescription(description, 240)

  return (
    <Link href={`/feedstock/${slug}`} passHref legacyBehavior>
      <Box
        as='a'
        sx={{
          textDecoration: 'none',
          color: 'inherit',
          display: 'block',
          height: '100%', // Ensure full height
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Box
          id={slug}
          sx={{
            height: '100%', // Ensure full height
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            transition: 'all 0.3s ease',
            backgroundColor: isHovered ? alpha(color, 0.05) : 'transparent',
            padding: 3,
            borderRadius: 'default',
            boxShadow: isHovered ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none',
            transform: isHovered ? 'translateY(-4px)' : 'none',
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
