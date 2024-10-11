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
  datasetReprs: Record<string, { repr: any; error: string | null }>
}

const ClientFeedstockPage: React.FC<ClientFeedstockPageProps> = ({
  feedstock,
  datasetReprs,
}) => {
  return (
    <Flex sx={{ flexDirection: 'column', gap: [4] }}>
      <FeedstockHeader feedstock={feedstock} />
      <FeedstockDescription feedstock={feedstock} />
      <SectionDivider color={feedstock.color} />

      {feedstock.stores &&
        feedstock.stores.map((store, index) => (
          <React.Fragment key={store.id}>
            <FeedstockStore
              store={store}
              color={feedstock.color}
              datasetRepr={datasetReprs[store.id]}
            />
            <SectionDivider color={feedstock.color} />
          </React.Fragment>
        ))}

      <FeedstockDetails feedstock={feedstock} />
      <SectionDivider color={feedstock.color} />
    </Flex>
  )
}

export default ClientFeedstockPage
