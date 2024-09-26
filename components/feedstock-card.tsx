'use client'

import {
  getRandomIndexFromHash,
  getUniqueHashFromString,
} from '@/utils/string-hash'
import { Button, Link } from '@carbonplan/components'
import { useEffect, useRef, useState } from 'react'
import { FaShare } from 'react-icons/fa'
import { Box, Flex } from 'theme-ui'
import { alpha } from '@theme-ui/color'
import {
  License,
  Links,
  Maintainers,
  Repository,
  Stores,
  Thumbnail,
} from '@/components/feedstock'
import { Feedstock } from '@/types/types'

interface FeedstockCardProps {
  feedstock: Feedstock
}

export const FeedstockCard: React.FC<FeedstockCardProps> = ({ feedstock }) => {
  const {
    title,
    description,
    thumbnail,
    tags,
    maintainers,
    provenance,
    links,
    stores,
  } = feedstock

  const { license, license_link } = provenance
  const meta_yaml_url = feedstock['ncviewjs:meta_yaml_url']

  const [isCopied, setIsCopied] = useState(false)
  const [isSelected, setIsSelected] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const fallbackThumbnails = [
    'https://images.unsplash.com/photo-1583325958573-3c89e40551ad?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580193813605-a5c78b4ee01a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584267385494-9fdd9a71ad75?q=80&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1518627675569-e9d4fb90cdb5?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1563974318767-a4de855d7b43?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1454789476662-53eb23ba5907?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584267759777-8a74a4f72a91?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mjh8fG1ldGVvcm9sb2d5fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1513553404607-988bf2703777?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&q=80',
  ]

  const colors = [
    'DarkViolet',
    'cadetBlue',
    'yellow',
    'forestGreen',
    'SeaGreen',
    'Teal',
    'Darkorange',
    'DeepSkyBlue',
    'DarkCyan',
    'Tomato',
    'DarkGreen',
    'SteelBlue',
    'Sienna',
  ]

  const hash = getUniqueHashFromString(title)

  const thumbnailIndex = getRandomIndexFromHash(hash, fallbackThumbnails.length)
  const colorIndex = getRandomIndexFromHash(hash, colors.length)

  const fallbackThumbnail = fallbackThumbnails[thumbnailIndex]

  const color = colors[colorIndex]
  const id = title.toLowerCase().replace(/\s+/g, '-') // Convert title to id

  useEffect(() => {
    // handle initial load
    const handleInitialLoad = () => {
      if (window.location.hash === `#${id}`) {
        setIsSelected(true)
        cardRef.current?.scrollIntoView({ behavior: 'smooth' })
        setTimeout(() => setIsSelected(false), 3000)
      }
    }

    // handle subsequent hash changes
    const handleHashChange = () => {
      if (window.location.hash === `#${id}`) {
        setIsSelected(true)
        setTimeout(() => setIsSelected(false), 3000)
      }
    }

    handleInitialLoad()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [id])

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`
    navigator.clipboard.writeText(url).then(() => {
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    })
  }

  return (
    <Box
      ref={cardRef}
      id={id}
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
        <Thumbnail
          url={thumbnail ?? fallbackThumbnail}
          color={color}
          tags={tags}
        />
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
            <Box
              as={Link}
              href={`#${id}`}
              sx={{
                textDecoration: 'none',
              }}
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
        {links && <Links links={links} doi_citation={feedstock.doi_citation} />}
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
