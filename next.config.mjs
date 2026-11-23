/** @type {import('next').NextConfig} */
const nextConfig = {
  // Dev/preview CORS proxy for OSN; see utils/store-url.ts.
  async rewrites() {
    return [
      { source: '/osn/:path*', destination: 'https://nyu1.osn.mghpcc.org/:path*' },
    ]
  },
}

export default nextConfig
