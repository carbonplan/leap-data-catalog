'use client'

import { Thumbnail } from '@/components/feedstock'
import { useFeedstocks } from '@/hooks/useFeedstocks'
import { Feedstock } from '@/types/types'
import { Button, Row, Column } from '@carbonplan/components'
import { useParams, useRouter } from 'next/navigation'
import { FaArrowLeftLong } from 'react-icons/fa6'
import { Box, Flex, Spinner, Text } from 'theme-ui'

interface FeedstockHeaderProps {
  title: string
  thumbnail: string
}

const FeedstockHeader: React.FC<FeedstockHeaderProps> = ({
  title,
  thumbnail,
}) => {
  const router = useRouter()
  return (
    <Box
      sx={{
        position: 'relative',
        height: '200px',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <Box
        as='img'
        src={thumbnail}
        alt={`${title} thumbnail`}
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
      <Flex
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '1rem',
        }}
      >
        <Button
          onClick={() => router.back()}
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: 'white',
          }}
        >
          <FaArrowLeftLong />
          <Text sx={{ ml: 2 }}>Back</Text>
        </Button>
        <Text
          sx={{
            fontSize: ['24px', '32px', '40px'],
            fontFamily: 'heading',
            color: 'white',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)',
          }}
        >
          {title}
        </Text>
      </Flex>
    </Box>
  )
}

interface FeedstockComponentProps {
  feedstock: Feedstock
}

const FeedstockPage: React.FC = () => {
  const { id } = useParams() as { id: string }
  const { feedstocks, error } = useFeedstocks()
  const router = useRouter()

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

  const feedstock = feedstocks.find((f) => f.slug === id)

  if (!feedstock) {
    return <Box>Feedstock not found</Box>
  }

  return (
    <Box>
      <Row columns={[6, 8, 12, 12]}>
        <Column start={1} width={[6, 8, 12, 12]}>
          <Box
            sx={{
              position: 'relative',
              height: '400px',
              width: '100%',
              overflow: 'hidden',
            }}
          >
            <Box
              as='img'
              src={feedstock.thumbnail}
              alt={`${feedstock.title} thumbnail`}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Box>
        </Column>
      </Row>
    </Box>
  )
}

export default FeedstockPage
