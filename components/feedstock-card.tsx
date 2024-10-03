'use client'

import {
  License,
  Links,
  Maintainers,
  Repository,
  Stores,
  Thumbnail,
} from '@/components/feedstock'
import { Feedstock } from '@/types/types'
import { Button, Link } from '@carbonplan/components'
import { alpha } from '@theme-ui/color'
import { useEffect, useRef, useState } from 'react'
import { FaShare } from 'react-icons/fa'
import { Box, Flex } from 'theme-ui'

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
  const cardRef = useRef<HTMLDivElement>(null)

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}feedstock/${slug}`
    navigator.clipboard.writeText(url).then(() => {
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    })
  }

  return (
    <Box
      ref={cardRef}
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
            <Box
              as={Link}
              /* @ts-ignore */
              href={`/feedstock/${slug}`}
              sx={{ textDecoration: 'none' }}
            >
              {title}
            </Box>
          </Box>

          <Button
            onClick={handleShare}
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: color,
              px: 2,
              py: 1,
              fontSize: [2, 2, 2, 3],
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              minWidth: 'auto',
              flexShrink: 0,
            }}
          >
            <FaShare style={{ marginRight: '4px', flexShrink: 0 }} />
            {isCopied ? 'Copied!' : 'Share'}
          </Button>
        </Flex>

        <Box sx={{ fontSize: [2, 2, 2, 3], mb: 2, py: [1] }}>{description}</Box>
        {links && <Links links={links} />}
        {stores && stores.length > 0 && (
          <Stores stores={stores} color={color} />
        )}
        <Flex
          sx={{
            flexDirection: 'column',
            gap: 2,
            mt: 4,
            justifyContent: 'space-between',
          }}
        >
          <License license={license} license_link={license_link} />
          <Maintainers maintainers={maintainers} />
          <Repository metaURL={meta_yaml_url} />
        </Flex>
      </Box>
    </Box>
  )
}
