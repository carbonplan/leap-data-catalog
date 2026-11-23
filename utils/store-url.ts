const OSN = 'https://nyu1.osn.mghpcc.org/'

// OSN only allows browser reads from the production origin; elsewhere go through the /osn rewrite in next.config.mjs.
export function browserUrl(url: string): string {
  if (window.location.origin === 'https://catalog.leap.columbia.edu') return url
  return url.startsWith(OSN) ? `/osn/${url.slice(OSN.length)}` : url
}
