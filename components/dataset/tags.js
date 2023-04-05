import { Tag } from '@carbonplan/components'
import { Flex } from 'theme-ui'

export const Tags = ({ tags, demo }) => {
  // Sort tags alphabetically
  const sortedTags = tags.sort((a, b) => a.localeCompare(b))
  return (
    <Flex sx={{ flexWrap: 'wrap', mb: 2 }}>
      {sortedTags.map((tag) => (
        <Tag key={tag} value={true} sx={{ mr: [2] }}>
          {tag}
        </Tag>
      ))}
      {demo && (
        <Tag key='demo' value={true} sx={{ mr: [2] }}>
          demo
        </Tag>
      )}
    </Flex>
  )
}
