import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Externalize packages that have build issues with Turbopack
  serverExternalPackages: [
    'pdf-parse',
    '@browserbasehq/stagehand',
    'pino',
    'pino-pretty',
    'thread-stream',
    'playwright',
    'playwright-core',
  ],

  // Set the workspace root to silence the multiple lockfiles warning
  outputFileTracingRoot: require('path').join(__dirname),
};

export default nextConfig;
