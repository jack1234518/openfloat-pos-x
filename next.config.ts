import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel optimizes this automatically
  output: 'standalone',
  
  // Enable React strict mode
  reactStrictMode: true,
  
  // Images configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.unsplash.com',
      },
    ],
  },
  
  // Environment variables that will be available at build time
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    DATABASE_URL: process.env.DATABASE_URL,
  },
};

export default nextConfig;