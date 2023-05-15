import { Box, Image, Link } from 'theme-ui'
import { Badge } from '@carbonplan/components'
import { alpha } from '@theme-ui/color'

export const Thumbnail = ({ thumbnail, name, demo }) => {
  const fallbackThumbnail = 'https://via.placeholder.com/400x200'

  return (
    <Box mt={3} sx={{ position: 'relative' }}>
      <Link>
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
              height: 'calc(100% - 5px)',
            }}
          >
            <Badge sx={{ mt: 2, ml: 2 }}>Demo</Badge>
          </Box>
        )}
      </Link>
    </Box>
  )
}
