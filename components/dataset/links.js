import { Button, Link } from '@carbonplan/components'
import { RotatingArrow } from '@carbonplan/icons'
import { Box, Grid, Text } from 'theme-ui'

export const Links = ({ links, doi_citation }) => {
  const doiRegex = /^https?:\/\/doi\.org\/(.*)$/
  return (
    <Box pt={3}>
      <Text sx={{ fontSize: 1, fontWeight: 'bold' }}>Links:</Text>
      <Grid gap={3} columns={[1, 2]} sx={{ mt: 1 }}>
        {links.map((link) => (
          <Button key={link.url} suffix={<RotatingArrow />} size='xs'>
            <Box
              as={Link}
              href={link.url}
              target='_blank'
              rel='noopener noreferrer'
            >
              {link.title}
            </Box>
          </Button>
        ))}
        {doi_citation && (
          <Button suffix={<RotatingArrow />} size='xs'>
            <Box
              as={Link}
              href={doi_citation}
              target='_blank'
              rel='noopener noreferrer'
            >
              doi:
              {doi_citation.match(doiRegex)
                ? doi_citation.match(doiRegex)[1]
                : doi_citation}
            </Box>
          </Button>
        )}
      </Grid>
    </Box>
  )
}
