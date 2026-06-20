import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-hosted Docker deployment: emit a minimal standalone server bundle.
  output: "standalone",
};

export default nextConfig;
