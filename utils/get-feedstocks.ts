import { Feedstock } from '@/types/types'
import { getColor } from '@/utils/colors'
import { slugify } from '@/utils/slugify'
import { getThumbnail } from '@/utils/thumbnail'

const defaultCatalogUrl =
  'https://raw.githubusercontent.com/leap-stc/data-management/main/catalog/output/consolidated-web-catalog.json'

export async function getFeedstocks(catalogUrl?: string): Promise<Feedstock[]> {
  const url = catalogUrl || defaultCatalogUrl

  const res = await fetch(url, { next: { revalidate: 3600 } })

  if (!res.ok) {
    throw new Error('Failed to fetch feedstocks')
  }

  const feedstocks: Feedstock[] = await res.json()

  return feedstocks.map((feedstock) => ({
    ...feedstock,
    slug: feedstock.slug || slugify(feedstock.title),
    color: getColor(feedstock.title),
    thumbnail: feedstock.thumbnail || getThumbnail(feedstock.title),
  }))
}
