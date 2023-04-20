import { Column, Link, Row } from '@carbonplan/components'
import { Box, Container } from 'theme-ui'

export const Footer = () => {
  return (
    <>
      <Box mt={3}>
        <Box
          as='footer'
          sx={{
            bg: 'hinted',
            py: 4,
          }}
        >
          <Container>
            <Row>
              <Column start={1} width={2}>
                © 2023
              </Column>
              <Column start={3} width={2}>
                <Link href='https://leap.columbia.edu'>About LEAP</Link>
              </Column>
            </Row>
          </Container>
        </Box>
      </Box>
    </>
  )
}
