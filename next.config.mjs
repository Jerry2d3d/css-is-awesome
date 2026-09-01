import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// When deploying to GitHub Pages under <user>.github.io/<repo>/, the workflow
// sets NEXT_BASE_PATH=/<repo>. Empty in dev / preview / custom-domain builds.
const basePath = process.env.NEXT_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // NOTE: `next dev` and `next build` share .next. Running a build while a dev
  // server is up rips chunks out from under it — symptoms are "Cannot find
  // module './<n>.js'" and "__webpack_modules__[moduleId] is not a function".
  // The cure is: stop dev, `rm -rf .next`, restart. Do not try to dodge this
  // with a custom `distDir` — under `output: "export"` that redirects the
  // exported site away from out/ and breaks the Playwright webServer.
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
    // Next 16 compiles Sass through the modern API, which reads `loadPaths`;
    // `includePaths` stays for the legacy API so a rollback keeps working.
    includePaths: [path.resolve(__dirname, "scss")],
    loadPaths: [path.resolve(__dirname, "scss")],
  },
};

export default nextConfig;
