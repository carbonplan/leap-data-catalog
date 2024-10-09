import { getDatasetRepr } from '@/utils/get-xarray-html-repr'
import { Info } from '@carbonplan/icons'
import React, { useEffect, useState } from 'react'
import { Alert, Box, Card, Flex, Text } from 'theme-ui'

interface DatasetReprProps {
  url: string
}

interface DatasetRepr {
  html: string
  url: string
  sanitized_url: string
}

export const DatasetRepr: React.FC<DatasetReprProps> = ({ url }) => {
  const [data, setData] = useState<DatasetRepr | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getDatasetRepr(url)
        setData(result)
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('An unknown error occurred'),
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [url])

  if (isLoading) {
    return (
      <Card sx={{ p: 3, borderRadius: 'default', width: '100%' }}>
        <Box
          sx={{
            height: '200px',
            bg: 'muted',
            width: '100%',
            borderColor: 'muted',
            borderRadius: 'default',
          }}
        />
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant='primary' sx={{ p: 3, borderRadius: 'default' }}>
        <Flex sx={{ flexDirection: 'row', gap: 4 }}>
          <Info />
          <Text>Failed to load dataset representation: {error.message}</Text>
        </Flex>
      </Alert>
    )
  }

  if (!data) {
    return null
  }

  return (
    <Card sx={{ p: 3, borderRadius: 'default', width: '100%' }}>
      <Box
        dangerouslySetInnerHTML={{ __html: data.html }}
        sx={{
          overflowY: 'auto',
          borderColor: 'muted',
          borderRadius: 'default',
          p: 2,
          width: '100%',
        }}
      />
    </Card>
  )
}
