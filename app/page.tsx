'use client'

import { Catalog } from '@/components/catalog'
import { Guide } from '@carbonplan/components'
import { Box, Container } from 'theme-ui'

export default function Home() {
  return (
    <Box>
      <Container>
        <Guide />
        <Catalog />
      </Container>
    </Box>
  )
}
