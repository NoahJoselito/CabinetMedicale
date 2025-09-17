/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignore ESLint errors during production builds to unblock deploys
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://medicale.unityfianar.site/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig
