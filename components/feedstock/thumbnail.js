import { Badge } from '@carbonplan/components'
import { alpha } from '@theme-ui/color'
import { Box, Flex } from 'theme-ui'

const Tags = ({ tags, sx }) => {
  // Sort tags alphabetically
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
            fontSize: [1],
            height: ['21px'],
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
export const Thumbnail = ({ url, color, demo, tags }) => {
  return (
    <Box
      sx={{
        height: ['200px', '200px', '250px', '300px'],
        position: 'relative',
      }}
    >
      <Box
        as='img'
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

      {tags?.length > 0 && (
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
