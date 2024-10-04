import { LicenseLink } from '@/types/types'
import { Button, Link } from '@carbonplan/components'
import { Box, Text } from 'theme-ui'

interface LicenseProps {
  license: string
  license_link?: LicenseLink
}

export const License: React.FC<LicenseProps> = ({ license, license_link }) => {
  return (
    <Box>
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

      <Button
        size='xs'
        as={Link}
        href={
          license === 'proprietary'
            ? license_link?.url
            : `https://spdx.org/licenses/${license}`
        }
        target='_blank'
        rel='noopener noreferrer'
        sx={{ mt: 3 }}
      >
        {license || license_link?.title}
      </Button>
    </Box>
  )
}
