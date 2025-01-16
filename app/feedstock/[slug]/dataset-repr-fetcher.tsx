'use client'

import { useEffect, useState } from 'react'
import { DatasetRepr } from './dataset-repr'

export default function DatasetReprFetcher({
  serverDataPromise,
}: {
  serverDataPromise: () => Promise<{ data: any; error: string | null }>
}) {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    serverDataPromise()
      .then((response) => {
        setData(response.data)
        setError(response.error)
      })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [serverDataPromise])

  if (isLoading) {
    return <div>Loading dataset representation...</div>
  }

  return <DatasetRepr data={data} error={error} />
}
