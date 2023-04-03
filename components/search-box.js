import { Box, Flex, Input, Text } from 'theme-ui'

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
              <Input
                type='text'
                placeholder='Enter your search term...'
                sx={{
                  border: 'none',
                  borderBottom: '1px solid #ccc',
                  fontSize: 1,
                }}
              />
            </form>
          </Box>
        </Flex>
      </Box>
    </>
  )
}
