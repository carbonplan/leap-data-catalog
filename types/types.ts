export type StoreFormat = 'icechunk' | 'zarr' | 'csv'

export interface StorageConfig {
  type?: string
  bucket?: string
  prefix?: string
  region?: string
  // S3-compatible endpoint (e.g. OSN); unset for AWS/GCS.
  endpoint?: string
}

export interface Variable {
  name: string
  long_name?: string | null
  units?: string | null
  dims: string[]
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
  // Bucket allows browser reads (CORS); false blocks the map viewer.
  cors?: boolean
  mapPreview?: boolean
  variables?: Variable[]
  spatialResolution?: string
  timeResolution?: string
  // ISO datetimes; end unset = ongoing or unknown.
  start?: string
  end?: string
  // [xMin, yMin, xMax, yMax]
  bbox?: [number, number, number, number]
  last_updated?: string
  // Original catalog location (e.g. s3://bucket/prefix), pre-HTTP-resolution.
  location?: string
  storageConfig?: StorageConfig
  // Multiscale pyramid (topozarr) used by the map viewer instead of `url`.
  vizUrl?: string
  // Zarr group within the store holding this dataset (e.g. 'climatology/monthly').
  group?: string
  // Virtual icechunk store (chunks in external files); not browser-readable.
  virtual?: boolean
  // Uncompressed size, from shape x dtype.
  nbytes?: number
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
  // One-line summary for cards; `description` is the long form.
  summary?: string
  source: 'leap' | 'dynamical'
  // Facets, from the catalog's controlled vocabularies.
  domain: string[]
  kind: string[]
  coverage?: 'global' | 'regional'
  spatialDomain?: string
  spatialResolution?: string
  timeResolution?: string
  start?: string
  end?: string
  nVariables: number
  // At least one store can open in the map viewer.
  mapPreview: boolean
  // Sum of store sizes (uncompressed); undefined when unknown.
  nbytes?: number
  featured: boolean
}
