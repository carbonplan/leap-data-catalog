'use client'

import { useFeedstocks } from '@/hooks/useFeedstocks'
import { Column, Link, Row, Button } from '@carbonplan/components'
import { useParams, useRouter } from 'next/navigation'
import { Box, Spinner, Flex, Text } from 'theme-ui'
import { Left } from '@carbonplan/icons'
import { Feedstock } from '@/types/types'
import { Tags } from '@/components/feedstock/tags'
import { alpha } from '@theme-ui/color'
import { Divider } from '@/components/divider'

import {
  License,
  Links,
  Maintainers,
  Repository,
  Stores,
  Thumbnail,
  Providers,
} from '@/components/feedstock'

const BackButton = ({ href = '/', sx }) => {
  const router = useRouter()

  return (
    <Button
      inverted
      size='xs'
      onClick={() => {
        router.push(href)
      }}
      prefix={<Left />}
      sx={sx}
    >
      Back
    </Button>
  )
}

interface FeedstockHeaderProps {
  title: string
  thumbnail: string
}
const FeedstockHeader: React.FC<{ feedstock: Feedstock }> = ({ feedstock }) => {
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
        src={feedstock.thumbnail}
        alt={`${feedstock.title} thumbnail`}
        sx={{
          position: 'absolute',
          height: '100%',
          width: '100%',
          filter: 'grayscale(100%)',
          objectFit: 'cover',
        }}
      />
      <Box
        sx={{
          backgroundColor: alpha(feedstock.color, 0.4),
          position: 'absolute',
          height: '100%',
          width: '100%',
          opacity: 0.7,
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
            <BackButton sx={{ color: 'white' }} />
          </Column>

          <Column start={[2]} width={[6]}>
            <Box
              as='h1'
              sx={{
                fontSize: [3, 4, 5, 6],
                fontFamily: 'heading',
                color: 'white',
              }}
            >
              {feedstock.title}
            </Box>
          </Column>
        </Row>
      </Box>
    </Box>
  )
}

const SectionDivider: React.FC<{ color: string }> = ({ color }) => {
  return (
    <>
      <Row columns={[12]}>
        <Column start={[2]} width={[10]}>
          <Divider color={color} />
        </Column>
      </Row>
    </>
  )
}

const FeedstockDescription: React.FC<{ feedstock: Feedstock }> = ({
  feedstock,
}) => {
  return (
    <Box sx={{ ml: 6 }}>
      <Row columns={[12]}>
        <Column start={[2]} width={[6]}>
          <Flex sx={{ flexDirection: 'column', gap: [4] }}>
            {feedstock.tags && <Tags tags={feedstock.tags} />}
            <Box sx={{ fontSize: [2, 2, 2, 3], mb: 2, py: [1] }}>
              {feedstock.description}
            </Box>
          </Flex>
        </Column>
        <Column start={[9]} width={[3]}>
          {feedstock.links && <Links links={feedstock.links} />}
        </Column>
      </Row>
    </Box>
  )
}

const FeedstockDetails: React.FC<{ feedstock: Feedstock }> = ({
  feedstock,
}) => {
  return (
    <Box sx={{ ml: 6 }}>
      <Row columns={[12]}>
        <Column start={[2]} width={[10]}>
          <Flex
            sx={{
              flexDirection: ['column', 'column', 'row', 'row'],
              gap: [4, 4, 6, 6],
              justifyContent: 'space-between',
              alignItems: ['stretch', 'flex-start'],
            }}
          >
            <Maintainers maintainers={feedstock.maintainers} />
            <License
              license={feedstock.provenance?.license}
              license_link={feedstock.provenance?.license_link}
            />
            <Repository metaURL={feedstock['ncviewjs:meta_yaml_url']} />
            {/* <Providers providers={feedstock.provenance?.providers} /> */}
          </Flex>
        </Column>
      </Row>
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
  console.log(feedstock)

  if (!feedstock) {
    return <Box>Feedstock not found</Box>
  }

  return (
    <Flex sx={{ flexDirection: 'column', gap: [4] }}>
      <FeedstockHeader feedstock={feedstock} />
      <FeedstockDescription feedstock={feedstock} />
      <SectionDivider color={feedstock.color} />
      <FeedstockDetails feedstock={feedstock} />
      <SectionDivider color={feedstock.color} />
    </Flex>
  )
}

export default FeedstockPage
