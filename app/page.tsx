import { Catalog } from '@/components/catalog'
import { getFeedstocks } from '@/utils/get-feedstocks'
import { notFound } from 'next/navigation'

export default async function HomePage() {
  const feedstocks = await getFeedstocks()

  if (feedstocks.length === 0) {
    notFound()
  }

  return <Catalog feedstocks={feedstocks} />
}
