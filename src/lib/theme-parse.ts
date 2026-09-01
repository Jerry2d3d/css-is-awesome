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
