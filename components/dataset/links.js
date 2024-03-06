import { LinkGroup } from '@carbonplan/components'
import { Box, Text } from 'theme-ui'

export const Links = ({ links, doi_citation }) => {
  const doiRegex = /^https?:\/\/doi\.org\/(.*)$/
  const doiMatch = doi_citation?.match(doiRegex)
  const doi = doiMatch ? doiMatch[1] : doi_citation
  let allLinks = [...links]
  doi ? allLinks.push({ label: `doi:${doi}`, href: doi_citation }) : null

  return (
    <Box>
      <Text sx={{ fontSize: 1, fontWeight: 'bold', color: 'muted' }}>
        Links:
      </Text>
      <Box sx={{ ml: 4 }}>
        <LinkGroup members={allLinks} />
      </Box>
    </Box>
  )
}
