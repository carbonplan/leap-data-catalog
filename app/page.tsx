'use client'

import { Catalog } from '@/components/catalog'
import { Guide } from '@carbonplan/components'
import { Suspense } from 'react'
import { Box, Container } from 'theme-ui'

export default function Home() {
  return (
    <Box>
      <Container>
        <Guide />

        <Suspense fallback={<Box></Box>}>
          <Catalog />
        </Suspense>
      </Container>
    </Box>
  )
}
