import { getFeedstocks } from '@/utils/get-feedstocks'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ClientFeedstockPage from './client-feedstock-page'

export const revalidate = 3600

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

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return { title: `Feedstock: ${slug}` }
}

export default async function FeedstockPage({ params }: Props) {
  const { slug } = await params
  const feedstock = await getFeedstock(slug)

  if (!feedstock) {
    notFound()
  }

  return <ClientFeedstockPage feedstock={feedstock} />
}
