import { Badge } from '@carbonplan/components'
import { alpha } from '@theme-ui/color'
import React from 'react'
import { Box, Flex } from 'theme-ui'
import { Tags } from '@/components/feedstock/tags'

interface ThumbnailProps {
  url: string
  color: string
  tags?: string[]
}

export const Thumbnail: React.FC<ThumbnailProps> = ({ url, color, tags }) => {
  return (
    <Box
      sx={{
        height: ['200px', '200px', '200px', '300px'],
        position: 'relative',
      }}
    >
      <Box
        as='img'
        // @ts-ignore
        src={url}
        sx={{
          position: 'absolute',
          height: '100%',
          width: '100%',
          filter: 'grayscale(100%)',
          objectFit: 'cover',
        }}
      />
      <Box
        sx={{
          backgroundColor: alpha(color, 0.4),
          position: 'absolute',
          height: '100%',
          width: '100%',
          opacity: 0.7,
        }}
      />

      {tags && tags.length > 0 && (
        <Tags
          tags={tags}
          sx={{
            position: 'absolute',
            maxWidth: '65%',
            right: 2,
            bottom: 2,
            justifyContent: 'flex-end',
          }}
        />
      )}
    </Box>
  )
}
