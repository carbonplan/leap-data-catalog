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
