// Pure-string CSS token-extraction helpers used by the theme editor's
// import flow. Conceptually parallel to the Node-only parser inside
// scripts/theme-validator.js; keep them in sync if you change either.
//
// Why a duplicate parser: tsconfig has allowJs:false and excludes
// scripts/, so the Node validator can't be imported from the Next.js
// client. The parser is small enough that a TypeScript re-implementation
// is cheaper than introducing a compile/bundle hop.

export type ParsedBlock = {
  name: string | null;          // null for legacy :root blocks
  selector: string;             // full selector (raw)
  tokens: Set<string>;          // every --token-name declared
  values: Map<string, string>;  // --token-name → raw value (post-`:` to next top-level `;`)
};

function stripBlockComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

// Read a balanced `{ ... }` block whose opening brace is at openIdx.
// Returns the body (between the braces) plus the index of the closing
// brace, or null if the braces aren't balanced.
function readBracedBlock(s: string, openIdx: number): { body: string; end: number } | null {
  if (s[openIdx] !== "{") return null;
  let depth = 1;
  let k = openIdx + 1;
  while (k < s.length && depth > 0) {
    const ch = s[k];
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
    if (depth === 0) break;
    k++;
  }
  if (depth !== 0) return null;
  return { body: s.slice(openIdx + 1, k), end: k };
}

// Pull every top-level `--name: value;` declaration out of a block body.
// Paren-aware so `rgba(...)` survives intact.
function collectTokenValues(blockBody: string): Map<string, string> {
  const out = new Map<string, string>();
  const re = /(--[A-Za-z_][A-Za-z0-9_-]*)\s*:/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(blockBody)) !== null) {
    const name = m[1];
    let i = m.index + m[0].length;
    let depth = 0;
    let value = "";
    while (i < blockBody.length) {
      const ch = blockBody[i];
      if (ch === "(") depth++;
      else if (ch === ")") depth--;
      else if (ch === ";" && depth === 0) break;
      else if (ch === "}" && depth === 0) break;
      value += ch;
      i++;
    }
    out.set(name, value.trim());
  }
  return out;
}

// Any `[data-theme="..."]` selector at all means consolidated shape.
export function isConsolidated(css: string): boolean {
  return /\[data-theme\s*=\s*["']/.test(stripBlockComments(css));
}

// Walk every `[data-theme="<name>"] { ... }` rule. A rule's selector list
// may carry multiple data-theme selectors (rare grouped form); each named
// theme accumulates the rule's declarations.
export function extractDataThemeBlocks(css: string): ParsedBlock[] {
  const s = stripBlockComments(css);
  const order: string[] = [];
  const byName = new Map<string, ParsedBlock>();

  let i = 0;
  while (i < s.length) {
    const brace = s.indexOf("{", i);
    if (brace === -1) break;

    // Selector starts after the previous `}` or `;` (or at 0).
    let selStart = brace - 1;
    while (selStart >= 0) {
      const ch = s[selStart];
      if (ch === "}" || ch === ";") { selStart++; break; }
      selStart--;
    }
    if (selStart < 0) selStart = 0;
    const selector = s.slice(selStart, brace);

    const block = readBracedBlock(s, brace);
    if (!block) break;

    const nameRe = /\[data-theme\s*=\s*["']([^"']+)["']\s*\]/g;
    const names: string[] = [];
    let nm: RegExpExecArray | null;
    while ((nm = nameRe.exec(selector)) !== null) names.push(nm[1]);

    if (names.length > 0) {
      const values = collectTokenValues(block.body);
      for (const name of names) {
        let entry = byName.get(name);
        if (!entry) {
          entry = { name, selector: selector.trim(), tokens: new Set(), values: new Map() };
          byName.set(name, entry);
          order.push(name);
        }
        for (const [t, v] of values) {
          entry.tokens.add(t);
          entry.values.set(t, v);
        }
      }
    }

    i = block.end + 1;
  }

  return order.map((n) => byName.get(n)!);
}

// Splits a `light-dark(A, B)` value into its light/dark components. Paren-
// aware comma split so a value like
// `light-dark(rgba(0,0,0,.1), rgba(255,255,255,.1))` survives intact
// instead of splitting on the inner commas. Returns null if the value
// isn't a light-dark() call (mode-invariant tokens — radius, font,
// spacing, etc. — apply the same either way).
export function splitLightDark(raw: string): { light: string; dark: string } | null {
  const trimmed = raw.trim();
  const m = /^light-dark\(([\s\S]*)\)$/i.exec(trimmed);
  if (!m) return null;
  const inner = m[1];
  let depth = 0;
  let splitAt = -1;
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    else if (ch === "," && depth === 0) { splitAt = i; break; }
  }
  if (splitAt === -1) return null;
  return {
    light: inner.slice(0, splitAt).trim(),
    dark: inner.slice(splitAt + 1).trim(),
  };
}

// Finds every `@media (prefers-color-scheme: dark) { ... }` block and
// returns the union of every --token declaration nested inside it,
// regardless of which selector wraps them within the block. This is how
// the editor's own "Download" output stores dark-mode overrides for
// NON-color tokens (emitTokenLines puts them here instead of a
// `light-dark()` call, since light-dark() only makes sense for color
// values) — cia's shipped themes never use this shape, but a file
// re-imported after being downloaded from the editor does. Without this,
// those overrides were silently invisible to the importer: neither
// extractDataThemeBlocks nor extractRootBlock ever looks inside an
// `@media` block, so a nested rule in one was skipped entirely rather
// than mis-parsed — same outcome (the value never reached the editor) but
// a different, less obvious failure mode than the light-dark() splitting
// bug this file's other export fixes.
export function extractPrefersDarkOverrides(css: string): Map<string, string> {
  const s = stripBlockComments(css);
  const out = new Map<string, string>();
  const mediaRe = /@media\s*\(\s*prefers-color-scheme\s*:\s*dark\s*\)/gi;
  let m: RegExpExecArray | null;
  while ((m = mediaRe.exec(s)) !== null) {
    const braceIdx = s.indexOf("{", m.index);
    if (braceIdx === -1) break;
    const block = readBracedBlock(s, braceIdx);
    if (!block) break;
    let i = 0;
    while (i < block.body.length) {
      const nestedBrace = block.body.indexOf("{", i);
      if (nestedBrace === -1) break;
      const nested = readBracedBlock(block.body, nestedBrace);
      if (!nested) break;
      for (const [t, v] of collectTokenValues(nested.body)) out.set(t, v);
      i = nested.end + 1;
    }
    mediaRe.lastIndex = block.end + 1;
  }
  return out;
}

// Legacy / per-file shape: union of every `:root { ... }` block in the
// file. Same return shape as a single ParsedBlock with name=null.
export function extractRootBlock(css: string): ParsedBlock {
  const s = stripBlockComments(css);
  const tokens = new Set<string>();
  const values = new Map<string, string>();

  let i = 0;
  while (i < s.length) {
    const rootIdx = s.indexOf(":root", i);
    if (rootIdx === -1) break;

    let j = rootIdx + ":root".length;
    while (j < s.length && s[j] !== "{" && s[j] !== ";") j++;
    if (j >= s.length || s[j] !== "{") {
      i = rootIdx + ":root".length;
      continue;
    }

    const block = readBracedBlock(s, j);
    if (!block) { i = j + 1; continue; }

    for (const [t, v] of collectTokenValues(block.body)) {
      tokens.add(t);
      values.set(t, v);
    }
    i = block.end + 1;
  }

  return { name: null, selector: ":root", tokens, values };
}
