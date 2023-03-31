import { Layout } from '@/components/layout'
import { Info } from '@carbonplan/icons'
import { Box, Flex, Text } from 'theme-ui'

export default function Home() {
  return (
    <Layout>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Flex>
          <Info />
          <Text
            sx={{
              px: 2,
            }}
          >
            Site under Construction
          </Text>
        </Flex>
      </Box>
    </Layout>
  )
}
