import { Input } from '@carbonplan/components'
import { Box, Flex, Text } from 'theme-ui'

export const SearchBox = () => {
  return (
    <>
      <Box as='section' sx={{ width: '100%' }}>
        <Flex
          sx={{
            alignItems: 'flex-end',
            width: '100%',
          }}
        >
          <Text
            sx={{
              fontWeight: 'bold',
              fontSize: [3, 4],
            }}
          >
            Search
          </Text>
          <Box
            sx={{
              ml: [6],
            }}
          >
            <form>
              <Input
                size='md'
                sx={{
                  flexGrow: 1,
                }}
              />
            </form>
          </Box>
        </Flex>
      </Box>
    </>
  )
}
