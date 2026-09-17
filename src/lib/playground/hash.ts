// ============================================================================
// Playground share-link codec — browser side.
// ============================================================================
// A share link is `/playground/#code=<payload>` where payload is
// base64url( gzip( JSON.stringify({ h, s, t }) ) ):
//   h — the HTML pane, s — the SCSS pane, t — the theme id.
//
// gzip because both ends have it natively: `CompressionStream` /
// `DecompressionStream` here, `zlib.gzipSync` on the build side
// (hash-node.ts) for the "Try in playground" links baked into recipe pages.
// The two must stay byte-compatible — scripts/verify-playground-compile.mjs
// round-trips a Node-encoded payload through the browser-style decoder.
// ============================================================================

export type PlaygroundState = { h: string; s: string; t: string };

export const HASH_PARAM = "code";

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(text: string): Uint8Array {
  const b64 = text.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (text.length % 4)) % 4);
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const out = new Blob([bytes as BlobPart]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

export async function encodeState(state: PlaygroundState): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(state));
  const gz = await pipe(json, new CompressionStream("gzip"));
  return toBase64Url(gz);
}

/** Returns null (never throws) when the payload is missing or corrupt. */
export async function decodeState(payload: string): Promise<PlaygroundState | null> {
  try {
    const gz = fromBase64Url(payload);
    const json = await pipe(gz, new DecompressionStream("gzip"));
    const parsed = JSON.parse(new TextDecoder().decode(json)) as Partial<PlaygroundState>;
    if (typeof parsed.h !== "string" || typeof parsed.s !== "string") return null;
    return { h: parsed.h, s: parsed.s, t: typeof parsed.t === "string" ? parsed.t : "" };
  } catch {
    return null;
  }
}

/** Read `#code=…` from a location hash; null if absent. */
export function payloadFromHash(hash: string): string | null {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  return params.get(HASH_PARAM);
}

export function hashFromPayload(payload: string): string {
  return `#${HASH_PARAM}=${payload}`;
}
