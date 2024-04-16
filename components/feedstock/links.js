import { LinkGroup } from '@carbonplan/components'
import { Flex, Text } from 'theme-ui'

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
    <Flex sx={{ flexDirection: 'column', gap: 3 }}>
      <Text sx={{ fontSize: 1, fontWeight: 'bold', color: 'muted' }}>
        Links:
      </Text>

      <LinkGroup members={allLinks} sx={{ ml: 4 }} />
    </Flex>
  )
}
