import { Meta } from '@/components/meta'
import Logo from '@/public/Leap-Logo-Big.png'
import { Dimmer } from '@carbonplan/components'
import Image from 'next/image'
import Link from 'next/link'
import { Box, Container, Flex } from 'theme-ui'
export const Header = () => {
  return (
    <>
      <Meta
        card={'TK'}
        description={
          'Data catalog for Learning the Earth with Artificial Intelligence and Physics (LEAP) is an NSF Science and Technology Center (STC)'
        }
        title={'LEAP Data Catalog'}
      />
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
                  src={Logo}
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
