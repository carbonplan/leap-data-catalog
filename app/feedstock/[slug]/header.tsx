'use client'
import { BackButton } from '@/components/back-button'
import { Feedstock } from '@/types/types'
import { Column, Row } from '@carbonplan/components'
import { alpha } from '@theme-ui/color'
import { Box, Container } from 'theme-ui'

export const FeedstockHeader: React.FC<{ feedstock: Feedstock }> = ({
  feedstock,
}) => {
  return (
    <Box
      sx={{
        position: 'relative',
        height: ['300px', '300px', '350px', '400px'],
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <Box
        as='img'
        // @ts-ignore
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
      <Container
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'grid',
          gridTemplateColumns: '1fr',
          gridTemplateRows: '1fr',
          alignItems: 'center',
        }}
      >
        <Row sx={{ mt: [8, 6, 6, 6], mb: 3 }}>
          <Column start={[1]} width={[6, 1, 1, 1]}>
            <Box sx={{ mb: [4, 4, 0, 0] }}>
              <BackButton
                sx={{
                  color: 'white',
                  mt: [0, 0, '26px', '28px'],
                }}
                preserveQuery
              />
            </Box>
          </Column>
          <Column start={[1, 1, 2, 2]} width={[6, 6, 6, 6]}>
            <Box
              sx={{
                color: 'white',
                fontSize: ['30px', '34px', '38px', '42px'],
              }}
            >
              {feedstock.title}
            </Box>
          </Column>
        </Row>
      </Container>
    </Box>
  )
}
