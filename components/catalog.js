import { SearchBox } from '@/components/search-box'
import { Box, Flex, Text } from 'theme-ui'

export const Catalog = () => {
  return (
    <Box as='section' py={2}>
      <Flex
        sx={{
          flexDirection: ['column', 'row'],
          alignItems: ['flex-start', 'center'],
          gap: [3, 8],
        }}
      >
        <Text
          sx={{
            color: 'primary',
            fontSize: 6,
            fontFamily: 'heading',
          }}
        >
          Data Catalog
        </Text>
        <SearchBox />
      </Flex>
    </Box>
  )
}
