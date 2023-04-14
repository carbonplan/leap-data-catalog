import { Box, Image } from 'theme-ui'
import { Badge } from '@carbonplan/components'
import { alpha } from '@theme-ui/color'

export const Thumbnail = ({ thumbnail, name, demo }) => {
  const fallbackThumbnail = '/sst.png'
  return (
    <Box mt={3} sx={{ position: 'relative' }}>
      <Image
        src={thumbnail ?? fallbackThumbnail}
        alt={`Thumbnail for ${name}`}
        sx={{
          width: '100%',
        }}
      />
      {demo && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            width: '100%',
            backgroundColor: alpha('secondary', 0.4),
            height: '100%',
          }}
        >
          <Badge sx={{ mt: 2, ml: 2 }}>Demo</Badge>
        </Box>
      )}
    </Box>
  )
}
