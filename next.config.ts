import type { NextConfig } from "next";

// @ts-expect-error - next-pwa types are not available
import withPWA from 'next-pwa';

const nextConfig: NextConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})({
  // Image optimization
  images: {
    unoptimized: false,
  },
  
  // Disable x-powered-by header
  poweredByHeader: false,
  
  // Remove trailingSlash for better web routing
  trailingSlash: false,
});

export default nextConfig;
