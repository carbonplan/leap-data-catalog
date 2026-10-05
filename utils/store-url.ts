// Parse a bucket-style location (s3://bucket/prefix, gs://bucket/prefix).
export function parseBucketLocation(
  location: string,
): { scheme: string; bucket: string; prefix: string } | null {
  const m = location.match(/^(s3|gs):\/\/([^/]+)\/?(.*)$/)
  if (!m) return null
  return { scheme: m[1], bucket: m[2], prefix: m[3].replace(/\/$/, '') }
}

// Resolve a basal entry's data store location to a browser-fetchable HTTPS URL.
// Already-HTTP locations pass through; s3:// is resolved via storage_config.
export function toHttpUrl(
  location: string,
  storageConfig?: Record<string, unknown>,
): string | null {
  if (/^https?:\/\//.test(location)) return location.replace(/\/$/, '')

  const cfg = storageConfig
  if (!cfg || cfg.type !== 's3') return null
  const bucket = cfg.bucket as string
  const region = (cfg.region as string) || 'us-east-1'
  // Prefer the stored prefix; fall back to parsing it out of the location.
  const prefix = (
    typeof cfg.prefix === 'string'
      ? cfg.prefix
      : (parseBucketLocation(location)?.prefix ?? '')
  ).replace(/\/$/, '')

  // source.coop is not AWS: its buckets resolve via the data.source.coop gateway,
  // where the path is just the prefix (the bucket name is not part of the URL).
  if (bucket.includes('source.coop')) {
    return `https://data.source.coop/${prefix}`
  }
  // Path-style for dotted buckets (TLS cert constraint), else virtual-hosted.
  if (bucket.includes('.')) {
    return `https://s3.${region}.amazonaws.com/${bucket}/${prefix}`
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${prefix}`
}
