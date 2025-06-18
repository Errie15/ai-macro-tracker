/** @type {import('next').NextConfig} */
const nextConfig = {
  // App directory är nu standard i Next.js 14
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
    
    // Completely ignore undici in client-side builds
    config.externals = config.externals || [];
    config.externals.push({
      undici: 'undici'
    });
    
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['undici'],
  },
}

module.exports = nextConfig 