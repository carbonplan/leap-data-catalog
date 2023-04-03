import { Link, Tag } from '@carbonplan/components'
import { Box, Flex, Image, Text } from 'theme-ui'
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
          p: 3,
        }}
      >
        <Flex sx={{ flexWrap: 'wrap', mb: 2 }}>
          {tags.map((tag) => (
            <Tag key={tag} value={true} sx={{ mr: [2] }}>
              {tag}
            </Tag>
          ))}
        </Flex>

        <Box mb={2}>
          <Image
            src={thumbnail ?? fallbackThumbnail}
            alt={`Thumbnail for ${name}`}
          />
        </Box>

        <Text sx={{ fontSize: 3, fontWeight: 400, mb: 2 }}>{name}</Text>

        <Box mb={2}>
          <Text
            sx={{
              fontSize: 1,
              fontWeight: 400,
            }}
          >
            Providers:
          </Text>
          {providers.map((provider) => (
            <Flex
              key={provider.name}
              sx={{
                alignItems: 'baseline',
                fontSize: 1,
              }}
            >
              <Box
                as={Link}
                href={provider.url}
                target='_blank'
                rel='noopener noreferrer'
                sx={{ ml: 1 }}
              >
                {provider.name}
              </Box>
            </Flex>
          ))}
        </Box>

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

        {links && (
          <Box mt={2}>
            <Text sx={{ fontSize: 1, fontWeight: 'bold' }}>Links:</Text>
            <Box as='ul' sx={{ ml: 3, mt: 1 }}>
              {links.map((link) => (
                <Text as='li' key={link.url}>
                  <Box
                    as={Link}
                    href={link.url}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {link.title}
                  </Box>
                </Text>
              ))}

              {doi_citation && (
                <Text as='li'>
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
                </Text>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </>
  )
}
