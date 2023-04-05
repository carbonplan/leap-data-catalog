import { Box, Text } from 'theme-ui'

import { Links, Tags, Thumbnail } from '@/components/dataset'

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

  return (
    <>
      <Box
        sx={{
          borderWidth: 1,
          borderColor: 'muted',
        }}
      >
        <Tags tags={tags} />
        <Thumbnail thumbnail={thumbnail} name={name} />
        <Text sx={{ pt: 3, fontSize: 3, fontWeight: 400, mb: 2 }}>{name}</Text>

        <Box pt={3}>
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
        {links && <Links links={links} doi_citation={doi_citation} />}
      </Box>
    </>
  )
}
