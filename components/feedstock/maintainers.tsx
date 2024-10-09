import { Maintainer } from '@/types/types'
import { Avatar, Link } from '@carbonplan/components'
import { Flex, Text, Box } from 'theme-ui'

interface MaintainersProps {
  maintainers: Maintainer[]
}

export const Maintainers: React.FC<MaintainersProps> = ({ maintainers }) => {
  // Sort maintainers by name
  const sortedMaintainers = maintainers.sort((a, b) =>
    a.name.localeCompare(b.name),
  )

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
        Maintainers
      </Text>
      <Flex sx={{ flexDirection: 'row', gap: 2, mt: 3 }}>
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
            </Flex>
          </Link>
        ))}
      </Flex>
    </Box>
  )
}
