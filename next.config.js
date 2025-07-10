/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['sharp']
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