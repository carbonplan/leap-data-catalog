'use client'

import { Suspense } from 'react'

import { Catalog } from '@/components/catalog'
import { Guide } from '@carbonplan/components'
import { Box, Container } from 'theme-ui'

export default function Home() {
  return (
    <Box>
      <Container>
        <Guide />
        <Suspense fallback={<Box>Loading...</Box>}>
          <Catalog />
        </Suspense>
      </Container>
    </Box>
  )
}
