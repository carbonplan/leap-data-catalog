import Providers from '@/app/providers'
import PageCard from '@/components/layouts/page-card'
import { Metadata } from 'next'

import { GoogleAnalytics } from '@next/third-parties/google'

export const metadata: Metadata = {
  title: 'LEAP Data Catalog',
  description: 'Explore and discover datasets from the LEAP project',
  icons: {
    icon: [
      {
        url: 'https://leap.columbia.edu/wp-content/uploads/2021/11/cropped-favicon-1-1-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: 'https://leap.columbia.edu/wp-content/uploads/2021/11/cropped-favicon-1-1-180x180.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    apple:
      'https://leap.columbia.edu/wp-content/uploads/2021/11/cropped-favicon-1-1-180x180.png',
  },
  openGraph: {
    title: 'LEAP Data Catalog',
    description:
      'Explore and discover datasets from the the Earth with Artificial Intelligence and Physics (LEAP) project.',
    url: 'https://catalog.leap.columbia.edu/',
    siteName: 'LEAP Data Catalog',
    images: [
      {
        url: 'https://leap.columbia.edu/wp-content/uploads/2023/08/NSF-LEAP-joint-logo.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LEAP Data Catalog',
    description: 'Explore and discover datasets from the LEAP project',
    images: [
      'https://leap.columbia.edu/wp-content/uploads/2023/08/NSF-LEAP-joint-logo.png',
    ],
  },
  formatDetection: {
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <body>
        <Providers>
          <PageCard>{children}</PageCard>
        </Providers>
      </body>

      <GoogleAnalytics gaId='G-P57XQ0ETNC' />
    </html>
  )
}
