import { fillValue } from '@/utils/map'
import { IcechunkStore } from 'icechunk-js'

export interface ArrayMeta {
  name: string
  path: string
  shape: number[]
  dims: string[]
  attrs?: Record<string, unknown>
}

// Reads parsed zarr v3 metadata per array node; avoids getSnapshotMetadata (icechunk-js 0.6.0 flexbuffer bug).
export function arraysFromStore(store: IcechunkStore): ArrayMeta[] {
  const arrays: ArrayMeta[] = []
  for (const node of store.listNodes()) {
    if (node.nodeData?.type !== 'array') continue
    const meta = store.getMetadata(node.path) as Record<string, unknown> | null
    if (!meta) continue
    const dn = meta.dimension_names as (string | null)[] | undefined
    arrays.push({
      name: node.path.split('/').filter(Boolean).pop() ?? node.path,
      path: node.path.replace(/^\//, ''),
      shape: (meta.shape as number[]) ?? [],
      dims: Array.isArray(dn) ? dn.map((d) => d ?? '') : [],
      attrs: meta.attributes as Record<string, unknown> | undefined,
    })
  }
  return arrays
}

/**
 * The store with xarray's `_FillValue` as the zarr fill value: zarr-layer 0.11 masks only the latter when it
 * draws a region, whatever its `fillValue` option says.
 */
export const withFillValues = (store: IcechunkStore): IcechunkStore =>
  new Proxy(store, {
    get(target, prop) {
      const value = Reflect.get(target, prop, target)
      if (typeof value !== 'function') return value
      if (prop !== 'get') return value.bind(target)
      return async (...args: Parameters<IcechunkStore['get']>) => {
        const bytes = await target.get(...args)
        if (!bytes || !args[0].endsWith('zarr.json')) return bytes
        const meta = JSON.parse(new TextDecoder().decode(bytes))
        const fill = fillValue(meta.attributes?._FillValue)
        if (fill === undefined) return bytes
        return new TextEncoder().encode(
          JSON.stringify({ ...meta, fill_value: fill }),
        )
      }
    },
  })
