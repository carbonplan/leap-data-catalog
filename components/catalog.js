import { SearchBox } from '@/components/search-box'
import { SampleDatasets } from '@/data/sample-datasets'
import { Box, Flex, Grid, Text } from 'theme-ui'
import { DatasetCard } from './dataset-card'

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
            fontSize: [6, 4],
            fontFamily: 'heading',
          }}
        >
          Data Catalog
        </Text>
        <SearchBox />
      </Flex>

      <Box pt={3}>
        <Grid gap={3} columns={[1, 2, 3, 3]}>
          {datasets.map((dataset) => (
            <DatasetCard key={dataset.name} dataset={dataset} />
          ))}
        </Grid>
      </Box>
    </Box>
  )
}
