import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove Electron-specific configurations for Vercel deployment
  
  // Image optimization
  images: {
    unoptimized: false, // Enable optimization for web deployment
  },
  
  // Disable x-powered-by header
  poweredByHeader: false,
  
  // Remove trailingSlash for better web routing
  trailingSlash: false,
  
  // Standard webpack config for web deployment
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;
