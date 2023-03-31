import { Link } from '@carbonplan/components'
import { Box, Container, Flex } from 'theme-ui'

export const Footer = () => {
  return (
    <>
      <Box
        as='footer'
        sx={{
          bg: 'hinted',
          py: 4,
        }}
      >
        <Container>
          <Flex sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href='#'>TK</Link>
            <Link href='#'>TK</Link>
            <Link href='#'>TK</Link>
          </Flex>
        </Container>
      </Box>
    </>
  )
}
