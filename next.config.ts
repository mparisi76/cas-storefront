import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Vercel's CPU & bandwidth-heavy image proxy
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Ensure static assets and JS bundles are cached aggressively at the edge
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;