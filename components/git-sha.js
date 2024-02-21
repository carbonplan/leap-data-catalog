import { IoGitBranchOutline } from 'react-icons/io5'
import { Flex, Link, Text } from 'theme-ui'

const sha = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || ''
const owner = process.env.NEXT_PUBLIC_VERCEL_GIT_REPO_OWNER || ''
const slug = process.env.NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG || ''

export const GitSHA = () => {
  if (!sha || !owner || !slug) {
    return null
  }

  return (
    <Flex
      sx={{
        alignItems: 'center',
        fontSize: 1,
      }}
    >
      <Link
        href={`https://github.com/${owner}/${slug}/tree/${sha}`}
        sx={{ display: 'inline-flex', alignItems: 'center' }}
      >
        <IoGitBranchOutline size={20} />
        <Text sx={{ ml: 1 }}>{sha.substring(0, 7)}</Text>
      </Link>
    </Flex>
  )
}
