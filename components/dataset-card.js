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
    doiCitation,
    expectedUpdateFrequency,
    demo,
  } = dataset

  const fallbackThumbnail = 'https://via.placeholder.com/300x200'

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
            <Box
              key={tag}
              sx={{
                borderRadius: 9999,
                backgroundColor: 'primary',
                color: 'background',
                px: 2,
                py: 1,
                mr: 2,
                mb: 2,
                fontSize: 0,
              }}
            >
              {tag}
            </Box>
          ))}
        </Flex>

        <Box mb={2}>
          <Image
            src={thumbnail ?? fallbackThumbnail}
            alt={`Thumbnail for ${name}`}
          />
        </Box>

        <Text sx={{ fontSize: 3, fontWeight: 400, mb: 2 }}>{name}</Text>
      </Box>
    </>
  )
}
