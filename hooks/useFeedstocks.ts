import { Feedstock } from '@/types/types'
import { fetcher } from '@/utils/fetcher'
import { slugify } from '@/utils/slugify'
import {
  getRandomIndexFromHash,
  getUniqueHashFromString,
} from '@/utils/string-hash'
import useSWR from 'swr'

const fallbackThumbnails = [
  'https://images.unsplash.com/photo-1583325958573-3c89e40551ad?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580193813605-a5c78b4ee01a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1584267385494-9fdd9a71ad75?q=80&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1518627675569-e9d4fb90cdb5?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1563974318767-a4de855d7b43?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1454789476662-53eb23ba5907?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1584267759777-8a74a4f72a91?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mjh8fG1ldGVvcm9sb2d5fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1513553404607-988bf2703777?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&q=80',
]

const colors = [
  'DarkViolet',
  'cadetBlue',
  'yellow',
  'forestGreen',
  'SeaGreen',
  'Teal',
  'Darkorange',
  'DeepSkyBlue',
  'DarkCyan',
  'Tomato',
  'DarkGreen',
  'SteelBlue',
  'Sienna',
]

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
  }))

  return {
    feedstocks: feedstocksWithSlugs,
    error: error,
  }
}
