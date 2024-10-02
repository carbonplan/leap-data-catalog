'use client'

import { useFeedstocks } from '@/hooks/useFeedstocks'
import { Column, Link, Row } from '@carbonplan/components'
import { useParams } from 'next/navigation'
import { FaArrowLeftLong } from 'react-icons/fa6'
import { Box, Spinner } from 'theme-ui'

interface FeedstockHeaderProps {
  title: string
  thumbnail: string
}
const FeedstockHeader: React.FC<FeedstockHeaderProps> = ({
  title,
  thumbnail,
}) => {
  return (
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
        src={thumbnail}
        alt={`${title} thumbnail`}
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 6,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Row columns={[12]} sx={{ width: '100%' }}>
          <Column start={1} width={[1]}>
            <Link
              href='/'
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: 'white',
                textDecoration: 'none',
              }}
            >
              <FaArrowLeftLong />
              <Box as='span' sx={{ ml: 2, display: ['none', 'inline'] }}>
                Back
              </Box>
            </Link>
          </Column>

          <Column start={[2]} width={[6]}>
            <Box
              as='h1'
              sx={{
                fontSize: [3, 4, 5, 6],
                fontFamily: 'heading',
                color: 'white',
                margin: 0,
                textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
              }}
            >
              {title}
            </Box>
          </Column>
        </Row>
      </Box>
    </Box>
  )
}

const FeedstockPage: React.FC = () => {
  const { id } = useParams() as { id: string }
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

  const feedstock = feedstocks.find((f) => f.slug === id)

  if (!feedstock) {
    return <Box>Feedstock not found</Box>
  }

  return (
    <Box>
      <Row columns={[6, 8, 12, 12]}>
        <Column start={1} width={[6, 8, 12, 12]}>
          <FeedstockHeader
            title={feedstock.title}
            thumbnail={feedstock.thumbnail}
          />
        </Column>
      </Row>
    </Box>
  )
}

export default FeedstockPage
