'use client'

import { SectionDivider } from '@/components/divider'
import React from 'react'
import { Box, Container } from 'theme-ui'

import { Feedstock } from '@/types/types'
import { FeedstockDescription } from './description'
import { FeedstockDetails } from './details'
import { FeedstockHeader } from './header'
import { FeedstockStore } from './store'

interface ClientFeedstockPageProps {
  feedstock: Feedstock
}

const ClientFeedstockPage: React.FC<ClientFeedstockPageProps> = ({
  feedstock,
}) => {
  return (
    <>
      <FeedstockHeader feedstock={feedstock} />
      <Container>
        <FeedstockDescription feedstock={feedstock} />
        <SectionDivider sx={{ mb: 4 }} color={feedstock.color} />

        {feedstock.stores &&
          feedstock.stores.map((store, index) => (
            <Box key={store.id}>
              <FeedstockStore store={store} color={feedstock.color} />
              <SectionDivider sx={{ mb: 4 }} color={feedstock.color} />
            </Box>
          ))}

        <FeedstockDetails feedstock={feedstock} />
        <SectionDivider color={feedstock.color} />
      </Container>
    </>
  )
}

export default ClientFeedstockPage
