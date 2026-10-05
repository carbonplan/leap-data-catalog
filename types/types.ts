export type StoreFormat = 'icechunk' | 'zarr' | 'csv'

export interface StorageConfig {
  type?: string
  bucket?: string
  prefix?: string
  region?: string
  // S3-compatible endpoint (e.g. OSN); unset for AWS/GCS.
  endpoint?: string
}

export interface Store {
  id: string
  name?: string
  // Location of the data store (icechunk repo URL, zarr store URL, or csv URL).
  url: string
  format: StoreFormat
  // Source feedstock this dataset came from (repo URL or slug).
  feedstock?: string
  public?: boolean
  geospatial?: boolean
  variables?: string[]
  // [xMin, yMin, xMax, yMax]
  bbox?: [number, number, number, number]
  last_updated?: string
  // Original catalog location (e.g. s3://bucket/prefix), pre-HTTP-resolution.
  location?: string
  storageConfig?: StorageConfig
  // Multiscale pyramid (topozarr) used by the map viewer instead of `url`.
  vizUrl?: string
  // Virtual icechunk store (chunks in external files); not browser-readable.
  virtual?: boolean
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
  description: string
  maintainers: Maintainer[]
  provenance: Provenance
  thumbnail: string
  tags?: string[]
  links?: Link[]
  stores?: Store[]
  // Link back to the source feedstock repository.
  feedstock?: string
  slug: string
  color: string
}
