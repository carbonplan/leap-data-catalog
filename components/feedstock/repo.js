import { Link } from '@carbonplan/components'
import { Flex, Text } from 'theme-ui'

function getOrgAndRepo(url) {
  const urlParts = url.split('/')
  const org = urlParts[3]
  const repo = urlParts[4]
  return `${org}/${repo}`
}
export const Repository = ({ metaURL }) => {
  const orgAndRepo = getOrgAndRepo(metaURL)
  const githubUrl = `https://github.com/${orgAndRepo}`

  return (
    <Flex
      sx={{
        flexDirection: 'column',
        gap: 2,
        justifyContent: 'space-between',
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
        Repository
      </Text>
      <Flex sx={{ flexDirection: 'row', gap: 2 }}>
        <Link
          href={githubUrl}
          target='_blank'
          rel='noopener noreferrer'
          sx={{
            textDecoration: 'none',
            fontSize: [2, 2, 2, 3],
          }}
        >
          {orgAndRepo}
        </Link>
      </Flex>
    </Flex>
  )
}
