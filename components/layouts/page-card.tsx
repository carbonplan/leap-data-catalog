'use client'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { Box, Flex } from 'theme-ui'

import { Guide } from '@carbonplan/components'

function PageCard({ children }: { children: React.ReactNode }) {
  return (
    <Flex
      sx={{
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Guide />
      <Header />

      <Box
        sx={{
          width: '100%',
          flex: '1 1 auto',
        }}
      >
        {children}
      </Box>
      <Footer />
    </Flex>
  )
}

export default PageCard
