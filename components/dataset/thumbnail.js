import { Badge } from '@carbonplan/components'
import { alpha } from '@theme-ui/color'
import { Box } from 'theme-ui'

export const Thumbnail = ({ thumbnail, demo, index = 0 }) => {
  const fallbackThumbnails = [
    'https://images.unsplash.com/photo-1563974318767-a4de855d7b43?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2074&q=80',
    'https://images.unsplash.com/photo-1454789476662-53eb23ba5907?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=752&q=80',
    'https://images.unsplash.com/photo-1584267759777-8a74a4f72a91?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mjh8fG1ldGVvcm9sb2d5fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1513553404607-988bf2703777?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=736&q=80',
    'https://images.unsplash.com/photo-1583325958573-3c89e40551ad?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80',
    'https://images.unsplash.com/photo-1580193813605-a5c78b4ee01a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=765&q=80',
  ]

  const fallbackThumbnail =
    fallbackThumbnails[index % fallbackThumbnails.length]

  const colors = [
    'red',
    'orange',
    'yellow',
    'green',
    'teal',
    'blue',
    'cyan',
    'purple',
    'pink',
  ]

  const color = colors[index % colors.length]

  const image = thumbnail ?? fallbackThumbnail

  return (
    <>
      <Box>
        <Box>
          <Box
            sx={{
              backgroundImage: `url(${image})`,
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
