import { Badge } from '@carbonplan/components'
import { alpha } from '@theme-ui/color'
import { Box } from 'theme-ui'

export const Thumbnail = ({ url, color, demo }) => {
  return (
    <Box
      sx={{
        height: ['200px', '200px', '250px', '300px'],
        position: 'relative',
      }}
    >
      <Box
        as='img'
        src={url}
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
          backgroundColor: alpha(color, 0.4),
          position: 'absolute',
          height: '100%',
          width: '100%',
          opacity: 0.7,
        }}
      />

      {demo && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            width: '100%',
            height: '100%',
            backgroundColor: alpha('secondary', 0.4),
          }}
        >
          <Badge sx={{ mt: 2, ml: 2 }}>Demo</Badge>
        </Box>
      )}
    </Box>
  )
}
