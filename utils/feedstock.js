import { fetcher } from '@/utils/fetcher'
import { useRouter } from 'next/router'
import useSWR from 'swr'

export const useDefaultCatalogUrl = () => {
  const router = useRouter()
  const isClient = typeof window !== 'undefined'
  const hostname = isClient ? window.location.hostname : 'localhost'
  const isProduction = hostname === 'catalog.leap.columbia.edu'
  const defaultCatalogUrl =
    'https://raw.githubusercontent.com/leap-stc/data-management/main/catalog/output/consolidated-web-catalog.json'

  const getCatalogUrl = () => {
    const { catalog } = router.query
    return !isProduction && catalog ? catalog : defaultCatalogUrl
  }

  return getCatalogUrl()
}

export const useFeedstocks = (catalogUrl) => {
  const { data: feedstocks, error } = useSWR(
    catalogUrl,
    fetcher,
    { dedupingInterval: 60 * 60 * 1000 }, // 1 hour in milliseconds
  )

  return { feedstocks, error }
}
