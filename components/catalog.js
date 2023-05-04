import { DatasetCard } from '@/components/dataset-card'
import { SearchBox } from '@/components/search-box'
import { fetcher } from '@/utils/fetcher'
import { Column, Row } from '@carbonplan/components'
import useSWR from 'swr'
import { Box, Text } from 'theme-ui'

export const Catalog = ({}) => {
  const { data: datasets, error } = useSWR(
    'https://raw.githubusercontent.com/leap-stc/data-management/main/catalog/datasets/consolidated-web-catalog.json',
    fetcher,
    { dedupingInterval: 60 * 60 * 1000 }, // 1 hour in milliseconds
  )
  if (error) {
    return <div>Error loading datasets from catalog</div>
  }

  if (!datasets) {
    return <div>Loading datasets from catalog</div>
  }

  return (
    <Box as='section' py={2}>
      <Row columns={[6, 8, 12, 12]} sx={{ mb: 6 }}>
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
        <Column start={[1, 5, 5, 5]} width={[6, 4, 6, 6]} sx={{ mt: 4 }}>
          <SearchBox />
        </Column>
      </Row>

      <Box mt={3}>
        <Row>
          {datasets?.map(function (dataset, index) {
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
