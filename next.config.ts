import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: true,
  staticPageGenerationTimeout: 300,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
