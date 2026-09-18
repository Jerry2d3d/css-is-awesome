// ============================================================================
// "Try in playground" — build-time extraction of a recipe's starter state.
// ============================================================================
// Every recipe has a `## Structure (raw HTML)` section with an ```html block
// and a `## Styling (cia mixins)` section with a ```scss block (the recipe
// validator enforces both). Lift the FIRST fenced block of each, encode them
// with the share-link codec, and the recipe page can link straight into the
// playground with the pattern loaded. Server-only (imports node:zlib via
// hash-node.ts); called from Server Components at build time.
//
// A recipe missing either block yields null — the page then renders no
// button rather than a link into an empty editor.
// ============================================================================
import { encodeStateSync } from "./hash-node";
import { DEFAULT_THEME } from "@/app/(site)/playground/themes";

function sectionBody(markdown: string, heading: string): string | null {
  const re = new RegExp(`^##\\s+${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m");
  const start = re.exec(markdown);
  if (!start) return null;
  const rest = markdown.slice(start.index + start[0].length);
  const next = /^##\s+/m.exec(rest);
  return next ? rest.slice(0, next.index) : rest;
}

function firstFence(section: string, lang: string): string | null {
  const re = new RegExp("^\\s*```" + lang + "\\s*\\n([\\s\\S]*?)^\\s*```", "m");
  const m = re.exec(section);
  return m ? m[1].replace(/\s+$/, "") + "\n" : null;
}

export type PlaygroundStarter = { html: string; scss: string };

/** The recipe's Structure HTML + Styling SCSS, or null if either is missing. */
export function extractRecipeStarter(markdownBody: string): PlaygroundStarter | null {
  const structure = sectionBody(markdownBody, "Structure (raw HTML)");
  const styling = sectionBody(markdownBody, "Styling (cia mixins)");
  if (!structure || !styling) return null;
  const html = firstFence(structure, "html");
  const scss = firstFence(styling, "scss");
  if (!html || !scss) return null;
  return { html, scss };
}

/** `#code=…` payload for /playground, or null. */
export function recipePlaygroundPayload(markdownBody: string): string | null {
  const starter = extractRecipeStarter(markdownBody);
  if (!starter) return null;
  return encodeStateSync({ h: starter.html, s: starter.scss, t: DEFAULT_THEME });
}
