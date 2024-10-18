import { GitSHA } from '@/components/git-sha'
import { Column, Row } from '@carbonplan/components'
import Image from 'next/image'
import Link from 'next/link'
import { FaGithub, FaGlobe, FaTwitter, FaYoutube } from 'react-icons/fa'
import { Box, Container, Flex, IconButton, Text } from 'theme-ui'

export const Footer = () => {
  return (
    <Container as='footer' sx={{ bg: 'hinted', py: 4, mt: 4 }}>
      <Row>
        <Column start={[1, 1, 2, 2]} width={[3, 3, 3, 3]}>
          <Link
            href='https://leap.columbia.edu/'
            style={{
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            <Flex sx={{ alignItems: 'center' }}>
              <Image src={'/nsf.png'} height={36} width={36} alt='NSF Logo' />
              {/* Vertical divider */}
              <Box
                sx={{
                  mx: 2, // adjusts the spacing around the divider
                  height: '30px', // match the height with the logo height or as desired
                  width: '1px',
                  bg: '#6e6e6e',
                }}
              />
              <Image
                src={'/Leap-Logo-Big.png'}
                width={120}
                height={30}
                alt='LEAP Logo'
              />
            </Flex>
          </Link>
        </Column>
        <Column start={[1, 5, 7, 7]} width={[6, 4, 5, 5]}>
          <Box sx={{ mt: [3, 0, 0, 0] }}>
            <Text>© {new Date().getFullYear()}, LEAP-STC. MIT Licensed.</Text>
            <GitSHA />
          </Box>

          <Box sx={{ mt: [3] }}>
            <IconButton
              as='a'
              // @ts-ignore
              href='https://twitter.com/LeapStc'
              // sx={{ mx: 2 }}
            >
              <FaTwitter size={24} />
            </IconButton>
            <IconButton
              as='a'
              // @ts-ignore
              href='https://github.com/leap-stc'
              sx={{ mx: 2 }}
            >
              <FaGithub size={24} />
            </IconButton>
            <IconButton
              as='a'
              // @ts-ignore
              href='https://www.youtube.com/@LEAP_STC'
              sx={{ mx: 2 }}
            >
              <FaYoutube size={24} />
            </IconButton>

            <IconButton
              as='a'
              // @ts-ignore
              href='https://leap.columbia.edu/'
              sx={{ mx: 2 }}
            >
              <FaGlobe size={24} />
            </IconButton>
          </Box>
        </Column>
      </Row>
    </Container>
  )
}
