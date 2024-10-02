import { fetcher } from '@/utils/fetcher'
import { Info } from '@carbonplan/icons'
import React from 'react'
import useSWR from 'swr'
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
  const { data, error, isLoading } = useSWR<DatasetRepr>(
    `/api/dataset-repr?url=${url}`,
    fetcher,
    {
      suspense: true,
      fallbackData: { html: '', url: '', sanitized_url: '' },
      dedupingInterval: 3600,
    },
  )

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

  if (isLoading) {
    return (
      <>
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
      </>
    )
  }

  return (
    <>
      <Card sx={{ p: 3, borderRadius: 'default', width: '100%' }}>
        <Box
          dangerouslySetInnerHTML={{ __html: data?.html }}
          sx={{
            overflowY: 'auto',
            borderColor: 'muted',
            borderRadius: 'default',
            p: 2,
            width: '100%',
          }}
        />
      </Card>
    </>
  )
}
