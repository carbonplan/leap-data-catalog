// `?catalog=` is fetched on the server, so only LEAP's OSN buckets are allowed.
const allowedPrefix = 'https://nyu1.osn.mghpcc.org/leap-pangeo-'

export const isAllowedCatalog = (url: string): boolean =>
  URL.canParse(url) && new URL(url).href.startsWith(allowedPrefix)
