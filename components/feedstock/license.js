import { Link } from '@carbonplan/components'
import { Box, Text, Flex } from 'theme-ui'

export const License = ({ license, license_link }) => {
  return (
    <Box sx={{ flexDirection: 'column', gap: 2 }}>
      <Text sx={{ fontSize: 1, fontWeight: 'bold', color: 'muted' }}>
        License:
      </Text>
      <Flex sx={{ ml: 4 }}>
        <Link
          href={
            license === 'proprietary'
              ? license_link?.url
              : `https://spdx.org/licenses/${license}`
          }
          target='_blank'
          rel='noopener noreferrer'
          sx={{
            textDecoration: 'none',
            fontSize: 1,
          }}
        >
          {license || license_link?.label}
        </Link>
      </Flex>
    </Box>
  )
}
