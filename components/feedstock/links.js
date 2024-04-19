import { LinkGroup } from '@carbonplan/components'
import { Box } from 'theme-ui'

export const Links = ({ links, doi_citation }) => {
  const doiRegex = /^https?:\/\/doi\.org\/(.*)$/
  const doiMatch = doi_citation?.match(doiRegex)
  const doi = doiMatch ? doiMatch[1] : doi_citation
  // rename the url key to href
  let allLinks = links.map((link) => {
    const { url, ...otherProps } = link
    return { href: url, ...otherProps }
  })
  doi ? allLinks.push({ label: `doi:${doi}`, href: doi_citation }) : null

  return (
    <Box sx={{ mt: 4 }}>
      <LinkGroup members={allLinks} inverted />
    </Box>
  )
}
