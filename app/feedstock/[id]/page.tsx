'use client'

import { useParams } from 'next/navigation'
import { useFeedstocks } from '@/hooks/useFeedstocks'
import { Box, Spinner } from 'theme-ui'

export default function FeedstockPage() {
  const { id } = useParams()
  const { feedstocks, error } = useFeedstocks()

  if (error) {
    return <Box>Error loading feedstock: {error.message}</Box>
  }

  if (!feedstocks) {
    return (
      <Box>
        <Spinner />
      </Box>
    )
  }
  console.log(feedstocks)

  //   const feedstock = feedstocks.find((f) => f.id === id)

  //   if (!feedstock) {
  //     return <Box>Feedstock not found</Box>
  //   }

  return <div>Testing</div>
}
