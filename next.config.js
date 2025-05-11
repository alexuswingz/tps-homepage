/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'cdn.shopify.com',
      'bs.plantnet.org',
      'bs.floristic.org'
    ],
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'export',
  tracing: {
    ignoreRootSpans: true,
  }
}

module.exports = nextConfig 