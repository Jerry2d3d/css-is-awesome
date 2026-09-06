// Track model for the blog — a PURE module, importable from client
// components. Deliberately separate from blog.ts, which imports node:fs
// (server-only by construction): a client component importing that
// module doesn't just fail cleanly — it panics Turbopack outright
// ("Failed to write app endpoint /blog/page"). Keep this file fs-free.

export type PostTrack = "engineering" | "discovery" | "ai";

export function trackFor(category: string | null): PostTrack {
  if (category === "discovery") return "discovery";
  if (category === "ai") return "ai";
  // Everything else — engineering, architecture, technique, missing —
  // is a build story; a typo can never orphan a post.
  return "engineering";
}
