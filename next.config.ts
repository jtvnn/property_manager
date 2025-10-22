import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for Electron environment
  output: 'standalone',
  
  // Image optimization for Electron
  images: {
    unoptimized: true,
  },
  
  // Disable x-powered-by header
  poweredByHeader: false,
  
  // Don't use asset prefix for API routes - only for static assets
  trailingSlash: true,
  
  // Configure webpack for Electron (only when not using Turbopack)
  webpack: (config, { isServer }) => {
    // Only apply Electron-specific webpack config in production
    if (process.env.NODE_ENV === 'production' && !isServer) {
      config.target = 'electron-renderer';
    }
    
    return config;
  },
};

export default nextConfig;
