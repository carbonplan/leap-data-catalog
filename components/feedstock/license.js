import { Link } from '@carbonplan/components'
import { Flex, Text } from 'theme-ui'

export const License = ({ license, license_link }) => {
  return (
    <Flex
      sx={{
        flexDirection: 'column',
        gap: 2,
        mt: 4,
      }}
    >
      <Text
        sx={{
          color: 'muted',
          fontSize: 0,
          fontFamily: 'mono',
          letterSpacing: 'mono',
          textTransform: 'uppercase',
        }}
      >
        License
      </Text>

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
          fontSize: [2, 2, 2, 3],
        }}
      >
        {license || license_link?.label}
      </Link>
    </Flex>
  )
}
