import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
  // Expose the design-system library's SCSS source to any module.scss
  // in the app. Components can write `@use 'mixins' as m;` directly.
  sassOptions: {
    includePaths: [path.resolve(__dirname, "scss")],
  },
};

export default nextConfig;
