'use client'

import { Store } from '@/types/types'
import { Suspense, use, useMemo } from 'react'
import { DatasetRepr } from './dataset-repr'

export default function DatasetReprFetcher({
  store,
  serverDataPromise,
}: {
  store: Store
  serverDataPromise: () => Promise<{ data: any; error: string | null }>
}) {
  const memoizedPromise = useMemo(
    () => serverDataPromise(),
    [serverDataPromise],
  )
  const { data, error } = use(memoizedPromise)

  return (
    <Suspense fallback={<div>Loading dataset representation...</div>}>
      <DatasetRepr data={data} error={error} />
    </Suspense>
  )
}
