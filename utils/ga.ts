export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS as string

interface Window {
  gtag: (
    command: 'config' | 'event',
    targetId: string,
    config?: {
      page_path?: string
      event_category?: string
      event_label?: string
      value?: number
    },
  ) => void
}

declare const window: Window

export const pageview = (url: string): void => {
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  })
}

interface EventProps {
  action: string
  category: string
  label: string
  value: number
}

export const event = ({ action, category, label, value }: EventProps): void => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}
