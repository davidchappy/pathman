/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@pathman/components", "@pathman/core"],
  output: "export",
  reactStrictMode: true,
  basePath: "pathman"
}

module.exports = nextConfig
