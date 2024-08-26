import { FeedstockCard } from '@/components/feedstock-card'
import { SearchBox } from '@/components/search-box'
import { useDefaultCatalogUrl, useFeedstocks } from '@/utils/feedstock'
import { Column, Row } from '@carbonplan/components'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Text } from 'theme-ui'

export const Catalog = ({ initialSelectedId }) => {
  const router = useRouter()
  const catalogRef = useRef(null)

  const catalogUrl = useDefaultCatalogUrl()
  const { feedstocks, error } = useFeedstocks(catalogUrl)
  const [search, setSearch] = useState('')

  const filteredFeedstocks = useMemo(() => {
    if (!feedstocks) {
      return []
    }
    if (!search) {
      return feedstocks
    }
    const re = new RegExp(search, 'i')
    return feedstocks.filter(
      (d) => d.title.match(re) || d.tags?.some((tag) => tag.match(re)),
    )
  }, [feedstocks, search])

  useEffect(() => {
    if (feedstocks && (initialSelectedId || router.query.id)) {
      const feedstockId = initialSelectedId || router.query.id
      const feedstockElement = document.getElementById(feedstockId)
      if (feedstockElement) {
        feedstockElement.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [feedstocks, initialSelectedId, router.query.id])

  if (error) {
    return (
      <div style={{ color: 'red', fontWeight: 'bold' }}>
        🚨 Error loading feedstocks from catalog: {catalogUrl} - {error.message}
      </div>
    )
  }

  if (!feedstocks) {
    return <div>Loading feedstocks from catalog</div>
  }

  return (
    <Box as='section' py={2} ref={catalogRef}>
      <Row columns={[6, 8, 12, 12]} sx={{ mb: 6 }}>
        <Column start={1} width={[6, 4, 4, 4]}>
          <Text
            sx={{
              color: 'primary',
              fontSize: [4, 4, 4, 6],
              fontFamily: 'heading',
              width: '100%',
            }}
          >
            Data Catalog
          </Text>
        </Column>
        <Column start={[1, 5, 5, 5]} width={[6, 4, 6, 6]} sx={{ mt: 4 }}>
          <SearchBox search={search} setSearch={setSearch} />
        </Column>
      </Row>

      <Box mt={3}>
        <Row>
          {filteredFeedstocks.map((feedstock, index) => (
            <Column
              key={feedstock.title}
              start={[
                1,
                (index % 2) * 4 + 1,
                (index % 3) * 4 + 1,
                (index % 3) * 4 + 1,
              ]}
              width={[6, 4, 4, 4]}
            >
              <FeedstockCard
                feedstock={feedstock}
                onNavigate={(id) =>
                  router.push(`/${id}`, undefined, { shallow: true })
                }
              />
            </Column>
          ))}
        </Row>
      </Box>
    </Box>
  )
}
