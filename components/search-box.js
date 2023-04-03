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
              fontSize: 3,
            }}
          >
            Search
          </Text>
          <Box
            sx={{
              flexGrow: 1,
              ml: 3,
            }}
          >
            <form>
              <Input placeholder='Enter your search term...' size='xs' />
            </form>
          </Box>
        </Flex>
      </Box>
    </>
  )
}
