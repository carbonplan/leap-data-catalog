import { Badge } from '@carbonplan/components'
import { alpha } from '@theme-ui/color'
import React from 'react'
import { Box, Flex } from 'theme-ui'

interface TagsProps {
  tags: string[]
  sx?: object
}

export const Tags: React.FC<TagsProps> = ({ tags, sx }) => {
  const sortedTags = tags.sort((a, b) => a.localeCompare(b))
  return (
    <Flex
      sx={{
        columnGap: 2,
        rowGap: 1,
        flexWrap: 'wrap',
        ...sx,
      }}
    >
      {sortedTags.map((tag) => (
        <Badge
          key={tag}
          sx={{
            fontSize: [0, 0, 0, 1],
            height: ['22px', '22px', '22px', '24px'],
            lineHeight: ['22px', '22px', '22px', '24px'],
            textTransform: 'uppercase',
            fontFamily: 'mono',
            letterSpacing: 'mono',
            opacity: 0.7,
          }}
        >
          {tag}
        </Badge>
      ))}
    </Flex>
  )
}
