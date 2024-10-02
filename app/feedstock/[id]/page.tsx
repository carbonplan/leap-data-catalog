'use client'

import React, { useState } from 'react'
import { CodeSnippet } from '@/components/code-snippet'
import { DataViewer } from '@/components/data-viewer'
import { DatasetRepr } from '@/components/dataset-repr'
import { Divider } from '@/components/divider'
import { Tags } from '@/components/feedstock/tags'
import { useFeedstocks } from '@/hooks/useFeedstocks'
import { Feedstock, Store } from '@/types/types'
import { Button, Column, Row } from '@carbonplan/components'
import { Left } from '@carbonplan/icons'
import { alpha } from '@theme-ui/color'
import { useParams, useRouter } from 'next/navigation'
import { Box, Flex, Spinner, Text } from 'theme-ui'

import { TooltipWrapper } from '@/components/tooltip-wrapper'

import { License, Links, Maintainers, Repository } from '@/components/feedstock'

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
        height: ['300px', '350px', '400px'],
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
          backgroundColor: alpha(feedstock.color, 0.5),
          position: 'absolute',
          height: '100%',
          width: '100%',
          opacity: 0.8,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: [3, 4, 5, 6],
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Row columns={[6, 6, 12, 12]} sx={{ width: '100%' }}>
          <Column start={1} width={[1]}>
            <BackButton sx={{ color: 'white' }} />
          </Column>

          <Column start={[1, 1, 2, 2]} width={[6, 6, 8, 8]}>
            <Box
              as='h1'
              sx={{
                fontSize: [3, 4, 5, 6],
                fontFamily: 'heading',
                color: 'white',
                mt: [6, 6, 3, 3],
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
    <Box sx={{ ml: [3, 4, 5, 6] }}>
      <Row columns={[1, 1, 12, 12]}>
        <Column start={[1, 1, 2, 2]} width={[1, 1, 6, 6]}>
          <Flex sx={{ flexDirection: 'column', gap: [3, 4] }}>
            {feedstock.tags && <Tags tags={feedstock.tags} />}
            <Box sx={{ fontSize: [2, 2, 2, 3], mb: 2, py: [1] }}>
              {feedstock.description}
            </Box>
          </Flex>
        </Column>
        <Column start={[1, 1, 9, 9]} width={[1, 1, 3, 3]}>
          {feedstock.links && <Links links={feedstock.links} />}
        </Column>
      </Row>
    </Box>
  )
}

const FeedstockStore: React.FC<{ store: Store; color: string }> = ({
  store,
  color,
}) => {
  const [tooltipExpanded, setTooltipExpanded] = useState(false)

  const tooltipContent = !store.public
    ? 'Access requires credentials or a Columbia-LEAP JupyterHub server.'
    : store.geospatial
      ? ''
      : 'This dataset contains non-geospatial data not supported by the data viewer.'

  return (
    <Box sx={{ ml: [3, 4, 5, 6] }}>
      <Row columns={[1, 1, 12, 12]}>
        <Column start={[1, 1, 2, 2]} width={[1, 1, 3, 3]}>
          <TooltipWrapper
            tooltip={tooltipContent}
            color={color}
            expanded={!store.public && tooltipExpanded}
            setExpanded={setTooltipExpanded}
          >
            <Text
              sx={{
                mr: [2],
                color: color,
                fontSize: [2, 2, 2, 3],
                textTransform: 'uppercase',
              }}
            >
              {store.name || store.id}
            </Text>
          </TooltipWrapper>
        </Column>
        <Column start={[1, 1, 5, 5]} width={[1, 1, 5, 5]}>
          <Flex sx={{ flexDirection: ['column'], gap: 4, mt: [6, 6, 0, 0] }}>
            <Flex
              sx={{
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Text
                sx={{
                  color: 'muted',
                  fontSize: 0,
                  fontFamily: 'mono',
                  letterSpacing: 'mono',
                  textTransform: 'uppercase',
                }}
              >
                Data Viewer
              </Text>
              <DataViewer store={store} color={color} />
            </Flex>

            <Flex
              sx={{
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Text
                sx={{
                  color: 'muted',
                  fontSize: 0,
                  fontFamily: 'mono',
                  letterSpacing: 'mono',
                  textTransform: 'uppercase',
                }}
              >
                Load Dataset
              </Text>
              <CodeSnippet url={store.url} color={color} />
            </Flex>

            <Flex
              sx={{
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <TooltipWrapper
                tooltip={tooltipContent}
                color={color}
                expanded={!store.public && tooltipExpanded}
                setExpanded={setTooltipExpanded}
              >
                <Text
                  sx={{
                    color: 'muted',
                    fontSize: 0,
                    fontFamily: 'mono',
                    letterSpacing: 'mono',
                    textTransform: 'uppercase',
                  }}
                >
                  Metadata
                </Text>
              </TooltipWrapper>
              <DatasetRepr url={store.url} />
            </Flex>
          </Flex>
        </Column>
      </Row>
    </Box>
  )
}

const FeedstockDetails: React.FC<{ feedstock: Feedstock }> = ({
  feedstock,
}) => {
  return (
    <Box sx={{ ml: [3, 4, 5, 6] }}>
      <Row columns={[1, 1, 12, 12]}>
        <Column start={[1, 1, 2, 2]} width={[1, 1, 10, 10]}>
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

      {feedstock.stores.map((store, index) => (
        <>
          <FeedstockStore key={index} store={store} color={feedstock.color} />{' '}
          <SectionDivider color={feedstock.color} />
        </>
      ))}
    </Flex>
  )
}

export default FeedstockPage
