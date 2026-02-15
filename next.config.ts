import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable Cache Components for Next.js 16 (replaces PPR)
  cacheComponents: true,

  // Enable React Compiler for automatic memoization
  // Adds ~10-15s build time but eliminates 25-40% of re-renders
  reactCompiler: true,

  // Optimize package imports to reduce bundle size
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
