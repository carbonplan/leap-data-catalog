'use client'

import { SectionDivider } from '@/components/divider'
import React from 'react'
import { Flex } from 'theme-ui'

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
    <Flex sx={{ flexDirection: 'column', gap: [4] }}>
      <FeedstockHeader feedstock={feedstock} />
      <FeedstockDescription feedstock={feedstock} />
      <SectionDivider color={feedstock.color} />
      <FeedstockDetails feedstock={feedstock} />
      <SectionDivider color={feedstock.color} />

      {feedstock.stores &&
        feedstock.stores.map((store, index) => (
          <React.Fragment key={index}>
            <FeedstockStore store={store} color={feedstock.color} />
            <SectionDivider color={feedstock.color} />
          </React.Fragment>
        ))}
    </Flex>
  )
}

export default ClientFeedstockPage
