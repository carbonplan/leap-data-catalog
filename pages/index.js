import { Catalog } from '@/components/catalog'
import { Layout } from '@/components/layout'
import { Guide } from '@carbonplan/components'
import { Box, Container } from 'theme-ui'

export default function Home() {
  return (
    <Layout>
      <Box>
        <Container>
          <Guide />
          <Catalog />
        </Container>
      </Box>
    </Layout>
  )
}
