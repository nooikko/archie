import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable Cache Components for Next.js 16 (replaces PPR)
  cacheComponents: true,

  // Optional: Enable React Compiler for automatic memoization
  // Adds build time but eliminates need for manual React.memo
  // reactCompiler: true,
};

export default nextConfig;
