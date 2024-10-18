import { Column, Row } from '@carbonplan/components'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from 'theme-ui'

export const Header = () => {
  return (
    <Container
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
      <Row>
        <Column start={[1, 1, 2, 2]}>
          <Link href='/'>
            <Image
              src={'/Leap-Logo-Big.png'}
              width={120}
              height={30}
              alt={'LEAP Logo'}
            />
          </Link>
        </Column>
      </Row>
    </Container>
  )
}
