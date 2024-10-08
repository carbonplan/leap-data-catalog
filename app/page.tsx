import { getFeedstocks } from '@/app/get-feedstocks'
import { notFound } from 'next/navigation'
import { Catalog } from '@/components/catalog'

type SearchParams = {
  catalogUrl?: string
  [key: string]: string | string[] | undefined
}

type Props = {
  searchParams: SearchParams
}

export default async function HomePage({ searchParams }: Props) {
  const catalog = searchParams.catalogUrl
  try {
    const feedstocks = catalog
      ? await getFeedstocks(catalog)
      : await getFeedstocks()

    if (!feedstocks || feedstocks.length === 0) {
      notFound()
    }

    return <Catalog feedstocks={feedstocks} />
  } catch (error) {
    throw new Error('Failed to fetch feedstocks')
  }
}
