/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export so the docs site can deploy to any static host.
  // The theme-swap mechanism (runtime <link> swap) is pure CSS + client JS,
  // so SSG is perfectly compatible.
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
};

export default nextConfig;
