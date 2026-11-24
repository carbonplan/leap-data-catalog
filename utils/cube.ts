import type { Cube } from '@/types/types'

const isTime = (type: string) => type === 'temporal'

const bound = (value: string | number | null, type: string): string => {
  if (value === null) return isTime(type) ? 'present' : ''
  if (typeof value === 'number') return String(Number(value.toPrecision(7)))
  return value.replace(/T00:00:00Z$/, '').replace(/(T\d\d:\d\d):\d\dZ$/, '$1')
}

export interface DimensionRow {
  name: string
  size: string
  from: string
  to: string
  unit: string
}

export const dimensionRows = (cube: Cube): DimensionRow[] =>
  Object.entries(cube['cube:dimensions']).map(([name, d]) => {
    const [from, to] = d.extent ?? [
      d.values?.[0] ?? null,
      d.values?.at(-1) ?? null,
    ]
    return {
      name,
      size: d.size === undefined ? '' : String(d.size),
      from: bound(from, d.type),
      to: bound(to, d.type),
      // A time unit such as "seconds since 1970" describes the encoding, not the dates shown.
      unit: isTime(d.type) ? '' : (d.unit ?? ''),
    }
  })

export interface VariableRow {
  name: string
  label: string
  unit: string
  dimensions: string[]
}

export const variableRows = (cube: Cube, query = ''): VariableRow[] => {
  const q = query.trim().toLowerCase()
  return Object.entries(cube['cube:variables'])
    .map(([name, v]) => ({
      name,
      label: [v.long_name, v.comment !== 'none' && v.comment]
        .filter(Boolean)
        .join('. '),
      unit: v.unit ?? '',
      dimensions: v.dimensions,
    }))
    .filter((v) => `${v.name} ${v.label}`.toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name, 'en'))
}
