// Parse a bucket-style location (s3://bucket/prefix, gs://bucket/prefix).
export function parseBucketLocation(
  location: string,
): { scheme: string; bucket: string; prefix: string } | null {
  const m = location.match(/^(s3|gs):\/\/([^/]+)\/?(.*)$/)
  if (!m) return null
  return { scheme: m[1], bucket: m[2], prefix: m[3].replace(/\/$/, '') }
}
