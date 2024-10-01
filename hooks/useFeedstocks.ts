import { Feedstock } from '@/types/types'
import { fetcher } from '@/utils/fetcher'
import { slugify } from '@/utils/slugify'
import { getColor } from '@/utils/colors'
import { getThumbnail } from '@/utils/thumbnail'
import useSWR from 'swr'

export const useFeedstocks = (catalogUrl?: string) => {
  const getApiUrl = () => {
    if (typeof window !== 'undefined') {
      const apiUrl = new URL('/api/feedstocks', window.location.origin)
      if (catalogUrl) {
        apiUrl.searchParams.append('catalog', catalogUrl)
      }
      return apiUrl.toString()
    }
    return (
      '/api/feedstocks' +
      (catalogUrl ? `?catalog=${encodeURIComponent(catalogUrl)}` : '')
    )
  }

  const { data, error } = useSWR<Feedstock[]>(getApiUrl, fetcher, {
    suspense: true,
    fallbackData: [],
  })

  // Ensure slugs are added even if they weren't added in the API
  const feedstocksWithSlugs = data?.map((feedstock) => ({
    ...feedstock,
    slug: feedstock.slug || slugify(feedstock.title),
    color: getColor(feedstock.title),
    thumbnail: feedstock.thumbnail || getThumbnail(feedstock.title),
  }))

  return {
    feedstocks: feedstocksWithSlugs,
    error: error,
  }
}
