/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'cdn.shopify.com',
      'bs.plantnet.org',
      'bs.floristic.org'
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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