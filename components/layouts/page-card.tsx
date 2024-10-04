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
        justifyContent: 'space-between',
        gap: 0,
      }}
    >
      <Guide />
      <Box>
        {/* <Header /> */}
        {children}
      </Box>
      <Footer />
    </Flex>
  )
}

export default PageCard
