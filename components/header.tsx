import { Dimmer } from '@carbonplan/components'
import Link from 'next/link'
import { Box, Container, Flex, Image } from 'theme-ui'

export const Header = () => {
  return (
    <>
      <Box pb={8}>
        <Box
          as='header'
          sx={{
            borderBottom: '1px solid #eee',
            borderColor: 'muted',
            py: 3,
            position: 'fixed',
            top: 0,
            zIndex: 100,
            width: '100%',
            backdropFilter: 'saturate(180%) blur(5px)',
            backgroundColor: 'background',
          }}
        >
          <Container>
            <Flex
              sx={{
                alignItems: 'baseline',
                mx: 'auto',
                justifyContent: 'space-between',
              }}
            >
              <Link href='/'>
                <Image
                  src={'/Leap-Logo-Big.png'}
                  width={120}
                  height={30}
                  alt={'LEAP Logo'}
                  sx={{
                    marginRight: 3,
                  }}
                />
              </Link>
              <Dimmer key='dimmer' sx={{ mt: '-2px', color: 'primary' }} />
            </Flex>
          </Container>
        </Box>
      </Box>
    </>
  )
}
