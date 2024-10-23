import { Link } from '@/types/types'
import { LinkGroup } from '@carbonplan/components'
import { Box } from 'theme-ui'

interface LinksProps {
  links: Link[]
}

export const Links: React.FC<LinksProps> = ({ links }) => {
  // rename the url key to href
  let allLinks = links.map((link) => {
    const { url, ...otherProps } = link
    return { href: url, ...otherProps }
  })

  return (
    <Box>
      <LinkGroup
        members={allLinks}
        sx={{ '& a': { fontSize: [2, 2, 2, 3] } }}
        inverted
      />
    </Box>
  )
}
