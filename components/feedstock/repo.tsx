import { Button, Link } from '@carbonplan/components'
import { RotatingArrow } from '@carbonplan/icons'
import { Box, Text } from 'theme-ui'

interface RepositoryProps {
  metaURL?: string
}

function getOrgAndRepo(url: string): string {
  const urlParts = url.split('/')
  const org = urlParts[3]
  const repo = urlParts[4]
  return `${org}/${repo}`
}

export const Repository: React.FC<RepositoryProps> = ({ metaURL }) => {
  if (!metaURL) {
    return null
  }

  const isGithub = metaURL.startsWith('https://github.com/')
  const label = isGithub
    ? getOrgAndRepo(metaURL)
    : metaURL.replace(/^https?:\/\//, '').replace(/\/$/, '')

  return (
    <Box>
      <Box sx={{ mb: 2, mt: 2 }}>
        {' '}
        <Text
          sx={{
            color: 'muted',
            fontSize: 0,
            fontFamily: 'mono',
            letterSpacing: 'mono',
            textTransform: 'uppercase',
          }}
        >
          {isGithub ? 'Feedstock repository' : 'Source'}
        </Text>
      </Box>

      <Button
        size='xs'
        suffix={<RotatingArrow />}
        as={Link}
        href={metaURL}
        target='_blank'
        rel='noopener noreferrer'
        sx={{
          wordBreak: 'break-word',
        }}
      >
        {label}
      </Button>
    </Box>
  )
}
