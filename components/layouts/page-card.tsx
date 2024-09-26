'use client'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { Box, Flex } from 'theme-ui'

function PageCard({ children }) {
  return (
    <Flex
      sx={{
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
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
