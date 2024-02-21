import { Badge } from '@carbonplan/components'
import { alpha } from '@theme-ui/color'
import { Box } from 'theme-ui'

export const Thumbnail = ({ url, color, demo }) => {
  return (
    <>
      <Box>
        <Box>
          <Box
            sx={{
              backgroundImage: `url(${url})`,
              position: 'absolute',
              height: '200px',
              width: '100%',
              filter: 'grayscale(100%)',
              backgroundSize: 'cover',
            }}
          />
          <Box
            sx={{
              backgroundColor: alpha(color, 0.4),
              position: 'absolute',
              height: '200px',
              width: '100%',
              opacity: 0.7,
              mixBlendMode: 'dodge',
            }}
          />
        </Box>

        <Box>
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
        </Box>
      </Box>
    </>
  )
}
