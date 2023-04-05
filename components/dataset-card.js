import { Button, Link, Tag } from '@carbonplan/components'
import { RotatingArrow } from '@carbonplan/icons'
import { Box, Flex, Grid, Image, Text } from 'theme-ui'
export const DatasetCard = ({ dataset }) => {
  const {
    name,
    providers,
    description,
    thumbnail,
    tags,
    coverage,
    maintainers,
    license,
    links,
    doi_citation,
    expected_update_frequency,
    demo,
  } = dataset

  const fallbackThumbnail = 'https://via.placeholder.com/300x200'
  const doiRegex = /^https?:\/\/doi\.org\/(.*)$/

  return (
    <>
      <Box
        sx={{
          borderWidth: 1,
          borderColor: 'muted',
        }}
      >
        <Flex sx={{ flexWrap: 'wrap', mb: 2 }}>
          {tags.map((tag) => (
            <Tag key={tag} value={true} sx={{ mr: [2] }}>
              {tag}
            </Tag>
          ))}
        </Flex>

        <Box pt={3}>
          <Image
            src={thumbnail ?? fallbackThumbnail}
            alt={`Thumbnail for ${name}`}
          />
        </Box>

        <Text sx={{ pt: 3, fontSize: 3, fontWeight: 400, mb: 2 }}>{name}</Text>

        <Box pt={3}>
          <Text
            sx={{
              fontSize: 1,
              fontWeight: 400,
            }}
          >
            Providers:
          </Text>
          <Grid gap={3} columns={[1, 2]} sx={{ mt: 1 }}>
            {providers.map((provider) => (
              <Button
                size='xs'
                key={provider.name}
                suffix={<RotatingArrow />}
                as={Link}
                href={provider.url}
                target='_blank'
                rel='noopener noreferrer'
              >
                {provider.name}
              </Button>
            ))}
          </Grid>
        </Box>

        <Box pt={3}>
          {' '}
          <Text
            sx={{
              fontSize: 1,
              maxHeight: 100,
              maxWidth: '100%',
              overflow: 'auto',
            }}
          >
            {description}
          </Text>
        </Box>

        {links && (
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
        )}
      </Box>
    </>
  )
}
