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
  maintainers: Maintainer[]
  provenance: Provenance
  thumbnail: string
  tags?: string[]
  links?: Link[]
  stores: Store[]
  source?: Link
  slug: string
  catalogUrl: string
  color: string
}
