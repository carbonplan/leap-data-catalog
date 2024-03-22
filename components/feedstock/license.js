import { Link } from '@carbonplan/components'
import { Box, Text, Flex } from 'theme-ui'

export const License = ({ license }) => {
  return (
    <Box sx={{ flexDirection: 'column', gap: 2 }}>
      <Text sx={{ fontSize: 1, fontWeight: 'bold', color: 'muted' }}>
        License:
      </Text>
      <Flex sx={{ ml: 4 }}>
        <Link
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
      </Flex>
    </Box>
  )
}
