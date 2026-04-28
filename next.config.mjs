import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// When deploying to GitHub Pages under <user>.github.io/<repo>/, the workflow
// sets NEXT_BASE_PATH=/<repo>. Empty in dev / preview / custom-domain builds.
const basePath = process.env.NEXT_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export so the docs site can deploy to any static host.
  // The theme-swap mechanism (runtime <link> swap) is pure CSS + client JS,
  // so SSG is perfectly compatible.
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  // Expose basePath to client code so raw <link>/<a> hrefs and fetch()
  // calls into public/ can prefix themselves. (next/link prefixes routes
  // automatically, but assets in public/ are user-managed.)
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
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
