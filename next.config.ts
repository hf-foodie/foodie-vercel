import type { NextConfig } from 'next'
const nextConfig: NextConfig = {
  reactCompiler: true,
  images: { unoptimized: true },
  async headers() {
    return [{ source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }]
  },
}
export default nextConfig
