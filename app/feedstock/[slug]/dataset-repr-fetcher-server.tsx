import { Store } from '@/types/types'
import { getDatasetRepr } from '@/utils/get-xarray-html-repr'

export default async function DatasetReprFetcherServer({
  store,
}: {
  store: Store
}) {
  let data = null
  let error = null

  try {
    data = await getDatasetRepr(store.url)
  } catch (e) {
    console.error('Error fetching dataset repr:', e)
    error = e instanceof Error ? e.message : 'An unknown error occurred'
  }

  return { data, error }
}
