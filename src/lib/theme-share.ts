"use client";

// Theme editor "share via URL" — encode the current family + overrides into
// the URL search param `t`, copy the resulting URL to clipboard, and on a
// fresh load hydrate the editor from the same URL.
//
// Encoding: JSON → UTF-8 bytes → optional gzip (CompressionStream where
// available) → URL-safe base64. The encoded string is prefixed with a
// single char that picks the decode path: 'g' for gzipped, 'r' for raw
// base64. Older browsers without CompressionStream fall through to 'r' —
// the URL gets longer but still works under ~2,000 chars for partial
// overrides.

export type SharePayload = {
  v: 1; // schema version — bump if the payload shape ever changes
  f: string; // theme family (e.g. "sketchbook", "boilerplate")
  l: Record<string, string>; // light-mode overrides
  d: Record<string, string>; // dark-mode overrides
};

const PARAM = "t";
const PFX_GZ = "g";
const PFX_RAW = "r";
const HAS_COMPRESSION = typeof CompressionStream !== "undefined";

// ----- URL-safe base64 (RFC 4648 §5: + → -, / → _, drop padding) ---------

function toUrlSafeBase64(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromUrlSafeBase64(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = (4 - (b64.length % 4)) % 4;
  const bin = atob(b64 + "=".repeat(pad));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// ----- gzip via CompressionStream where available ------------------------

async function gzip(bytes: Uint8Array): Promise<Uint8Array> {
  const buf = await new Response(
    new Blob([bytes]).stream().pipeThrough(new CompressionStream("gzip")),
  ).arrayBuffer();
  return new Uint8Array(buf);
}

async function gunzip(bytes: Uint8Array): Promise<Uint8Array> {
  const buf = await new Response(
    new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip")),
  ).arrayBuffer();
  return new Uint8Array(buf);
}

// ----- public API --------------------------------------------------------

export async function encodePayload(payload: SharePayload): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  if (HAS_COMPRESSION) {
    return PFX_GZ + toUrlSafeBase64(await gzip(bytes));
  }
  return PFX_RAW + toUrlSafeBase64(bytes);
}

export async function decodePayload(encoded: string): Promise<SharePayload> {
  const prefix = encoded[0];
  const body = encoded.slice(1);
  const bytes = fromUrlSafeBase64(body);
  let json: string;
  if (prefix === PFX_GZ) {
    if (!HAS_COMPRESSION) {
      throw new Error("Share URL is gzipped but this browser has no DecompressionStream.");
    }
    json = new TextDecoder().decode(await gunzip(bytes));
  } else if (prefix === PFX_RAW) {
    json = new TextDecoder().decode(bytes);
  } else {
    throw new Error(`Unknown share-URL encoding prefix: '${prefix}'`);
  }
  const parsed: SharePayload = JSON.parse(json);
  if (parsed.v !== 1) {
    throw new Error(`Unsupported share payload version: ${parsed.v}`);
  }
  return parsed;
}

// ----- URL helpers -------------------------------------------------------

export function getShareParam(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(PARAM);
}

export function setShareParam(encoded: string | null): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (encoded && encoded.length > 0) {
    url.searchParams.set(PARAM, encoded);
  } else {
    url.searchParams.delete(PARAM);
  }
  window.history.replaceState({}, "", url.toString());
}

// ----- clipboard ---------------------------------------------------------

export async function copyShareLink(): Promise<void> {
  if (typeof window === "undefined") return;
  const url = window.location.href;
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return;
  }
  // Fallback for non-secure contexts (no navigator.clipboard)
  const ta = document.createElement("textarea");
  ta.value = url;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  ta.style.pointerEvents = "none";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(ta);
  }
}

// Convenience: check whether overrides have anything in them. The encoder
// + URL writer should bail when there's nothing to share — keeps the URL
// clean during initial load and after a "Reset all."
export function hasAnyOverrides(overrides: {
  light: Record<string, string>;
  dark: Record<string, string>;
}): boolean {
  return (
    Object.keys(overrides.light).length > 0 ||
    Object.keys(overrides.dark).length > 0
  );
}
