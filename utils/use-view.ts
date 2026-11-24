import { formatView, parseView, type View } from '@/utils/listing'
import { useMemo, useSyncExternalStore } from 'react'

// The url query is the state. It is read here, not with useSearchParams, so the cards stay in the static HTML.
let current: string | undefined
const listeners = new Set<() => void>()

const set = (search: string | undefined) => {
  current = search
  listeners.forEach((listener) => listener())
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
    current = undefined
  }
}

export const syncView = () => set(undefined)

const writeView = (view: View) => {
  const search = formatView(view)
  try {
    window.history.replaceState(null, '', window.location.pathname + search)
  } catch {
    // Safari limits how often the url can change; the next edit writes it.
  }
  set(search)
}

export const useView = () => {
  const search = useSyncExternalStore(
    subscribe,
    () => current ?? window.location.search,
    () => '',
  )
  const view = useMemo(() => parseView(search), [search])
  const update = (patch: Partial<View>) => writeView({ ...view, ...patch })
  return [view, update] as const
}

// The detail page opened from the list in this tab, so its Back button can restore the list.
let opened = ''
export const markOpened = (path: string) => {
  opened = path
}
export const openedFromList = (path: string) => opened === path
