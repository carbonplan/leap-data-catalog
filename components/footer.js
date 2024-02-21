import Logo from '@/public/Leap-Logo-Big.png'
import NSFLogo from '@/public/NSF.svg'
import Image from 'next/image'
import { FaGithub, FaGlobe, FaTwitter, FaYoutube } from 'react-icons/fa'
import { Box, Container, Flex, IconButton, Link, Text } from 'theme-ui'

export const Footer = () => {
  return (
    <Box as='footer' sx={{ bg: 'hinted', py: 4 }}>
      <Container>
        <Flex
          sx={{
            flexDirection: ['column', 'row'],
            justifyContent: 'space-between',
            alignItems: 'center',
            textAlign: ['center', 'left'],
          }}
        >
          <Link
            href='https://leap.columbia.edu/'
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              flexGrow: [1, 0],
              mb: [3, 0],
            }}
          >
            <Flex sx={{ alignItems: 'center' }}>
              <Image src={NSFLogo} height={48} width={48} alt='NSF Logo' />
              {/* Vertical divider */}
              <Box
                sx={{
                  mx: 2, // adjusts the spacing around the divider
                  height: '30px', // match the height with the logo height or as desired
                  width: '1px', // the width of the divider line
                  bg: 'primary', // the color of the line
                }}
              />
              <Image src={Logo} width={120} height={30} alt='LEAP Logo' />
            </Flex>
          </Link>
          <Text sx={{ mb: [3, 0], flexGrow: [1, 0] }}>
            © {new Date().getFullYear()}, LEAP-STC. MIT Licensed.
          </Text>
          <Flex
            sx={{
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: 'center',
              flexGrow: [1, 0],
              mb: [3, 0],
            }}
          >
            <IconButton
              as='a'
              href='https://twitter.com/LeapStc'
              sx={{ mx: 2 }}
            >
              <FaTwitter size={24} />
            </IconButton>
            <IconButton
              as='a'
              href='https://github.com/leap-stc'
              sx={{ mx: 2 }}
            >
              <FaGithub size={24} />
            </IconButton>
            <IconButton
              as='a'
              href='https://www.youtube.com/@LEAP_STC'
              sx={{ mx: 2 }}
            >
              <FaYoutube size={24} />
            </IconButton>
            <IconButton as='a' href='https://leap.columbia.edu/' sx={{ mx: 2 }}>
              <FaGlobe size={24} />
            </IconButton>
          </Flex>
        </Flex>
      </Container>
    </Box>
  )
}
