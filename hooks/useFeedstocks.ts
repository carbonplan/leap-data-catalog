import useSWR from 'swr'
import { Feedstock } from '@/types/types'
import { fetcher } from '@/utils/fetcher'

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

  return {
    feedstocks: data,
    error: error,
  }
}
