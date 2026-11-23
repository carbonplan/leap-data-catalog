import { Feedstock } from '@/types/types'

// Years before 1800 are model calendar years (e.g. control runs), not real dates.
const year = (iso: string) => Number(iso.slice(0, iso.indexOf('-', 1)))

// "0.0562 degrees" -> "0.056° (~6km)"; strips GEFS-style "0-240 hours: " lead-time prefixes.
export const formatResolution = (res?: string) =>
  res
    ?.replace(/ degrees/g, '°')
    .replace(/\d+-\d+ hours: /g, '')
    .replace(/, (?=\d)/g, ' / ')
    .replace(/^(\d*\.\d{3,})°$/, (_, d) => {
      const deg = Number(d)
      return `${Number(deg.toPrecision(2))}° (~${Math.round(deg * 111)}km)`
    })

// "3d" -> "3-day", "12h" -> "12-hourly", "0.333333h" -> "20-min"; words pass through.
export const formatTimeStep = (step?: string) => {
  const m = step?.match(/^([\d.]+)([hd])$/)
  if (!m) return step
  const n = Number(m[1])
  if (m[2] === 'd') return n === 1 ? 'daily' : `${n}-day`
  if (n < 1) return `${Math.round(n * 60)}-min`
  return n === 1 ? 'hourly' : `${n}-hourly`
}

export const formatTimeRange = (start?: string, end?: string) => {
  if (!start) return undefined
  const a = year(start)
  if (!end) return `${a}-present`
  const b = year(end)
  const range = a === b ? String(a) : `${a}-${b}`
  return a < 1800 ? `model yr ${range}` : range
}

export const formatCoverage = (
  f: Pick<Feedstock, 'spatialDomain' | 'coverage'>,
) => {
  const c = f.spatialDomain ?? f.coverage
  return c && c[0].toUpperCase() + c.slice(1)
}

export const formatVars = (n?: number) =>
  n ? `${n} ${n === 1 ? 'var' : 'vars'}` : undefined

// Rough decimal size: 1.1e13 -> "~11 TB".
export const formatBytes = (n?: number) => {
  if (!n) return undefined
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.min(Math.floor(Math.log10(n) / 3), units.length - 1)
  return `~${Number((n / 1000 ** i).toPrecision(2))} ${units[i]}`
}

export const formatMeta = (f: Feedstock) =>
  [
    formatResolution(f.spatialResolution),
    formatTimeStep(f.timeResolution),
    formatTimeRange(f.start, f.end),
    formatVars(f.nVariables),
    formatBytes(f.nbytes),
  ]
    .filter(Boolean)
    .join(' · ')
