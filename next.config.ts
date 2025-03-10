import { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // 移除output: 'export'，因为它会禁用服务器端功能
  // output: 'export',
  
  // 添加以下配置以帮助解决水合问题
  reactStrictMode: false,
  
  // 增加缓存时间，减少重新渲染频率
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 5,
  },
}

export default nextConfig
