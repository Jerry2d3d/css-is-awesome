#!/usr/bin/env node
// Proves, in Node, the two contracts the /playground page relies on:
//   1. The scss map + resolveCiaUse importer compile real cia calls.
//   2. A zlib-gzipped share payload decodes through the browser codec path
//      (DecompressionStream), so build-time "Try in playground" links open.
// Run: node scripts/verify-playground-compile.mjs   (exit 0 = pass)
import { readFileSync, existsSync } from "node:fs";
import { gzipSync } from "node:zlib";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as sass from "sass";
import { resolveCiaUse, toCanonical, fromCanonical } from "../src/lib/playground/resolve.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAP = path.join(ROOT, "public", "playground", "scss-map.json");
if (!existsSync(MAP)) {
  console.error("scss-map.json missing — run `node scripts/build-playground-scss-map.mjs` first");
  process.exit(1);
}
const map = JSON.parse(readFileSync(MAP, "utf8"));
const has = (k) => Object.prototype.hasOwnProperty.call(map, k);

const importer = {
  canonicalize(url, { containingUrl }) {
    const containing = containingUrl ? fromCanonical(containingUrl.href) : null;
    const key = resolveCiaUse(url, containing, has);
    return key ? new URL(toCanonical(key)) : null;
  },
  load(canonical) {
    const key = fromCanonical(canonical.href);
    if (!key || !has(key)) return null;
    return { contents: map[key], syntax: "scss" };
  },
};

const samples = [
  ["api barrel", `@use 'css-is-awesome/api' as cia; .btn { @include cia.btn(primary); }`],
  ["mixins leaf", `@use 'css-is-awesome/scss/mixins' as m; .x { padding: m.space(3); }`],
  ["layout + components", `@use 'css-is-awesome/api' as cia; .card { @include cia.card-base; @include cia.stack(3); }`],
  ["emitting bundle", `@use 'css-is-awesome';`],
];

let failed = 0;
for (const [label, src] of samples) {
  try {
    const t0 = performance.now();
    const res = await sass.compileStringAsync(src, {
      importers: [importer],
      url: new URL("cia:/playground/input.scss"),
      syntax: "scss",
    });
    console.log(`  ✓ ${label} — ${res.css.length} bytes of CSS in ${(performance.now() - t0).toFixed(0)} ms`);
  } catch (err) {
    failed++;
    console.log(`  ✗ ${label} — ${String(err.message).split("\n")[0]}`);
  }
}

// Share-link round-trip: Node gzip → browser-style decode (global DecompressionStream).
const state = { h: "<button class=\"my-btn\">Hi</button>", s: samples[0][1], t: "sketchbook" };
const payload = gzipSync(Buffer.from(JSON.stringify(state))).toString("base64url");
const b64 = payload.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (payload.length % 4)) % 4);
const bytes = Uint8Array.from(Buffer.from(b64, "base64"));
const out = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
const decoded = JSON.parse(new TextDecoder().decode(await new Response(out).arrayBuffer()));
if (JSON.stringify(decoded) === JSON.stringify(state)) {
  console.log(`  ✓ share payload round-trips (zlib → DecompressionStream), ${payload.length} chars`);
} else {
  failed++;
  console.log("  ✗ share payload round-trip mismatch");
}

console.log(failed ? `\n${failed} check(s) failed` : "\nplayground verification passed.");
process.exit(failed ? 1 : 0);
