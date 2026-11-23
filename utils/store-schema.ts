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
