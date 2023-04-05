import { DatasetCard } from '@/components/dataset-card'
import { SearchBox } from '@/components/search-box'
import { SampleDatasets } from '@/data/sample-datasets'
import { Column, Row } from '@carbonplan/components'
import { Box, Flex, Text } from 'theme-ui'

export const Catalog = ({}) => {
  const datasets = SampleDatasets

  return (
    <Box as='section' py={2}>
      <Flex
        sx={{
          flexDirection: ['column', 'row'],
          alignItems: ['flex-start', 'center'],
          //justifyContent: 'space-between',
          gap: [3, 8],
          mb: 6,
        }}
      >
        <Text
          sx={{
            color: 'primary',
            fontSize: [4, 8],
            fontFamily: 'heading',
          }}
        >
          Data Catalog
        </Text>
        <SearchBox />
      </Flex>

      <Box mt={3}>
        <Row gap={[8, 5, 5, 6]}>
          {datasets.map(function (dataset, index) {
            return (
              <Column
                key={dataset.name}
                start={[1, (index + 1) % 3, (index + 1) % 4, (index + 1) % 4]}
                width={[6, 3, 4, 4]}
              >
                <DatasetCard dataset={dataset} />
              </Column>
            )
          })}
        </Row>
      </Box>
    </Box>
  )
}
