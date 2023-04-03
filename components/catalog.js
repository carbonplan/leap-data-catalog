import { DatasetCard } from '@/components/dataset-card'
import { SearchBox } from '@/components/search-box'
import { SampleDatasets } from '@/data/sample-datasets'
import { Box, Flex, Text } from 'theme-ui'

export const Catalog = ({}) => {
  const datasets = SampleDatasets
  const sample = datasets[0]
  return (
    <Box as='section' py={2}>
      <Flex
        sx={{
          flexDirection: ['column', 'row'],
          alignItems: ['flex-start', 'center'],
          gap: [3, 8],
        }}
      >
        <Text
          sx={{
            color: 'primary',
            fontSize: 6,
            fontFamily: 'heading',
          }}
        >
          Data Catalog
        </Text>
        <SearchBox />
        <DatasetCard dataset={sample} />
      </Flex>
    </Box>
  )
}
