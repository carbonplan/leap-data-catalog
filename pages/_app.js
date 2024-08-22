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
    const handleHashChange = (e) => {
      const newHash = window.location.hash.slice(1) // Remove the '#' character
      gtag.event({
        action: 'navigate_to_section',
        category: 'Navigation',
        label: newHash,
        value: window.location.pathname,
      })
    }

    // Listen for gtm.historyChange-v2 events
    const handleHistoryChange = (event) => {
      if (
        event.detail &&
        event.detail.event === 'gtm.historyChange-v2' &&
        event.detail.gtm.historyChangeSource === 'hashchange'
      ) {
        const newHash = event.detail.gtm.newUrlFragment
        gtag.event({
          action: 'navigate_to_section',
          category: 'Navigation',
          label: newHash,
          value: window.location.pathname,
        })
      }
    }

    router.events.on('routeChangeComplete', handleRouteChange)
    window.addEventListener('hashchange', handleHashChange)
    window.addEventListener('gtm.historyChange-v2', handleHistoryChange)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
      window.removeEventListener('hashchange', handleHashChange)
      window.removeEventListener('gtm.historyChange-v2', handleHistoryChange)
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
