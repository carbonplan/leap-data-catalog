'use client'

import { Suspense, useEffect, useState } from 'react'
import { DatasetRepr } from './dataset-repr'

export default function DatasetReprFetcher({
  serverDataPromise,
}: {
  serverDataPromise: () => Promise<{ data: any; error: string | null }>
}) {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    serverDataPromise()
      .then((response) => {
        setData(response.data)
        setError(response.error)
      })
      .catch((err) => {
        setError(err.message)
      })
  }, [serverDataPromise])

  return (
    <Suspense fallback={<div>Loading dataset representation...</div>}>
      <DatasetRepr data={data} error={error} />
    </Suspense>
  )
}
