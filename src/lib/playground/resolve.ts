// ============================================================================
// Playground `@use` resolver — pure, environment-free.
// ============================================================================
// Maps a Sass `@use`/`@forward` URL onto a key of the scss map that
// scripts/build-playground-scss-map.mjs emits (paths relative to `scss/`).
// Used by the in-browser compiler worker AND by scripts/verify-playground-
// compile.mjs (Node), so it must not import anything.
//
// It reproduces, in order, what a real consumer build does:
//   1. The package entry points from package.json `exports` —
//      `css-is-awesome` → main.scss, `css-is-awesome/api` → api.scss,
//      `css-is-awesome/scss/<x>` → `<x>` under scss/. Every `scss/*` export
//      is either `<x>.scss`, `_<x>.scss` or `<x>/_index.scss`, which is
//      exactly Sass's own partial/index rule, so one lookup covers them all.
//   2. Relative URLs, resolved against the importing file's directory.
//   3. Load-path fallback against the scss/ root — cia's own files say
//      `@use 'mixins' as m` from inside components/, relying on the
//      consumer's `loadPaths: ['scss']`.
//   4. `sass:` built-ins are Sass's business — return null.
// ============================================================================

const PACKAGE = "css-is-awesome";

/** Candidate file keys for a bare path (no extension), per Sass partial rules. */
function candidates(base: string): string[] {
  const clean = base.replace(/^\/+/, "").replace(/\.scss$/, "");
  if (!clean) return [];
  const slash = clean.lastIndexOf("/");
  const dir = slash === -1 ? "" : clean.slice(0, slash + 1);
  const name = slash === -1 ? clean : clean.slice(slash + 1);
  return [
    `${clean}.scss`,
    `${dir}_${name}.scss`,
    `${clean}/_index.scss`,
    `${clean}/index.scss`,
  ];
}

/** Normalise `a/./b/../c` → `a/c` without touching the file system. */
function normalize(p: string): string {
  const out: string[] = [];
  for (const seg of p.split("/")) {
    if (!seg || seg === ".") continue;
    if (seg === "..") out.pop();
    else out.push(seg);
  }
  return out.join("/");
}

/**
 * Resolve a `@use` URL to a scss-map key, or null if it is not ours.
 *
 * @param url        the string in the `@use` rule
 * @param containing the map key of the file doing the importing (null for the
 *                   playground's own entry document)
 * @param has        predicate: does the map contain this key?
 */
export function resolveCiaUse(
  url: string,
  containing: string | null,
  has: (key: string) => boolean,
): string | null {
  if (url.startsWith("sass:")) return null;

  // 1. Package specifiers.
  if (url === PACKAGE) return first(candidates("main"), has);
  if (url.startsWith(`${PACKAGE}/`)) {
    let sub = url.slice(PACKAGE.length + 1);
    if (sub === "api" || sub === "api.scss") return first(candidates("api"), has);
    if (sub.startsWith("scss/")) sub = sub.slice("scss/".length);
    if (sub === "" || sub === "main") return first(candidates("main"), has);
    return first(candidates(sub), has);
  }

  // 2. Relative to the importing file.
  if (containing) {
    const dir = containing.includes("/") ? containing.slice(0, containing.lastIndexOf("/") + 1) : "";
    const rel = first(candidates(normalize(dir + url)), has);
    if (rel) return rel;
  }

  // 3. Load-path fallback: the scss/ root.
  return first(candidates(normalize(url)), has);
}

function first(keys: string[], has: (key: string) => boolean): string | null {
  for (const k of keys) if (has(k)) return k;
  return null;
}

/** The scheme the worker uses for canonical URLs (`cia:/components/_buttons.scss`). */
export const CIA_SCHEME = "cia:";

export function toCanonical(key: string): string {
  return `${CIA_SCHEME}/${key}`;
}

export function fromCanonical(canonical: string): string | null {
  if (!canonical.startsWith(`${CIA_SCHEME}/`)) return null;
  return canonical.slice(CIA_SCHEME.length + 1);
}
