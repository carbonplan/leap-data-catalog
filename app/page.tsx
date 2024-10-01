'use client'

import { Catalog } from '@/components/catalog'
import { Suspense } from 'react'
import { Box, Container } from 'theme-ui'

export default function Home() {
  return (
    <Box>
      <Container>
        <Suspense fallback={<Box></Box>}>
          <Catalog />
        </Suspense>
      </Container>
    </Box>
  )
}
