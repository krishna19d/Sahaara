import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['storage.googleapis.com', 'firebasestorage.googleapis.com'],
    unoptimized: true, // Required for static export
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'export', // Enable static export for Firebase hosting
  trailingSlash: true,
  distDir: 'out', // Output directory for static export
};

export default nextConfig;
