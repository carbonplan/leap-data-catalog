'use client'

import { useEffect } from 'react'
import { Box, Flex, Heading, Text } from 'theme-ui'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <Flex
      sx={{
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'background',
        color: 'text',
      }}
    >
      <Box sx={{ textAlign: 'center', maxWidth: '600px', px: 3 }}>
        <Heading as='h1' sx={{ fontSize: 6, mb: 3, color: 'primary' }}>
          Oops! Something went wrong
        </Heading>
        <Text sx={{ fontSize: 3, mb: 4 }}>
          {error.digest && `${error.message}`}
        </Text>
      </Box>
    </Flex>
  )
}
