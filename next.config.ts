import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable Cache Components for Next.js 16 (replaces PPR)
  cacheComponents: true,

  // Optimize package imports to reduce bundle size
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
