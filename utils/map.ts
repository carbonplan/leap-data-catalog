const MS: Record<string, number> = {
  nanosecond: 1e-6,
  microsecond: 1e-3,
  millisecond: 1,
  second: 1e3,
  minute: 6e4,
  hour: 36e5,
  day: 864e5,
}
const CALENDARS = ['standard', 'gregorian', 'proleptic_gregorian']

/** ISO dates of a CF time coordinate, or undefined when JavaScript dates cannot express it. */
export const cfDates = (
  values: ArrayLike<number | bigint>,
  units: unknown,
  calendar: unknown = 'standard',
): string[] | undefined => {
  const [, unit, base] = String(units).match(/^(\w+?)s? since (.+)$/) ?? []
  const [, date, time] =
    base?.match(/^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}:\d{2}(?::\d{2})?))?/) ?? []
  const origin = Date.parse(`${date}T${time ?? '00:00'}Z`)
  if (
    !(unit in MS) ||
    Number.isNaN(origin) ||
    !CALENDARS.includes(String(calendar))
  )
    return undefined
  return Array.from(values, (v) => {
    const t = new Date(origin + Number(v) * MS[unit])
    if (Number.isNaN(t.getTime())) return ''
    const iso = t.toISOString()
    return iso.slice(11, 16) === '00:00'
      ? iso.slice(0, 10)
      : iso.slice(0, 16).replace('T', ' ')
  })
}

/** 2nd to 98th percentile of the finite values; undefined when there is no spread. */
export const dataRange = (values: number[]): [number, number] | undefined => {
  const finite = Float64Array.from(values.filter(Number.isFinite)).sort()
  const at = (q: number) => finite[Math.round(q * (finite.length - 1))]
  return at(0.02) < at(0.98) ? [at(0.02), at(0.98)] : undefined
}

// Mercator maps stop at 85 degrees.
export const mapBounds = ([w, s, e, n]: number[]): [
  [number, number],
  [number, number],
] => [
  [w, Math.max(s, -85)],
  [e, Math.min(n, 85)],
]

/** The box shrunk around its centre to hold at most `max` of `cells` grid cells. */
export const sampleBox = (
  [[w, s], [e, n]]: [[number, number], [number, number]],
  cells: number,
  max: number,
): number[][] => {
  const f = Math.min(1, Math.sqrt(max / cells)) / 2
  const [x, y, dx, dy] = [(w + e) / 2, (s + n) / 2, (e - w) * f, (n - s) * f]
  return [
    [x - dx, y - dy],
    [x + dx, y - dy],
    [x + dx, y + dy],
    [x - dx, y + dy],
    [x - dx, y - dy],
  ]
}

/** Missing-data value; xarray writes it to zarr v3 as the base64 of a float64. */
export const fillValue = (attr: unknown): number | undefined => {
  if (typeof attr === 'number') return attr
  if (typeof attr !== 'string' || !/^[A-Za-z0-9+/]{11}=$/.test(attr)) return
  const bytes = Uint8Array.from(atob(attr), (c) => c.charCodeAt(0))
  const value = new DataView(bytes.buffer).getFloat64(0, true)
  return Number.isNaN(value) ? undefined : value
}
