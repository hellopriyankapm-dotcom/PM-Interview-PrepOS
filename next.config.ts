import type { NextConfig } from "next";

const customDomain = "pmprepos.com";
const deployedOrigin = `https://${customDomain}`;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: "",
    NEXT_PUBLIC_DEPLOYED_ORIGIN: deployedOrigin
  }
};

export default nextConfig;
