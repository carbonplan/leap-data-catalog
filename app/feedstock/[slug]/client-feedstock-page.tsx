'use client'

import { SectionDivider } from '@/components/divider'
import React from 'react'
import { Container } from 'theme-ui'

import { Feedstock } from '@/types/types'
import { FeedstockDescription } from './description'
import { FeedstockDetails } from './details'
import { FeedstockHeader } from './header'
import { FeedstockStores } from './stores'

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
        <SectionDivider sx={{ mb: 4, mt: 5 }} color={feedstock.color} />
        <FeedstockStores stores={feedstock.stores} color={feedstock.color} />
        <SectionDivider sx={{ mb: 4 }} color={feedstock.color} />
        <FeedstockDetails feedstock={feedstock} />
        <SectionDivider sx={{mt: 5}} color={feedstock.color} />
      </Container>
    </>
  )
}

export default ClientFeedstockPage
