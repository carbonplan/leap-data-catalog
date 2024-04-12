import { FeedstockCard } from '@/components/feedstock-card'
import { SearchBox } from '@/components/search-box'
import { fetcher } from '@/utils/fetcher'
import { Column, Row } from '@carbonplan/components'
import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { Box, Text } from 'theme-ui'
import { useRouter } from 'next/router'

export const Catalog = ({}) => {
  const router = useRouter()

  const isClient = typeof window !== 'undefined'
  const hostname = isClient ? window.location.hostname : 'localhost'
  const isProduction = hostname === 'leap-data-catalog.vercel.app'
  //TODO: temporary hard code the default catalog URL
  const defaultCatalogUrl =
    'https://gist.githubusercontent.com/andersy005/66e244c38f97b60d1628efd5203b4bd6/raw/37c16dbfefd4659ef00254a0e5a6f6d637655045/virtual-zarr-consolidated-catalog.json'

  const getCatalogUrl = () => {
    const { catalog } = router.query

    if (!isProduction && catalog) {
      return catalog
    }

    return defaultCatalogUrl
  }

  const catalogUrl = getCatalogUrl()

  const { data: feedstocks, error } = useSWR(
    catalogUrl,
    fetcher,
    { dedupingInterval: 60 * 60 * 1000 }, // 1 hour in milliseconds
  )
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
          <SearchBox search={search} setSearch={setSearch} />
        </Column>
      </Row>

      <Box mt={3}>
        <Row>
          {filteredFeedstocks.map(function (feedstock, index) {
            return (
              <Column
                key={feedstock.title}
                start={[
                  1,
                  (index % 2) * 4 + 1,
                  (index % 3) * 4 + 1,
                  (index % 3) * 4 + 1,
                ]}
                width={[6, 3, 4, 4]}
              >
                <FeedstockCard feedstock={feedstock} />
              </Column>
            )
          })}
        </Row>
      </Box>
    </Box>
  )
}
