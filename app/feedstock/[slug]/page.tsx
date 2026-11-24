import { getFeedstockDetail, getFeedstocks } from '@/utils/get-feedstocks'
import { jsonLd, SITE } from '@/utils/json-ld'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { DatasetPage } from './dataset-page'

export const revalidate = 3600

export async function generateStaticParams() {
  const feedstocks = await getFeedstocks()
  return feedstocks.map((feedstock) => ({
    slug: feedstock.slug,
  }))
}

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const feedstock = await getFeedstockDetail(slug)
  if (!feedstock) return {}
  const { title, summary: description } = feedstock
  const url = `${SITE}/feedstock/${slug}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: 'LEAP Data Catalog' },
    twitter: { card: 'summary', title, description },
  }
}

export default async function FeedstockPage({ params }: Props) {
  const { slug } = await params
  const feedstock = await getFeedstockDetail(slug)

  if (!feedstock) {
    notFound()
  }

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: jsonLd(feedstock) }}
      />
      <DatasetPage feedstock={feedstock} />
    </>
  )
}
