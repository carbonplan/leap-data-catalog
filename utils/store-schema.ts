import { IcechunkStore } from 'icechunk-js'

export interface ArrayMeta {
  name: string // leaf name for display
  path: string // full store path (for opening the array, may include a group)
  dtype: string
  shape: number[]
  dims: string[]
  chunks?: number[]
  attrs?: Record<string, unknown>
}

export function dimsFromArrays(arrays: ArrayMeta[]): Record<string, number> {
  const dims: Record<string, number> = {}
  for (const a of arrays) {
    a.dims.forEach((d, i) => {
      if (d && dims[d] === undefined && a.shape[i] !== undefined)
        dims[d] = a.shape[i]
    })
  }
  return dims
}

// Open an icechunk store; caller reuses it for both schema and the map layer.
export async function openIcechunkStore(
  httpUrl: string,
  signal?: AbortSignal,
): Promise<IcechunkStore> {
  return IcechunkStore.open(httpUrl, { signal })
}

// Walk an already-open icechunk store. Reads each array node's parsed Zarr v3
// metadata for dtype/shape/chunks/dims/attrs.
export function arraysFromStore(store: IcechunkStore): ArrayMeta[] {
  const arrays: ArrayMeta[] = []

  for (const node of store.listNodes()) {
    if (node.nodeData?.type !== 'array') continue
    const meta = store.getMetadata(node.path) as Record<string, unknown> | null
    if (!meta) continue

    const shape = (meta.shape as number[]) ?? []
    const dn = meta.dimension_names as (string | null)[] | undefined
    const dims = Array.isArray(dn) ? dn.map((d) => d ?? '') : []
    const chunkGrid = meta.chunk_grid as
      | { configuration?: { chunk_shape?: number[] } }
      | undefined

    arrays.push({
      name: node.path.split('/').filter(Boolean).pop() ?? node.path,
      path: node.path.replace(/^\//, ''),
      dtype: String(meta.data_type ?? ''),
      shape,
      dims,
      chunks: chunkGrid?.configuration?.chunk_shape,
      attrs: meta.attributes as Record<string, unknown> | undefined,
    })
  }

  return arrays
}
