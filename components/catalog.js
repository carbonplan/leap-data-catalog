import { DatasetCard } from '@/components/dataset-card'
import { SearchBox } from '@/components/search-box'
import { SampleDatasets } from '@/data/sample-datasets'
import { Column, Row } from '@carbonplan/components'
import { useEffect, useState } from 'react'
import { Box, Flex, Text } from 'theme-ui'

// Custom hook to get the current window width
function useWindowWidth() {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024, // Default to desktop width if window is not available
  )

  useEffect(() => {
    if (typeof window === 'undefined') return // Skip if window is not available

    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowWidth
}

export const Catalog = ({}) => {
  const datasets = SampleDatasets
  const windowWidth = useWindowWidth()

  // Helper function to calculate the start and width based on the screen size
  const getStartAndWidth = (index) => {
    if (windowWidth >= 1024) {
      // Desktop
      return { start: (index % 3) * 4 + 1, width: 4 }
    } else if (windowWidth >= 768) {
      // Tablet
      return { start: (index % 2) * 4 + 1, width: 3 }
    } else {
      // Mobile
      return { start: 1, width: 6 }
    }
  }

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

      <Box mt={8}>
        <Row>
          {datasets.map(function (dataset, index) {
            // compute modulo of index
            const { start, width } = getStartAndWidth(index)
            return (
              <Column key={dataset.name} start={[start]} width={[width]}>
                <DatasetCard dataset={dataset} />
              </Column>
            )
          })}
        </Row>
      </Box>
    </Box>
  )
}
