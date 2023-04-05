import { Tag } from '@carbonplan/components'
import { Flex } from 'theme-ui'

export const Tags = ({ tags }) => {
  return (
    <Flex sx={{ flexWrap: 'wrap', mb: 2 }}>
      {tags.map((tag) => (
        <Tag key={tag} value={true} sx={{ mr: [2] }}>
          {tag}
        </Tag>
      ))}
    </Flex>
  )
}
