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

  const fallbackThumbnails = [
    'https://images.unsplash.com/photo-1563974318767-a4de855d7b43?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2074&q=80',
    'https://images.unsplash.com/photo-1454789476662-53eb23ba5907?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=752&q=80',
    'https://images.unsplash.com/photo-1584267759777-8a74a4f72a91?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mjh8fG1ldGVvcm9sb2d5fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1513553404607-988bf2703777?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=736&q=80',
    'https://images.unsplash.com/photo-1583325958573-3c89e40551ad?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80',
    'https://images.unsplash.com/photo-1580193813605-a5c78b4ee01a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=765&q=80',
  ]

  const fallbackThumbnail =
    fallbackThumbnails[index % fallbackThumbnails.length]

  const colors = [
    'red',
    'orange',
    'yellow',
    'green',
    'teal',
    'blue',
    'cyan',
    'purple',
    'pink',
  ]

  const color = colors[index % colors.length]

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
            url={thumbnail ?? fallbackThumbnail}
            demo={demo}
            color={color}
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
