import { Box, Image } from 'theme-ui'

export const Thumbnail = ({ thumbnail, name }) => {
  const fallbackThumbnail = 'https://via.placeholder.com/300x200'
  return (
    <Box pt={3}>
      <Image
        src={thumbnail ?? fallbackThumbnail}
        alt={`Thumbnail for ${name}`}
      />
    </Box>
  )
}
