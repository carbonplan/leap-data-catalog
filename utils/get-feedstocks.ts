import { Feedstock } from '@/types/types'
import { getColor } from '@/utils/colors'
import { slugify } from '@/utils/slugify'
import { getThumbnail } from '@/utils/thumbnail'

const defaultCatalogUrl =
  'https://raw.githubusercontent.com/leap-stc/data-management/main/catalog/output/consolidated-web-catalog.json'

export async function getFeedstocks(catalog?: string): Promise<Feedstock[]> {
  const url = catalog || defaultCatalogUrl

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })

    if (!res.ok) {
      throw new Error(
        `Failed to fetch feedstocks: ${res.status} ${res.statusText}`,
      )
    }

    const feedstocks: Feedstock[] = await res.json()

    return feedstocks.map((feedstock) => ({
      ...feedstock,
      slug: feedstock.slug || slugify(feedstock.title),
      color: getColor(feedstock.title),
      thumbnail: feedstock.thumbnail || getThumbnail(feedstock.title),
    }))
  } catch (error) {
    throw new Error(`Failed to fetch feedstocks: ${error}`)
  }
}
