import { Catalog } from '@/components/catalog'
import { getFeedstocks } from '@/utils/get-feedstocks'
import { notFound } from 'next/navigation'

type SearchParams = {
  catalog?: string
  [key: string]: string | string[] | undefined
}

type Props = {
  searchParams: Promise<SearchParams>
}

export default async function HomePage({ searchParams }: Props) {
  const { catalog } = await searchParams
  try {
    const feedstocks = catalog
      ? await getFeedstocks(catalog)
      : await getFeedstocks()

    if (!feedstocks || feedstocks.length === 0) {
      notFound()
    }

    return <Catalog feedstocks={feedstocks} catalog={catalog} />
  } catch (error) {
    throw new Error(`${error}`)
  }
}
