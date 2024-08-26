import { Catalog } from '@/components/catalog'
import { Layout } from '@/components/layout'

import { fetcher } from '@/utils/fetcher'
import { Guide } from '@carbonplan/components'
import { Box, Container } from 'theme-ui'

const getDefaultCatalogUrl = () => {
  return 'https://raw.githubusercontent.com/leap-stc/data-management/main/catalog/output/consolidated-web-catalog.json'
}

export default function FeedstockPage({ id }) {
  return (
    <Layout>
      <Box>
        <Container>
          <Guide />
          <Catalog initialSelectedId={id} />
        </Container>
      </Box>
    </Layout>
  )
}

export async function getStaticProps(context) {
  const { id } = context.params

  return {
    props: { id },
    revalidate: 3600, // Revalidate every hour
  }
}

export async function getStaticPaths() {
  const catalogUrl = getDefaultCatalogUrl()
  let feedstocks = []

  try {
    feedstocks = await fetcher(catalogUrl)
  } catch (error) {
    console.error('Error fetching feedstocks:', error)
  }

  const paths = feedstocks.map((feedstock) => ({
    params: { id: feedstock.title.toLowerCase().replace(/\s+/g, '-') },
  }))

  return {
    paths,
    fallback: 'blocking',
  }
}
