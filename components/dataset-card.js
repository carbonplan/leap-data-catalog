import { Box, Text } from 'theme-ui'

import {
  License,
  Links,
  Maintainers,
  Stores,
  Tags,
  Thumbnail,
} from '@/components/dataset'

export const DatasetCard = ({ dataset, index }) => {
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
    stores,
    demo,
  } = dataset

  return (
    <>
      <Box
        sx={{
          mb: [5, 7, 7, 8],
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        <Box sx={{ height: '60px', mb: '20px' }}>
          <Tags tags={tags} demo={demo} />
        </Box>
        <Box sx={{ flex: 1, position: 'relative', height: '200px' }}>
          <Thumbnail
            thumbnail={thumbnail}
            demo={demo}
            stores={stores}
            index={index}
          />
        </Box>

        <Box sx={{ marginTop: '220px' }}>
          <Box mt={3}>
            <Text sx={{ fontSize: 3, fontWeight: 400 }}>{name}</Text>
          </Box>

          <Box mt={3}>
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

          <License license={license} />

          {!demo && <Maintainers maintainers={maintainers} />}
          {links && <Links links={links} doi_citation={doi_citation} />}
          {stores.length > 0 && <Stores stores={stores} />}
        </Box>
      </Box>
    </>
  )
}
