import { Link as SourceLink } from '@/types/types'
import { Button, Link } from '@carbonplan/components'
import { RotatingArrow } from '@carbonplan/icons'
import { Box, Text } from 'theme-ui'

interface RepositoryProps {
  source?: SourceLink
}

function getOrgAndRepo(url: string): string {
  const urlParts = url.split('/')
  const org = urlParts[3]
  const repo = urlParts[4]
  return `${org}/${repo}`
}

export const Repository: React.FC<RepositoryProps> = ({ source }) => {
  if (!source) {
    return null
  }

  const isGithub = new URL(source.url).hostname === 'github.com'
  const orgAndRepo = getOrgAndRepo(source.url)

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
          {isGithub ? 'Repository' : 'Source'}
        </Text>
      </Box>

      <Button
        size='xs'
        suffix={<RotatingArrow />}
        as={Link}
        href={isGithub ? `https://github.com/${orgAndRepo}` : source.url}
        target='_blank'
        rel='noopener noreferrer'
        sx={{
          wordBreak: 'break-word',
        }}
      >
        {isGithub ? orgAndRepo : source.label}
      </Button>
    </Box>
  )
}
