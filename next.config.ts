/** @type {import('next').NextConfig} */
const nextConfig = {
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
