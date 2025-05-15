/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    domains: [
      'images.unsplash.com',
      'cdn.shopify.com',
      'bs.plantnet.org',
      'bs.floristic.org',
      'tpsplantfoods.com',
      'd1r0u82cgzm46l.cloudfront.net'
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    unoptimized: true,
  },
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig 