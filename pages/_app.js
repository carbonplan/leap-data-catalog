import { theme } from '@/styles/theme'
import * as gtag from '@/utils/ga'
import { useRouter } from 'next/router'
import Script from 'next/script'
import { useEffect } from 'react'
import { ThemeUIProvider } from 'theme-ui'

export default function App({ Component, pageProps }) {
  const router = useRouter()
  useEffect(() => {
    const handleRouteChange = (url) => {
      gtag.pageview(url)
    }
    const handleHashChange = (url) => {
      const [pathname, hash] = url.split('#')
      gtag.event({
        action: 'navigate_to_section',
        category: 'Navigation',
        label: hash,
        value: pathname,
      })
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    router.events.on('hashChangeComplete', handleHashChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
      router.events.off('hashChangeComplete', handleHashChange)
    }
  }, [router.events])
  return (
    <ThemeUIProvider theme={theme}>
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
      <Component {...pageProps} />
    </ThemeUIProvider>
  )
}
