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
      <Box sx={{ mb: 2, mt: 2 }}>
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
      </Box>

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
      >
        {license || license_link?.title}
      </Button>
    </Box>
  )
}
