import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      'pdf-parse',
      '@browserbasehq/stagehand',
      'pino',
      'pino-pretty',
      'thread-stream',
      'playwright',
      'playwright-core',
    ],
  },
};

export default nextConfig;
