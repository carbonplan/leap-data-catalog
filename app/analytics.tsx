'use client'

import * as gtag from '@/utils/ga'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const url = pathname + searchParams.toString()
    gtag.pageview(url)
  }, [pathname, searchParams])

  useEffect(() => {
    const handleHashChange = () => {
      const newHash = window.location.hash.slice(1)
      gtag.event({
        action: 'navigate_to_section',
        category: 'Navigation',
        label: newHash,
        value: window.location.pathname,
      })
    }

    const handleHistoryChange = (event: any) => {
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

    window.addEventListener('hashchange', handleHashChange)
    window.addEventListener(
      'gtm.historyChange-v2',
      handleHistoryChange as EventListener,
    )

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
      window.removeEventListener(
        'gtm.historyChange-v2',
        handleHistoryChange as EventListener,
      )
    }
  }, [])

  return null
}
