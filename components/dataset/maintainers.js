import { Box, Flex, Image, Text } from 'theme-ui'
import { Link, AvatarGroup, Avatar, Group } from '@carbonplan/components'

export const Maintainers = ({ maintainers }) => {
  // Sort maintainers by name
  const sortedMaintainers = maintainers.sort((a, b) =>
    a.name.localeCompare(b.name),
  )

  return (
    <>
      <Box mt={3}>
        {' '}
        <Flex sx={{ flexDirection: 'column', gap: 2 }}>
          <Text sx={{ fontSize: 1, fontWeight: 'bold', color: 'muted' }}>
            Maintainers:
          </Text>
          <Flex mt={3} sx={{ flexDirection: 'row', gap: 3 }}>
            {sortedMaintainers.map((maintainer) => (
              <Link
                key={maintainer.name}
                href={`https://github.com/${maintainer.github_username}`}
                target='_blank'
                rel='noopener noreferrer'
                sx={{ textDecoration: 'none' }}
              >
                <Flex
                  sx={{ flexDirection: 'column', alignItems: 'center', gap: 1 }}
                >
                  <Avatar
                    src={`https://github.com/${maintainer.github_username}.png`}
                    alt={`${maintainer.name}'s avatar`}
                    sx={{ width: 48, height: 48, borderRadius: '50%' }}
                  />
                  <Text
                    sx={{
                      fontSize: 1,
                      fontWeight: 'normal',
                      textAlign: 'center',
                    }}
                  >
                    {maintainer.name}
                  </Text>
                </Flex>
              </Link>
            ))}
          </Flex>
        </Flex>
      </Box>
    </>
  )
}
