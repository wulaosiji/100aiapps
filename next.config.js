/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['xlsx'],
  webpack: (config, { isServer }) => {
    // 确保xlsx包正确处理
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      stream: false,
      path: false,
    };
    
    return config;
  },
};

module.exports = nextConfig; 