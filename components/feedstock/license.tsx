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

      {license_link?.url ? (
        <Button
          size='xs'
          as={Link}
          href={license_link.url}
          target='_blank'
          rel='noopener noreferrer'
        >
          {license || license_link.title}
        </Button>
      ) : (
        <Box sx={{ fontSize: [2, 2, 2, 3] }}>{license || 'Not specified'}</Box>
      )}
    </Box>
  )
}
