'use client'

import { License, Thumbnail } from '@/components/feedstock'
import { Feedstock } from '@/types/types'
import { Button } from '@carbonplan/components'
import { alpha } from '@theme-ui/color'
import { useRef, useState } from 'react'
import { FaShare } from 'react-icons/fa'
import { Box, Flex, Text } from 'theme-ui'
import Link from 'next/link'

interface FeedstockCardProps {
  feedstock: Feedstock
}

export const FeedstockCard: React.FC<FeedstockCardProps> = ({ feedstock }) => {
  const {
    slug,
    description,
    links,
    maintainers,
    provenance,
    stores,
    tags,
    thumbnail,
    color,
    title,
    'ncviewjs:meta_yaml_url': meta_yaml_url,
  } = feedstock

  const { license, license_link } = provenance

  const [isCopied, setIsCopied] = useState(false)
  const [isSelected, setIsSelected] = useState(false)

  const truncateDescription = (text: string, maxLength: number) => {
    if (text.length <= maxLength) {
      return text
    }
    return text.slice(0, maxLength).trim() + '...'
  }

  // Truncate the description to fit within 3 lines (approximately 180 characters)
  const truncatedDescription = truncateDescription(description, 180)

  return (
    <Link href={`/feedstock/${slug}`} passHref legacyBehavior>
      <a
        style={{
          textDecoration: 'none',
          color: 'inherit',
          display: 'block',
        }}
      >
        {' '}
        <Box
          id={slug}
          sx={{
            mb: [7, 7, 7, 8],
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            transition: 'background-color 0.3s ease',
            backgroundColor: isSelected ? alpha(color, 0.05) : 'transparent',
            padding: 3,
            borderRadius: 'default',
          }}
        >
          <Box sx={{ flex: 1, position: 'relative' }}>
            <Thumbnail url={thumbnail} color={color} tags={tags} />
          </Box>

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
                {' '}
                <Box>{title}</Box>
              </Box>
            </Flex>

            <Box
              sx={{
                position: 'relative',
                mb: 2,
              }}
            >
              <Text
                sx={{
                  fontSize: [2, 2, 2, 3],
                }}
              >
                {truncatedDescription}
              </Text>
            </Box>

            <Flex
              sx={{
                flexDirection: 'column',
                gap: 2,
                mt: 4,
                justifyContent: 'space-between',
              }}
            >
              <License license={license} license_link={license_link} />
            </Flex>
          </Box>
        </Box>
      </a>
    </Link>
  )
}
