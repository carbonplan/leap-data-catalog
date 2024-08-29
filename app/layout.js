import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { theme } from '@/styles/theme'
import * as gtag from '@/utils/ga'
import Script from 'next/script'
import { Box, Flex, ThemeUIProvider } from 'theme-ui'
import { Analytics } from './analytics'

export const metadata = {
  title: 'LEAP Data Catalog',
  description:
    'Data catalog for Learning the Earth with Artificial Intelligence and Physics (LEAP) is an NSF Science and Technology Center (STC)',
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: 'https://leap.columbia.edu/wp-content/uploads/2021/11/cropped-favicon-1-1-32x32.png',
    apple:
      'https://leap.columbia.edu/wp-content/uploads/2021/11/cropped-favicon-1-1-180x180.png',
  },
  openGraph: {
    title: 'LEAP Data Catalog',
    description:
      'Data catalog for Learning the Earth with Artificial Intelligence and Physics (LEAP) is an NSF Science and Technology Center (STC)',
    url: 'https://catalog.leap.columbia.edu/',
    siteName: 'LEAP Data Catalog',
    images: [
      {
        url: 'TK', // Replace with your actual image URL
        width: 800,
        height: 600,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LEAP Data Catalog',
    description:
      'Data catalog for Learning the Earth with Artificial Intelligence and Physics (LEAP) is an NSF Science and Technology Center (STC)',
    images: ['TK'], // Replace with your actual image URL
  },
}
export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <head>
        <Script
          strategy='afterInteractive'
          src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
        />
        <Script
          id='gtag-init'
          strategy='afterInteractive'
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gtag.GA_TRACKING_ID}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </head>
      <body>
        <ThemeUIProvider theme={theme}>
          <Flex
            sx={{
              flexDirection: 'column',
              minHeight: '100vh',
            }}
          >
            <Header />
            <Box
              sx={{
                width: '100%',
                flex: '1 1 auto',
              }}
            >
              {children}
            </Box>
            <Footer />
          </Flex>
          <Analytics />
        </ThemeUIProvider>
      </body>
    </html>
  )
}
