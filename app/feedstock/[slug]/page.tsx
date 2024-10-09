import { getFeedstocks } from '@/utils/get-feedstocks'
import { notFound } from 'next/navigation'
import ClientFeedstockPage from './client-feedstock-page'

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

export default async function FeedstockPage({
  params,
}: {
  params: { slug: string }
}) {
  const feedstock = await getFeedstock(params.slug)

  if (!feedstock) {
    notFound()
  }

  return <ClientFeedstockPage feedstock={feedstock} />
}
