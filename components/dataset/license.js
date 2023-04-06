import { Link } from '@carbonplan/components'
import { Box, Text } from 'theme-ui'

export const License = ({ license }) => {
  return (
    <Box sx={{ flexDirection: 'column', gap: 2, mt: 3 }}>
      <Text sx={{ fontSize: 1, fontWeight: 'bold', color: 'muted' }}>
        License:
      </Text>
      <Link
        ml={2}
        href={license?.href}
        target='_blank'
        rel='noopener noreferrer'
        sx={{
          textDecoration: 'none',
          fontSize: 1,
          fontWeight: 'normal',
          color: 'primary',
        }}
      >
        {license?.name}
      </Link>
    </Box>
  )
}
