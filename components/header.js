import { Link } from '@carbonplan/components'
import Image from 'next/image'
import { Box, Container, Flex } from 'theme-ui'
export const Header = () => {
  return (
    <>
      <Box
        as='header'
        sx={{
          bg: 'white',
          borderBottom: '1px solid #eee',
          borderColor: 'muted',
          py: 3,
        }}
      >
        <Container>
          <Flex
            sx={{
              alignItems: 'baseline',
              mx: 'auto',
            }}
          >
            <Link href='/'>
              <Image
                src='/Leap-Logo-Big.png'
                width={120}
                height={30}
                alt={'LEAP Logo'}
              />
            </Link>
          </Flex>
        </Container>
      </Box>
    </>
  )
}
