import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "100MB",
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.freepik.com",
      },
      {
        protocol: "https",
        hostname: "sgp.cloud.appwrite.io", // ✅ FIX
        pathname: "/v1/storage/**",        // ✅ IMPORTANT
      },
    ],
  },
};

export default nextConfig;
 