/// <reference lib="webworker" />
// ============================================================================
// Playground compile worker.
// ============================================================================
// Runs dart-sass's pure-JS build (`sass` resolves to sass.default.js under
// the bundler's browser conditions — the package's `exports` map has a
// `node` branch and a `default` branch, and a worker bundle takes `default`)
// off the main thread, so typing never janks. The `sass` package is only
// ever imported here, and this file is only reachable from /playground, so
// no other page pays its ~1 MB.
//
// `@use 'css-is-awesome/api' as cia` resolves through the scss map the build
// emits (public/playground/scss-map.json) and the pure resolver in
// src/lib/playground/resolve.ts — the same code path
// scripts/verify-playground-compile.mjs exercises in Node.
// ============================================================================
import { resolveCiaUse, toCanonical, fromCanonical } from "@/lib/playground/resolve";

export type CompileRequest = { id: number; scss: string };
export type CompileResponse =
  | { id: number; css: string; ms: number }
  | { id: number; error: { message: string; line: number | null; column: number | null } };
type InitMessage = { mapUrl: string };

type SassModule = typeof import("sass");

let sassPromise: Promise<SassModule> | null = null;
let mapPromise: Promise<Record<string, string>> | null = null;

function loadSass(): Promise<SassModule> {
  // Dynamic import so the worker boots instantly and the ~1 MB compiler
  // streams in while the page is still laying out.
  sassPromise ??= import("sass");
  return sassPromise;
}

function loadMap(url: string): Promise<Record<string, string>> {
  mapPromise ??= fetch(url).then((r) => {
    if (!r.ok) throw new Error(`scss map fetch failed: ${r.status}`);
    return r.json() as Promise<Record<string, string>>;
  });
  return mapPromise;
}

function makeImporter(map: Record<string, string>) {
  const has = (key: string) => Object.prototype.hasOwnProperty.call(map, key);
  return {
    canonicalize(url: string, ctx: { containingUrl: URL | null }): URL | null {
      const containing = ctx.containingUrl ? fromCanonical(ctx.containingUrl.href) : null;
      const key = resolveCiaUse(url, containing, has);
      return key ? new URL(toCanonical(key)) : null;
    },
    load(canonical: URL): { contents: string; syntax: "scss" } | null {
      const key = fromCanonical(canonical.href);
      if (!key || !has(key)) return null;
      return { contents: map[key], syntax: "scss" };
    },
  };
}

let mapUrl = "";

self.onmessage = async (event: MessageEvent<InitMessage | CompileRequest>) => {
  const data = event.data;
  if ("mapUrl" in data) {
    mapUrl = data.mapUrl;
    // Warm both caches immediately so the first keystroke is fast.
    void loadSass();
    void loadMap(mapUrl).catch(() => {});
    return;
  }

  const { id, scss } = data;
  try {
    const [sass, map] = await Promise.all([loadSass(), loadMap(mapUrl)]);
    const t0 = performance.now();
    const result = await sass.compileStringAsync(scss, {
      importers: [makeImporter(map)],
      url: new URL("cia:/playground/input.scss"),
      syntax: "scss",
      // Keep output readable — the user may copy it.
      style: "expanded",
    });
    const response: CompileResponse = { id, css: result.css, ms: performance.now() - t0 };
    self.postMessage(response);
  } catch (err) {
    const e = err as { sassMessage?: string; message?: string; span?: { start?: { line: number; column: number } } };
    const response: CompileResponse = {
      id,
      error: {
        message: e.sassMessage ?? String(e.message ?? err).split("\n")[0],
        // Sass spans are 0-based; editors are 1-based.
        line: e.span?.start ? e.span.start.line + 1 : null,
        column: e.span?.start ? e.span.start.column + 1 : null,
      },
    };
    self.postMessage(response);
  }
};
