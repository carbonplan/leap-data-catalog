import { Box, Text, Flex } from 'theme-ui'
import {
  getUniqueHashFromString,
  getRandomIndexFromHash,
} from '@/utils/string-hash'

import {
  License,
  Links,
  Maintainers,
  Stores,
  Tags,
  Thumbnail,
} from '@/components/dataset'

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
    stores,
    demo,
  } = dataset

  const fallbackThumbnails = [
    'https://images.unsplash.com/photo-1583325958573-3c89e40551ad?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580193813605-a5c78b4ee01a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584267385494-9fdd9a71ad75?q=80&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1518627675569-e9d4fb90cdb5?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1563974318767-a4de855d7b43?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1454789476662-53eb23ba5907?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584267759777-8a74a4f72a91?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mjh8fG1ldGVvcm9sb2d5fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1513553404607-988bf2703777?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&q=80',
  ]

  const colors = [
    'midnightBlue',
    'navy',
    'forestGreen',
    'skyBlue',
    'aqua',
    'coral',
    'gold',
    'lavender',
    'orange',
    'yellow',
    'green',
    'teal',
    'blue',
    'cyan',
  ]

  const hash = getUniqueHashFromString(name)

  const thumbnailIndex = getRandomIndexFromHash(hash, fallbackThumbnails.length)
  const colorIndex = getRandomIndexFromHash(hash, colors.length)

  const fallbackThumbnail = fallbackThumbnails[thumbnailIndex]

  const color = colors[colorIndex]

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
          {tags?.length > 0 && <Tags tags={tags} demo={demo} />}
        </Box>
        <Box sx={{ flex: 1, position: 'relative' }}>
          <Thumbnail
            url={thumbnail ?? fallbackThumbnail}
            demo={demo}
            color={color}
          />
        </Box>

        <Box>
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
          <Flex sx={{ flexDirection: 'column', gap: 4, mt: 3 }}>
            {stores.length > 0 && <Stores stores={stores} />}
            <License license={license} />
            {!demo && <Maintainers maintainers={maintainers} />}
            {links && <Links links={links} doi_citation={doi_citation} />}
          </Flex>
        </Box>
      </Box>
    </>
  )
}
