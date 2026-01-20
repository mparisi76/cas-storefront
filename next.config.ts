import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Increase the limit for Server Actions here
    },
  },
};

export default nextConfig;
