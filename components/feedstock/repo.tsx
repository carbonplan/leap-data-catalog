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

  const orgAndRepo = getOrgAndRepo(metaURL)
  const githubUrl = `https://github.com/${orgAndRepo}`

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
        Repository
      </Text>

      <Button
        size='xs'
        suffix={<RotatingArrow />}
        as={Link}
        href={githubUrl}
        target='_blank'
        rel='noopener noreferrer'
        sx={{
          mt: 3,
          wordBreak: 'break-word',
        }}
      >
        {orgAndRepo}
      </Button>
    </Box>
  )
}
