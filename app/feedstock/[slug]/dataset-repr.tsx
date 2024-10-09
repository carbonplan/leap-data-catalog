import { getDatasetRepr } from '@/utils/get-xarray-html-repr'
import { Info } from '@carbonplan/icons'
import React from 'react'
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
  try {
    const data = getDatasetRepr(url)
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
  } catch (error) {
    return (
      <Alert variant='primary' sx={{ p: 3, borderRadius: 'default' }}>
        <Flex sx={{ flexDirection: 'row', gap: 4 }}>
          <Info />
          <Text>Failed to load dataset representation: {error.message}</Text>
        </Flex>
      </Alert>
    )
  }
}
