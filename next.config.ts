import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const repoName = "PM-Interview-PrepOS";
const basePath = isGitHubPages ? `/${repoName}` : "";
const deployedOrigin = isGitHubPages ? "https://hellopriyankapm-dotcom.github.io" : "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: basePath || undefined,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_DEPLOYED_ORIGIN: deployedOrigin
  }
};

export default nextConfig;
