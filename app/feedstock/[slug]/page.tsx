import { getFeedstocks } from '@/utils/get-feedstocks'
import { notFound } from 'next/navigation'
import ClientFeedstockPage from './client-feedstock-page'
import { Feedstock, Store } from '@/types/types'
import { getDatasetRepr } from '@/utils/get-xarray-html-repr'

export async function generateStaticParams() {
  const feedstocks = await getFeedstocks()
  return feedstocks.map((feedstock) => ({
    slug: feedstock.slug,
  }))
}

async function getFeedstock(slug: string) {
  const feedstocks = await getFeedstocks()
  return feedstocks.find((f) => f.slug === slug)
}

async function getDatasetReprs(
  stores: Store[],
): Promise<Record<string, { repr: any; error: string | null }>> {
  const datasetReprs = await Promise.all(
    stores.map(async (store) => {
      try {
        const repr = await getDatasetRepr(store.url)
        return { storeId: store.id, repr, error: null }
      } catch (error) {
        console.error(
          `Error fetching dataset repr for store ${store.id}:`,
          error,
        )
        return {
          storeId: store.id,
          repr: null,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    }),
  )
  return Object.fromEntries(
    datasetReprs.map(({ storeId, repr, error }) => [storeId, { repr, error }]),
  )
}

export default async function FeedstockPage({
  params,
}: {
  params: { slug: string }
}) {
  const feedstock = await getFeedstock(params.slug)

  if (!feedstock) {
    notFound()
  }

  const datasetReprs = feedstock.stores
    ? await getDatasetReprs(feedstock.stores)
    : {}

  return (
    <ClientFeedstockPage feedstock={feedstock} datasetReprs={datasetReprs} />
  )
}
