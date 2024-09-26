import { Input } from '@carbonplan/components'
import { Box, Flex, Text } from 'theme-ui'

interface SearchBoxProps {
  sx?: React.CSSProperties
  search: string
  setSearch: (value: string) => void
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  sx,
  search,
  setSearch,
}) => {
  return (
    <Box as='section' sx={{ width: '100%', ...sx }}>
      <Flex
        sx={{
          alignItems: 'flex-end',
          width: '100%',
        }}
      >
        <Text
          sx={{
            fontWeight: 'bold',
            fontSize: [3, 3, 3, 4],
          }}
        >
          Search
        </Text>
        <Box
          sx={{
            ml: [4],
            width: '100%',
          }}
        >
          <form>
            <Input
              size='md'
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
              sx={{
                flexGrow: 1,
                width: '100%',
              }}
            />
          </form>
        </Box>
      </Flex>
    </Box>
  )
}
