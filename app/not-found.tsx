'use client'

import { Button } from '@carbonplan/components'
import { Left } from '@carbonplan/icons'
import { useRouter } from 'next/navigation'
import { Box, Flex, Heading, Text } from 'theme-ui'

export default function NotFound() {
  const router = useRouter()
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
      <Box sx={{}}>
        <Heading as='h1' sx={{ fontSize: 6, mb: 3, color: 'primary' }}>
          404 - Page Not Found
        </Heading>
        <Text sx={{ fontSize: 3 }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </Text>
        <Button
          inverted
          size='md'
          onClick={() => {
            router.push('/')
          }}
          prefix={<Left />}
          sx={{ mt: 6 }}
        >
          Return to Home
        </Button>
      </Box>
    </Flex>
  )
}
