import { Info } from '@carbonplan/icons'
import React from 'react'
import { Alert, Box, Card, Flex, Text } from 'theme-ui'

interface DatasetReprProps {
  data: {
    html: string
    url: string
    sanitized_url: string
  } | null
  error: string | null
}

export const DatasetRepr: React.FC<DatasetReprProps> = ({ data, error }) => {
  if (error) {
    return (
      <Alert variant='primary' sx={{ p: 3, borderRadius: 'default' }}>
        <Flex sx={{ flexDirection: 'row', gap: 4 }}>
          <Info />
          <Text>Failed to load dataset representation: {error}</Text>
        </Flex>
      </Alert>
    )
  }

  if (!data) {
    return (
      <Alert variant='primary' sx={{ p: 3, borderRadius: 'default' }}>
        <Flex sx={{ flexDirection: 'row', gap: 4 }}>
          <Info />
          <Text>No dataset representation available.</Text>
        </Flex>
      </Alert>
    )
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
