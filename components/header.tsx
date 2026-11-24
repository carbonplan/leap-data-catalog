/** @jsxImportSource theme-ui */
import { wrapSx } from '@/components/styles'
import Image from 'next/image'
import Link from 'next/link'

const linkSx = { color: 'text', ':hover': { color: 'secondary' } }

export const Header = () => {
  return (
    <header sx={{ borderBottom: '1px solid', borderColor: 'line' }}>
      <div
        sx={{
          ...wrapSx,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 3,
          py: '14px',
        }}
      >
        <Link href='/'>
          <Image
            src={'/Leap-Logo-Big.png'}
            width={120}
            height={27}
            alt={'LEAP Data Catalog home'}
            sx={{ display: 'block' }}
          />
        </Link>
        <nav
          aria-label='Site'
          sx={{ display: 'flex', gap: '20px', fontSize: 1 }}
        >
          <Link href='/' sx={linkSx}>
            Datasets
          </Link>
          <a href='https://leap.columbia.edu/' sx={linkSx}>
            About LEAP
          </a>
        </nav>
      </div>
    </header>
  )
}
