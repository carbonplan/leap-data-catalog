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
        value: pathname,
      })
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [pathname])

  return null
}
