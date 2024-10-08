'use client'

import { SectionDivider } from '@/components/divider'
import { useFeedstocks } from '@/hooks/useFeedstocks'
import { useParams } from 'next/navigation'
import React from 'react'
import { Box, Flex, Spinner } from 'theme-ui'

import { FeedstockDescription } from './description'
import { FeedstockDetails } from './details'
import { FeedstockHeader } from './header'
import { FeedstockStore } from './store'

const FeedstockPage: React.FC = () => {
  const { slug } = useParams() as { slug: string }
  const { feedstocks, error } = useFeedstocks()

  if (error) {
    return <Box>Error loading feedstock: {error.message}</Box>
  }

  if (!feedstocks) {
    return (
      <Box>
        <Spinner />
      </Box>
    )
  }

  const feedstock = feedstocks.find((f) => f.slug === slug)

  if (!feedstock) {
    return <Box>Feedstock not found</Box>
  }

  return (
    <Flex sx={{ flexDirection: 'column', gap: [4] }}>
      <FeedstockHeader feedstock={feedstock} />
      <FeedstockDescription feedstock={feedstock} />
      <SectionDivider color={feedstock.color} />
      <FeedstockDetails feedstock={feedstock} />
      <SectionDivider color={feedstock.color} />

      {feedstock.stores &&
        feedstock.stores.map((store, index) => (
          <div key={index}>
            <FeedstockStore store={store} color={feedstock.color} />{' '}
            <SectionDivider key={index} color={feedstock.color} />
          </div>
        ))}
    </Flex>
  )
}

export default FeedstockPage
