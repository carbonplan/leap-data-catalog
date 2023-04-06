import { DatasetCard } from '@/components/dataset-card'
import { SearchBox } from '@/components/search-box'
import { SampleDatasets } from '@/data/sample-datasets'
import { Column, Row } from '@carbonplan/components'
import { Box, Text } from 'theme-ui'

export const Catalog = ({}) => {
  const datasets = SampleDatasets

  return (
    <Box as='section' py={2}>
      <Row columns={[6, 8, 12, 12]}>
        <Column start={1} width={[6, 4, 4, 4]}>
          <Text
            sx={{
              color: 'primary',
              fontSize: [4, 4, 6, 6], // figure out smaller font-size
              fontFamily: 'heading',
              width: '100%',
            }}
          >
            Data Catalog
          </Text>
        </Column>
        <Column start={[1, 5, 5, 5]} width={[6, 4, 6, 6]}>
          <SearchBox />
        </Column>
      </Row>

      <Box mt={3}>
        <Row>
          {datasets.map(function (dataset, index) {
            return (
              <Column
                key={dataset.name}
                start={[
                  1,
                  (index % 2) * 4 + 1,
                  (index % 3) * 4 + 1,
                  (index % 3) * 4 + 1,
                ]}
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
