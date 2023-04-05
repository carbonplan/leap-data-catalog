import { Box, Image } from 'theme-ui'

export const Thumbnail = ({ thumbnail, name }) => {
  const fallbackThumbnail = 'https://via.placeholder.com/400x200'
  return (
    <Box mt={3}>
      <Image
        src={thumbnail ?? fallbackThumbnail}
        alt={`Thumbnail for ${name}`}
        sx={{
          width: '100%',
        }}
      />
    </Box>
  )
}