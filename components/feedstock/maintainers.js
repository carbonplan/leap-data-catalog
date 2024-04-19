import { Avatar, Link } from '@carbonplan/components'
import { Box, Flex, Text } from 'theme-ui'

export const Maintainers = ({ maintainers }) => {
  // Sort maintainers by name
  const sortedMaintainers = maintainers.sort((a, b) =>
    a.name.localeCompare(b.name),
  )

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
        Maintainers
      </Text>
      <Flex sx={{ flexDirection: 'row', gap: 2 }}>
        {sortedMaintainers.map((maintainer) => (
          <Link
            key={maintainer.name}
            href={`https://github.com/${maintainer.github}`}
            target='_blank'
            rel='noopener noreferrer'
            sx={{ textDecoration: 'none' }}
          >
            <Flex
              sx={{ flexDirection: 'column', gap: 2, alignItems: 'center' }}
            >
              <Avatar
                src={`https://github.com/${maintainer.github}.png`}
                alt={`${maintainer.name}'s avatar`}
                sx={{ width: 48, height: 48, borderRadius: '50%' }}
              />
              {/* <Text sx={{ fontSize: [2, 2, 3, 3] }}>{maintainer.name}</Text> */}
            </Flex>
          </Link>
        ))}
      </Flex>
    </Flex>
  )
}
