'use client'

import { FeedstockCard } from '@/components/feedstock-card'
import { SearchBox } from '@/components/search-box'
import { useFeedstocks } from '@/hooks/useFeedstocks'
import { Feedstock } from '@/types/types'
import { Column, Row } from '@carbonplan/components'
import { useSearchParams } from 'next/navigation'
import { useMemo, useState, Suspense } from 'react'
import { Box, Text } from 'theme-ui'

const FeedstockList = ({
  catalogUrl,
  search,
}: {
  catalogUrl?: string
  search: string
}) => {
  const { feedstocks, error } = useFeedstocks(catalogUrl)

  const filteredFeedstocks = useMemo(() => {
    if (!feedstocks || feedstocks.length === 0) {
      return []
    }

    if (!search) {
      return feedstocks
    }

    const re = new RegExp(search, 'i')

    return feedstocks.filter(
      (d: Feedstock) =>
        d.title.match(re) ||
        d.tags?.some((tag) => tag.match(re)) ||
        d.description.match(re),
    )
  }, [feedstocks, search])

  if (error) {
    return (
      <div style={{ color: 'red', fontWeight: 'bold' }}>
        🚨 Error loading feedstocks from catalog - {error.message}
      </div>
    )
  }

  if (!feedstocks || feedstocks.length === 0) {
    return <Box />
  }

  if (filteredFeedstocks.length === 0) {
    return <Box>No feedstocks found matching your search criteria.</Box>
  }

  return (
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
          <FeedstockCard feedstock={feedstock} />
        </Column>
      ))}
    </Row>
  )
}

export const Catalog = () => {
  const searchParams = useSearchParams()
  const [search, setSearch] = useState('')

  const isProduction = process.env.NODE_ENV === 'production'

  const catalogUrl = !isProduction
    ? (searchParams.get('catalog') ?? undefined)
    : undefined

  return (
    <Box as='section' py={2}>
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
        <Suspense fallback={<Box />}>
          <FeedstockList catalogUrl={catalogUrl} search={search} />
        </Suspense>
      </Box>
    </Box>
  )
}
