import { Input } from '@carbonplan/components'
import { Box, Flex, Text } from 'theme-ui'

export const SearchBox = () => {
  return (
    <>
      <Box as='section'>
        <Flex
          sx={{
            alignItems: 'flex-end',
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
                  width: '90%',
                }}
              />
            </form>
          </Box>
        </Flex>
      </Box>
    </>
  )
}
