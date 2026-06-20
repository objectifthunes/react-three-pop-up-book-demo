import type { NextConfig } from "next";

const isCI = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  basePath: isCI ? "/react-three-pop-up-book-demo" : undefined,
  assetPrefix: isCI ? "/react-three-pop-up-book-demo/" : undefined,
  trailingSlash: true,
  // StrictMode double-invokes effects in dev, which churns the live book's
  // managed resources (a dev-only artifact). Production is unaffected.
  reactStrictMode: false,
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
