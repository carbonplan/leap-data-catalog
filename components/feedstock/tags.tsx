import { Badge } from '@carbonplan/components'
import Link from 'next/link'
import React from 'react'
import { Box, Flex } from 'theme-ui'

interface TagsProps {
  tags: string[]
  sx?: object
  // When set, each tag links to this URL (e.g. a filtered catalog view).
  href?: (tag: string) => string
}

export const Tags: React.FC<TagsProps> = ({ tags, sx, href }) => {
  const sortedTags = [...tags].sort((a, b) => a.localeCompare(b))
  return (
    <Flex
      sx={{
        columnGap: 2,
        rowGap: 1,
        flexWrap: 'wrap',
        ...sx,
      }}
    >
      {sortedTags.map((tag) => {
        const badge = (
          <Badge
            key={tag}
            sx={{
              fontSize: [0, 0, 0, 1],
              height: ['22px', '22px', '22px', '24px'],
              lineHeight: ['22px', '22px', '22px', '24px'],
              opacity: 0.7,
            }}
          >
            <Box
              as='span'
              sx={{
                textTransform: 'uppercase',
                fontFamily: 'mono',
                letterSpacing: 'mono',
              }}
            >
              {tag}
            </Box>
          </Badge>
        )
        return href ? (
          <Link key={tag} href={href(tag)} style={{ textDecoration: 'none' }}>
            {badge}
          </Link>
        ) : (
          badge
        )
      })}
    </Flex>
  )
}
