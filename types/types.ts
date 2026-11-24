export interface Store {
  id: string
  name?: string
  url: string
  nativeUrl?: string
  format?: 'zarr' | 'icechunk'
  group?: string
  virtual?: boolean
  viewer?: boolean
}

export interface Link {
  label: string
  url: string
}

export interface LicenseLink {
  title: string
  url?: string
}

export interface Maintainer {
  name: string
  github?: string
}

export interface Provider {
  name: string
  description?: string
  roles?: string[]
  url?: string
}

export interface Provenance {
  providers: Provider[]
  license: string
  license_link?: LicenseLink
}

export interface Feedstock {
  title: string
  summary: string
  description: string
  origin: string
  featured?: number
  modelName?: string
  coverage?: string
  spatialDomain?: string
  spatialResolution?: string
  timeResolution?: string
  /** ISO strings; unset when the dates are unknown. */
  start?: string
  end?: string
  ongoing: boolean
  /** west, south, east, north */
  bbox: [number, number, number, number]
  provenance: Provenance
  thumbnail: string
  tags?: string[]
  stores: Store[]
  slug: string
  catalogUrl: string
  color: string
}

export interface Cube {
  'cube:dimensions': Record<
    string,
    {
      type: string
      extent?: [string | number | null, string | number | null]
      values?: (string | number)[]
      size?: number
      unit?: string
    }
  >
  'cube:variables': Record<
    string,
    {
      dimensions: string[]
      unit?: string
      long_name?: string
      comment?: string
    }
  >
}

/** Adds what only the dataset's own page shows, so the list page does not carry it. */
export interface FeedstockDetail extends Feedstock {
  /** By store id. */
  cubes: Record<string, Cube>
  attribution?: string
  version?: string
  maintainers: Maintainer[]
  citations: Link[]
  docs: Link[]
  examples: Link[]
  source?: Link
  /** Other datasets of the same model. */
  related: Feedstock[]
}
