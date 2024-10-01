export interface Store {
  id: string
  name?: string
  url: string
  rechunking?: { [key: string]: string }[]
  public?: boolean
  geospatial?: boolean
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
  meta_yaml_url?: string
  'ncviewjs:meta_yaml_url'?: string
  slug: string
  color: string
}
