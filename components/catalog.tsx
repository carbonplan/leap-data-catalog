'use client'

import { FeedstockCard } from '@/components/feedstock-card'
import { SearchBox } from '@/components/search-box'
import { Feedstock } from '@/types/types'
import { Column, Row } from '@carbonplan/components'
import { Suspense, useMemo, useState } from 'react'
import Select, { MultiValue } from 'react-select'
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

type TagOption = {
  value: string
  label: string
}

export const Catalog = ({ feedstocks, error, catalog }: CatalogProps) => {
  const [search, setSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState<MultiValue<TagOption>>([])

  const tags = useMemo(() => {
    const allTags = feedstocks.reduce((accum, f) => {
      f.tags?.forEach((tag) => accum.add(tag))
      return accum
    }, new Set<string>())

    return Array.from(allTags).map((tag) => ({
      value: tag,
      label: tag.toUpperCase(),
    }))
  }, [feedstocks])

  const selectedTagValues = useMemo(() => {
    return selectedTags.map((d) => d.value)
  }, [selectedTags])

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
              <Select
                value={selectedTags}
                onChange={setSelectedTags}
                options={tags}
                isMulti
              />
            </Column>
          </Row>

          <Box mt={3}>
            <Suspense fallback={<Box />}>
              <FeedstockList
                tags={selectedTagValues}
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
