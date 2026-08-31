import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Generates a lightweight production build (~100MB)
  // Disable Vercel's CPU & bandwidth-heavy image proxy
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.catskillas.com',
          },
        ],
        destination: 'https://catskillas.com/:path*',
        permanent: true,
      },
    ];
  },
  // ensure static assets and JS bundles are cached aggressively at the edge
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