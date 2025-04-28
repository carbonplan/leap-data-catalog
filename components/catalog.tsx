'use client'

import { FeedstockCard } from '@/components/feedstock-card'
import { SearchBox } from '@/components/search-box'
import { TagFilter } from '@/components/tag-filter'
import { Feedstock } from '@/types/types'
import { Column, Row } from '@carbonplan/components'
import { Suspense, useMemo, useState } from 'react'
import { Box, Text, Container } from 'theme-ui'

const FeedstockList = ({
  feedstocks,
  search,
  tags,
  catalog,
}: {
  feedstocks: Feedstock[]
  search: string
  tags: string[]
  catalog?: string
}) => {
  const filteredFeedstocks = useMemo(() => {
    if (!feedstocks || feedstocks.length === 0) {
      return []
    }

    let result = feedstocks

    if (search) {
      const re = new RegExp(search, 'i')

      result = result.filter(
        (d: Feedstock) =>
          d.title.match(re) ||
          d.tags?.some((tag) => tag.match(re)) ||
          d.description.match(re),
      )
    }

    if (tags.length > 0) {
      result = result.filter((d: Feedstock) =>
        tags.find((tag) => d.tags?.includes(tag)),
      )
    }

    return result
  }, [feedstocks, search, tags])

  if (!feedstocks || feedstocks.length === 0) {
    return <Box />
  }

  if (filteredFeedstocks.length === 0) {
    return <Box>No feedstocks found matching your search criteria.</Box>
  }

  return (
    <Row columns={[1, 2, 3, 3]} gap={[4, 5, 5, 6]} sx={{ gridAutoRows: '1fr' }}>
      {filteredFeedstocks.map((feedstock, index) => (
        <FeedstockCard
          key={feedstock.title}
          feedstock={feedstock}
          catalog={catalog}
        />
      ))}
    </Row>
  )
}

type CatalogProps = {
  feedstocks: Feedstock[]
  error?: Error
  catalog?: string
}

export const Catalog = ({ feedstocks, error, catalog }: CatalogProps) => {
  const [search, setSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const tags = useMemo(() => {
    const allTags = feedstocks.reduce((accum, f) => {
      f.tags?.forEach((tag) => accum.add(tag))
      return accum
    }, new Set<string>())

    return Array.from(allTags)
  }, [feedstocks])

  if (error) {
    return (
      <div style={{ color: 'red', fontWeight: 'bold' }}>
        🚨 Error loading feedstocks from catalog - {error.message}
      </div>
    )
  }
  return (
    <Box>
      <Container>
        <Box as='section' sx={{ pt: 8, pb: 10 }}>
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
            <Column start={[1, 5, 5, 5]} width={[6, 4, 6, 6]}>
              <SearchBox search={search} setSearch={setSearch} />
              <TagFilter
                tags={tags}
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
              />
            </Column>
          </Row>

          <Box mt={3}>
            <Suspense fallback={<Box />}>
              <FeedstockList
                tags={selectedTags}
                feedstocks={feedstocks}
                search={search}
                catalog={catalog}
              />
            </Suspense>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
