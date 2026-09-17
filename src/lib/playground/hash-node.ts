// Build-time twin of hash.ts — used by Server Components to bake
// "Try in playground" links into recipe pages. Importing `node:zlib` makes
// this module impossible to bundle for the client, which is the point.
import { gzipSync } from "node:zlib";
import type { PlaygroundState } from "./hash";

export function encodeStateSync(state: PlaygroundState): string {
  const gz = gzipSync(Buffer.from(JSON.stringify(state), "utf8"));
  return gz.toString("base64url");
}
