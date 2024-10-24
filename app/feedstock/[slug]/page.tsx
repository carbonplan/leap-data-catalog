import { getFeedstocks } from '@/utils/get-feedstocks'
import { notFound } from 'next/navigation'
import ClientFeedstockPage from './client-feedstock-page'

export async function generateStaticParams() {
  const feedstocks = await getFeedstocks()
  return feedstocks.map((feedstock) => ({
    slug: feedstock.slug,
  }))
}

async function getFeedstock(slug: string, catalog?: string) {
  const feedstocks = await getFeedstocks(catalog)
  return feedstocks.find((f) => f.slug === slug)
}

export default async function FeedstockPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { catalog?: string }
}) {
  const { slug } = params
  const { catalog } = searchParams
  const feedstock = await getFeedstock(slug, catalog)

  if (!feedstock) {
    notFound()
  }

  return <ClientFeedstockPage feedstock={feedstock} />
}
