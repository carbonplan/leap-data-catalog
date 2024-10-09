'use client'
import { BackButton } from '@/components/back-button'
import { Feedstock } from '@/types/types'
import { Column, Row } from '@carbonplan/components'
import { alpha } from '@theme-ui/color'
import { Box } from 'theme-ui'

export const FeedstockHeader: React.FC<{ feedstock: Feedstock }> = ({
  feedstock,
}) => {
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
      <Box
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
        <Row columns={[6, 6, 8, 12]} sx={{ width: '100%' }}>
          <Column start={1} width={[6, 6, 8, 12]}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: ['1fr', 'auto 1fr'],
                gridTemplateRows: ['auto auto', '1fr'],
                gap: [3, 4, 7, 8],
                mx: [3, 4, 5, 6],
                alignItems: 'center',
              }}
            >
              <BackButton
                sx={{
                  color: 'white',
                  justifySelf: ['start', 'center'],
                }}
              />
              <Box
                as='h2'
                variant='styles.h2'
                sx={{
                  color: 'white',
                  margin: 0,
                  fontSize: ['24px', '28px', '32px', '36px'],
                  lineHeight: 1.2,
                }}
              >
                {feedstock.title}
              </Box>
            </Box>
          </Column>
        </Row>
      </Box>
    </Box>
  )
}
