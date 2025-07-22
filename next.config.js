/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['sharp']
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.googletagmanager.com *.google-analytics.com *.googlesyndication.com *.googleadservices.com; frame-src 'self' *.googlesyndication.com *.googletagmanager.com;"
          },
        ],
      },
    ]
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude server-only modules from client bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        undici: false,
      };
    }
    
    // Handle undici properly
    config.externals = config.externals || [];
    config.externals.push({
      undici: 'undici'
    });
    
    return config;
  },
}

module.exports = nextConfig 