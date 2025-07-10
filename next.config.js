/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['sharp']
  },
  // Increase API timeout for nutrition analysis
  api: {
    responseLimit: false,
    bodyParser: {
      sizeLimit: '1mb',
    },
    // Increase timeout to 5 minutes for complex nutrition analysis
    timeout: 300000,
  },
  // For App Router API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig 