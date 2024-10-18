'use client'

import { Store } from '@/types/types'
import { Suspense, use } from 'react'
import { DatasetRepr } from './dataset-repr'

export default function DatasetReprFetcher({
  store,
  serverData,
}: {
  store: Store
  serverData: Promise<{ data: any; error: string | null }>
}) {
  const { data, error } = use(serverData)

  return (
    <Suspense fallback={<div>Loading dataset representation...</div>}>
      <DatasetRepr data={data} error={error} />
    </Suspense>
  )
}
