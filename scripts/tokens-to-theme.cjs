#!/usr/bin/env node
// ============================================================================
// tokens-to-theme.cjs — design-tokens JSON → validated cia theme.css
// ============================================================================
// The supported path from a design tool to a cia theme. Ships in the npm
// package (see `files`), zero dependencies, Node ≥ 20. Three front doors share
// this one module:
//
//   CLI     npx cia theme from-tokens tokens.json --name acme        (bin/theme-from-tokens.cjs)
//   MCP     theme_from_tokens({ tokens, name })                       (mcp/server.cjs)
//   In-proc require('css-is-awesome/mcp/server.cjs').handlers.theme_from_tokens(...)
//
// INPUT FORMATS (`format`)
//   auto           detect: keys starting with `--` → cia-flat; any `$value` → dtcg;
//                  otherwise tokens-studio.
//   dtcg           DTCG v2025.10 — nested groups, leaves carry `$value` (+ `$type`).
//                  Aliases `{group.path}` resolve recursively (cycle-safe; an
//                  unresolved alias is an error, never a silent drop). `$extensions`
//                  and other `$`-keys are ignored. 2025.10 composite values are
//                  understood: color objects ({hex} or {colorSpace, components}),
//                  dimension/duration objects ({value, unit}), shadow objects/arrays,
//                  fontFamily arrays, cubicBezier arrays.
//   tokens-studio  Tokens Studio for Figma export — leaves carry `value` + `type`.
//                  Either a single set (like figma-tokens/tokens.json here) or the
//                  multi-set export with top-level `$themes` / `$metadata`; sets merge
//                  in `$metadata.tokenSetOrder` (later sets win). Aliases `{path}`
//                  (and legacy `$path`) resolve the same way.
//   cia-flat       `{ "--brand-primary": "#3A5FCD", ... }` — passthrough.
//
// PATH → TOKEN RESOLUTION (in order; first hit wins)
//   1. TOKEN_MAP — the explicit table below for Figma-style paths that don't
//      spell the cia name (typography.font.body → --font-sans, …).
//   2. Generic rule — strip a leading `color.`/`colors.`, rewrite a few common
//      group names (PATH_ALIASES: spacing.→space., border-radius.→radius., …),
//      then join the segments with `-`, prefix `--`, and accept the name if it
//      is in the contract (required or optional). So `space.4` → `--space-4`,
//      `brand.primary` → `--brand-primary`, `text.primary` → `--text-primary`.
//   3. Anything else is emitted VERBATIM as `--<joined-path>` and listed in
//      report.unmapped — never dropped silently.
//
// MINIMUM CONTENT
//   None beyond what you have. Every REQUIRED token the file does not supply is
//   inherited from a shipped base theme (`base`, default boilerplate) and listed
//   in report.inherited; optional tokens are never inherited (the library
//   default applies). The output is always a complete, contract-valid theme —
//   the validator + WCAG audit run on it and come back as `validation`.
//
// LIGHT + DARK
//   Pass `dark` (a second tokens object, same format) and every colour token
//   that differs becomes `light-dark(light, dark)` with `color-scheme: light dark`.
//   A single Tokens Studio file with paired top-level groups (`color-light` +
//   `color-dark`, or `light` + `dark`) is split the same way automatically.
//   Without a dark side the block is single-mode: `color-scheme: <mode>`
//   (`mode`, default light).
// ============================================================================
'use strict';

const fs = require('fs');
const path = require('path');

const CIA_ROOT_DEFAULT = path.resolve(__dirname, '..');
const GENERATOR_VERSION = (() => {
  try { return require(path.join(CIA_ROOT_DEFAULT, 'package.json')).version; } catch { return 'unknown'; }
})();

// ---------------------------------------------------------------------------
// 1. Explicit table — Figma-style paths whose cia name is not the joined path.
//    (Everything that IS the joined path — brand.primary, space.4, shadow.md,
//    duration.fast, z.modal, code.bg, … — needs no entry: rule 2 covers it.)
// ---------------------------------------------------------------------------
const TOKEN_MAP = {
  // Surfaces / backgrounds — original table (kept verbatim)
  'color.background.default':       '--background-default',
  'color.background.subtle':        '--background-subtle',
  'color.background.elevated':      '--background-elevated',
  'color.background.overlay':       '--background-overlay',
  'color.background.hero':          '--background-hero',
  'color.background.scrim':         '--background-scrim',
  'color.surface.default':          '--surface-default',
  'color.surface.raised':           '--surface-raised',
  'color.surface.muted':            '--surface-muted',
  // Text
  'color.text.primary':             '--text-primary',
  'color.text.secondary':           '--text-secondary',
  'color.text.muted':               '--text-muted',
  'color.text.inverse':             '--text-inverse',
  'color.text.link':                '--text-link',
  // Action
  'color.action.primary.default':   '--action-primary-default',
  'color.action.primary.hover':     '--action-primary-hover',
  'color.action.primary.active':    '--action-primary-active',
  'color.action.secondary.default': '--action-secondary-default',
  'color.action.secondary.hover':   '--action-secondary-hover',
  'color.action.secondary.active':  '--action-secondary-active',
  // Status
  'color.success.default':          '--success-default',
  'color.success.subtle':           '--success-subtle',
  'color.warning.default':          '--warning-default',
  'color.warning.subtle':           '--warning-subtle',
  'color.error.default':            '--error-default',
  'color.error.subtle':             '--error-subtle',
  // Border
  'color.border.default':           '--border-default',
  'color.border.subtle':            '--border-subtle',
  'color.border.focus':             '--border-focus',
  // Type
  'typography.font.display':        '--font-display',
  'typography.font.body':           '--font-sans',
  'typography.font.mono':           '--font-mono',
  'typography.font.serif':          '--font-serif',
  // Shape
  'shape.radius.sm':                '--radius-sm',
  'shape.radius.md':                '--radius-md',
  'shape.radius.lg':                '--radius-lg',
  'shape.radius.full':              '--radius-full',
  // Spacing aliases
  'space.xs':                       '--space-xs',
  'space.sm':                       '--space-sm',
  'space.md':                       '--space-md',
  'space.lg':                       '--space-lg',
  'space.xl':                       '--space-xl',

  // ── Additions 2026-09-18 (Gremlin Forge item 1) — every REQUIRED token
  //    whose natural Figma path does not spell the cia name ─────────────
  // Type — Figma tools group families/sizes/weights under typography.*
  'typography.font.primary':        '--font-primary',
  'typography.font.sans':           '--font-sans',
  'typography.font.script':         '--font-script',
  'typography.family.display':      '--font-display',
  'typography.family.body':         '--font-sans',
  'typography.family.sans':         '--font-sans',
  'typography.family.serif':        '--font-serif',
  'typography.family.mono':         '--font-mono',
  'typography.family.script':       '--font-script',
  'typography.family.primary':      '--font-primary',
  'typography.size.base':           '--font-size-base',
  'typography.fontSize.base':       '--font-size-base',
  'typography.weight.medium':       '--font-weight-medium',
  'typography.fontWeight.medium':   '--font-weight-medium',
  'typography.lineHeight.normal':   '--line-height-normal',
  'typography.line-height.normal':  '--line-height-normal',
  // Shape — the fifth radius step + the short r-* aliases some kits export
  'shape.radius.xl':                '--radius-xl',
  'shape.radius.r-sm':              '--r-sm',
  'shape.radius.r-md':              '--r-md',
  'shape.radius.r-lg':              '--r-lg',
  // Colour ramps — the tertiary action, washes, interactive states
  'color.action.tertiary.default':  '--action-tertiary-default',
  'color.action.tertiary.hover':    '--action-tertiary-hover',
  'color.action.tertiary.active':   '--action-tertiary-active',
  'color.action.primary.wash':      '--action-primary-wash',
  'color.action.secondary.wash':    '--action-secondary-wash',
  'color.action.tertiary.wash':     '--action-tertiary-wash',
  'color.interactive.hover':        '--interactive-hover',
  'color.interactive.active':       '--interactive-active',
  'color.text.tertiary':            '--text-tertiary',
  'color.text.link.hover':          '--text-link-hover',
  'color.text.linkHover':           '--text-link-hover',
  'color.border.emphasis':          '--border-emphasis',
  'color.surface.subtle':           '--surface-subtle',
  'color.surface.emphasis':         '--surface-emphasis',
  'color.surface.glass':            '--surface-glass',
  'color.surface.sunk':             '--surface-sunk',
  'color.background.navbar':        '--background-navbar',
  'color.success.text':             '--success-text',
  'color.warning.text':             '--warning-text',
  'color.error.text':               '--error-text',
  'color.info.default':             '--info-default',
  'color.info.subtle':              '--info-subtle',
  'color.info.text':                '--info-text',
  'color.feedback.success':         '--feedback-success',
  'color.feedback.warning':         '--feedback-warning',
  'color.feedback.error':           '--feedback-error',
  'color.feedback.info':            '--feedback-info',
  'color.brand.primary':            '--brand-primary',
  'color.brand.primary.hover':      '--brand-primary-hover',
  'color.brand.primaryHover':       '--brand-primary-hover',
  // Motion
  'motion.duration.fast':           '--duration-fast',
  'motion.duration.normal':         '--duration-normal',
  'motion.duration.slow':           '--duration-slow',
  'motion.easing':                  '--ease',
  'motion.ease':                    '--ease',
  'motion.easing.default':          '--ease',
  // Effects
  'effect.shadow.sm':               '--shadow-sm',
  'effect.shadow.md':               '--shadow-md',
  'effect.shadow.lg':               '--shadow-lg',
  'effect.shadow.xl':               '--shadow-xl',
  'effect.shadow.2xl':              '--shadow-2xl',
  'effect.blur.sm':                 '--blur-sm',
  'effect.blur.md':                 '--blur-md',
  'effect.blur.lg':                 '--blur-lg',
  'effect.glow.sm':                 '--glow-sm',
  'effect.glow.md':                 '--glow-md',
  'effect.glow.lg':                 '--glow-lg',
  // Layering
  'layer.dropdown':                 '--z-dropdown',
  'layer.sticky':                   '--z-sticky',
  'layer.backdrop':                 '--z-backdrop',
  'layer.modal':                    '--z-modal',
  'layer.popover':                  '--z-popover',
  'layer.tooltip':                  '--z-tooltip',
};

// Group-name rewrites applied before the generic rule (rule 2). Case-insensitive
// on the first segment only; the rest of the path is joined verbatim.
const PATH_ALIASES = [
  [/^colors?\./i, ''],
  [/^spacing\./i, 'space.'],
  [/^border-?radius\./i, 'radius.'],
  [/^radii\./i, 'radius.'],
  [/^elevation\./i, 'shadow.'],
  [/^shadows\./i, 'shadow.'],
  [/^z-?index\./i, 'z.'],
  [/^zindex\./i, 'z.'],
  [/^layer\./i, 'z.'],
  [/^font-?family\./i, 'font.'],
  [/^fontFamilies\./i, 'font.'],
  [/^fonts\./i, 'font.'],
  [/^font-?size\./i, 'font-size.'],
  [/^fontSizes?\./i, 'font-size.'],
  [/^font-?weight\./i, 'font-weight.'],
  [/^fontWeights?\./i, 'font-weight.'],
  [/^line-?height\./i, 'line-height.'],
  [/^lineHeights?\./i, 'line-height.'],
  [/^durations?\./i, 'duration.'],
  [/^motion\.duration\./i, 'duration.'],
];

// Token families that are unitless by contract — a bare number stays bare.
const UNITLESS_RE = /^--(line-height|font-weight|z-|opacity)/;

// ---------------------------------------------------------------------------
// Format detection + flattening
// ---------------------------------------------------------------------------
function isPlainObject(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }

function detectFormat(tokens) {
  if (!isPlainObject(tokens)) throw new Error('tokens must be a JSON object');
  const keys = Object.keys(tokens);
  if (keys.length && keys.every((k) => k.startsWith('--'))) return 'cia-flat';
  if (hasKeyDeep(tokens, '$value')) return 'dtcg';
  return 'tokens-studio';
}

function hasKeyDeep(obj, key, depth = 0) {
  if (!isPlainObject(obj) || depth > 12) return false;
  if (Object.prototype.hasOwnProperty.call(obj, key)) return true;
  return Object.values(obj).some((v) => hasKeyDeep(v, key, depth + 1));
}

/** DTCG: leaves are objects carrying `$value`; `$`-prefixed keys are metadata. */
function flattenDtcg(obj, prefix = '', out = []) {
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;
    const p = prefix ? `${prefix}.${key}` : key;
    if (isPlainObject(val)) {
      if ('$value' in val) out.push({ path: p, value: val.$value, type: val.$type ? String(val.$type).toLowerCase() : undefined });
      else flattenDtcg(val, p, out);
    }
  }
  return out;
}

/** Tokens Studio: leaves are objects carrying `value` (+ `type`). */
function flattenTokensStudio(obj, prefix = '', out = []) {
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;
    const p = prefix ? `${prefix}.${key}` : key;
    if (isPlainObject(val)) {
      if ('value' in val && !isPlainObject(val.value) || ('value' in val && 'type' in val)) {
        out.push({ path: p, value: val.value, type: val.type ? String(val.type).toLowerCase() : undefined });
      } else {
        flattenTokensStudio(val, p, out);
      }
    }
  }
  return out;
}

/** Tokens Studio multi-set export → one merged set (later sets override). */
function mergeTokensStudioSets(root) {
  const meta = root.$metadata;
  const setNames = Object.keys(root).filter((k) => !k.startsWith('$'));
  const looksMultiSet = isPlainObject(meta) && Array.isArray(meta.tokenSetOrder) || Array.isArray(root.$themes);
  if (!looksMultiSet) return { set: root, sets: null };
  const order = isPlainObject(meta) && Array.isArray(meta.tokenSetOrder) ? meta.tokenSetOrder.filter((n) => setNames.includes(n)) : setNames;
  const missing = setNames.filter((n) => !order.includes(n));
  const merged = {};
  for (const name of [...order, ...missing]) deepMerge(merged, root[name]);
  return { set: merged, sets: [...order, ...missing] };
}

function deepMerge(target, src) {
  if (!isPlainObject(src)) return target;
  for (const [k, v] of Object.entries(src)) {
    if (isPlainObject(v) && isPlainObject(target[k]) && !('value' in v) && !('$value' in v)) deepMerge(target[k], v);
    else target[k] = v;
  }
  return target;
}

// ---------------------------------------------------------------------------
// Alias resolution — `{group.path}` anywhere in a string, or a whole-value
// legacy `$group.path`. Recursive, cycle-safe, loud on failure.
// ---------------------------------------------------------------------------
function resolveAliases(entries) {
  const byPath = new Map(entries.map((e) => [e.path, e]));
  const resolved = new Map();

  function resolveValue(value, stack) {
    if (typeof value === 'string') {
      const whole = value.match(/^\$([A-Za-z0-9_.-]+)$/);
      if (whole) return resolvePath(whole[1], stack);
      return value.replace(/\{([^{}]+)\}/g, (_m, ref) => {
        const v = resolvePath(ref.trim(), stack);
        return typeof v === 'string' || typeof v === 'number' ? String(v) : JSON.stringify(v);
      });
    }
    if (Array.isArray(value)) return value.map((v) => resolveValue(v, stack));
    if (isPlainObject(value)) {
      const out = {};
      for (const [k, v] of Object.entries(value)) out[k] = resolveValue(v, stack);
      return out;
    }
    return value;
  }

  function resolvePath(ref, stack) {
    if (resolved.has(ref)) return resolved.get(ref);
    if (stack.includes(ref)) throw new Error(`alias cycle: ${[...stack, ref].join(' → ')}`);
    const target = byPath.get(ref);
    if (!target) throw new Error(`unresolved alias {${ref}} (referenced from ${stack[stack.length - 1] || 'top level'})`);
    const v = resolveValue(target.value, [...stack, ref]);
    resolved.set(ref, v);
    return v;
  }

  return entries.map((e) => ({ ...e, value: resolveValue(e.value, [e.path]) }));
}

// ---------------------------------------------------------------------------
// Value normalisation — every leaf becomes one CSS value string, or is skipped
// with a reason (composites such as `typography` have no single-token home).
// ---------------------------------------------------------------------------
function unitOf(type) {
  const t = (type || '').toLowerCase();
  if (['duration', 'durations'].includes(t)) return 'ms';
  if (['dimension', 'spacing', 'sizing', 'borderradius', 'borderwidth', 'fontsize', 'fontsizes', 'letterspacing', 'paragraphspacing', 'space', 'radius'].includes(t)) return 'px';
  return null;
}

function dimToString(v, fallbackUnit) {
  if (isPlainObject(v) && 'value' in v) return `${v.value}${v.unit || fallbackUnit || ''}`;
  if (typeof v === 'number') return `${v}${fallbackUnit || ''}`;
  // Tokens Studio exports numbers as strings ("4"); a bare numeric string takes the unit too.
  if (typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v.trim())) return `${v.trim()}${fallbackUnit || ''}`;
  return String(v);
}

function colorToString(v) {
  if (typeof v === 'string') return v.trim();
  if (isPlainObject(v)) {
    if (v.hex) return String(v.hex);
    const space = String(v.colorSpace || 'srgb').toLowerCase();
    const c = Array.isArray(v.components) ? v.components : [];
    const a = v.alpha == null ? 1 : Number(v.alpha);
    if (space === 'srgb' && c.length >= 3) {
      const [r, g, b] = c.map((x) => Math.round(Number(x) * 255));
      return a < 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;
    }
    return `color(${space} ${c.join(' ')}${a < 1 ? ` / ${a}` : ''})`;
  }
  return String(v);
}

function shadowToString(v) {
  const one = (s) => {
    if (typeof s === 'string') return s;
    if (!isPlainObject(s)) return String(s);
    const x = dimToString(s.offsetX ?? s.x ?? 0, 'px');
    const y = dimToString(s.offsetY ?? s.y ?? 0, 'px');
    const blur = dimToString(s.blur ?? 0, 'px');
    const spread = dimToString(s.spread ?? 0, 'px');
    const color = colorToString(s.color ?? 'rgba(0,0,0,0.2)');
    const inset = s.inset || String(s.type || '').toLowerCase() === 'innershadow' ? 'inset ' : '';
    return `${inset}${x} ${y} ${blur} ${spread} ${color}`;
  };
  return (Array.isArray(v) ? v : [v]).map(one).join(', ');
}

function fontFamilyToString(v) {
  const list = Array.isArray(v) ? v : String(v).split(',').map((s) => s.trim());
  return list.map((f) => (/[\s]/.test(f) && !/^["']/.test(f) ? `"${f}"` : f)).join(', ');
}

/** Returns { value } or { skip: reason }. */
function normalizeValue(entry, tokenName) {
  const { value, type } = entry;
  const t = (type || '').toLowerCase();
  if (value == null) return { skip: 'empty value' };
  if (['typography', 'border', 'composition', 'strokestyle', 'transition', 'gradient'].includes(t)) return { skip: `composite type "${t}" has no single-token home` };
  if (t === 'color') return { value: colorToString(value) };
  if (t === 'shadow' || t === 'boxshadow') return { value: shadowToString(value) };
  if (t === 'fontfamily' || t === 'fontfamilies') return { value: fontFamilyToString(value) };
  if (t === 'cubicbezier' && Array.isArray(value)) return { value: `cubic-bezier(${value.join(', ')})` };
  const unit = unitOf(t);
  if (unit) {
    if (isPlainObject(value)) return { value: dimToString(value, unit) };
    if (typeof value === 'number' || /^-?\d+(\.\d+)?$/.test(String(value).trim())) {
      const n = Number(value);
      return { value: n === 0 ? '0' : `${n}${UNITLESS_RE.test(tokenName) ? '' : unit}` };
    }
    return { value: String(value).trim() };
  }
  if (isPlainObject(value)) {
    if ('hex' in value || 'colorSpace' in value) return { value: colorToString(value) };
    if ('value' in value && 'unit' in value) return { value: dimToString(value) };
    return { skip: 'object value of unknown shape' };
  }
  if (Array.isArray(value)) return { value: value.map(String).join(', ') };
  return { value: String(value).trim() };
}

// ---------------------------------------------------------------------------
// Path → cia token name
// ---------------------------------------------------------------------------
function loadContract(ciaRoot) {
  const p = path.join(ciaRoot, 'scripts', 'theme-contract.json');
  const c = JSON.parse(fs.readFileSync(p, 'utf8'));
  return {
    version: c.version,
    required: c.required || [],
    optional: c.optional || [],
    all: new Set([...(c.required || []), ...(c.optional || [])]),
  };
}

function applyPathAliases(p) {
  let out = p;
  for (const [re, to] of PATH_ALIASES) {
    if (re.test(out)) { out = out.replace(re, to); break; }
  }
  return out;
}

/** Returns { token, mapped: true } or { token, mapped: false } (verbatim fallback). */
function mapPath(tokenPath, contract) {
  if (TOKEN_MAP[tokenPath]) return { token: TOKEN_MAP[tokenPath], mapped: true };
  const aliased = applyPathAliases(tokenPath);
  if (TOKEN_MAP[aliased]) return { token: TOKEN_MAP[aliased], mapped: true };
  const generic = `--${aliased.replace(/\./g, '-').toLowerCase()}`;
  if (contract.all.has(generic)) return { token: generic, mapped: true };
  // camelCase segments → kebab (linkHover → link-hover), one more try.
  const kebab = `--${aliased.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/\./g, '-').toLowerCase()}`;
  if (contract.all.has(kebab)) return { token: kebab, mapped: true };
  return { token: generic, mapped: false };
}

// ---------------------------------------------------------------------------
// Base theme — the shipped theme.css a partial file inherits from
// ---------------------------------------------------------------------------
function listBases(ciaRoot) {
  const dir = path.join(ciaRoot, 'public', 'themes');
  try {
    return fs.readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && fs.existsSync(path.join(dir, d.name, 'theme.css')))
      .map((d) => d.name)
      .sort();
  } catch { return []; }
}

function loadBase(ciaRoot, base) {
  const file = path.join(ciaRoot, 'public', 'themes', base, 'theme.css');
  if (!fs.existsSync(file)) {
    const bases = listBases(ciaRoot);
    throw new Error(`unknown base theme "${base}". Available: ${bases.join(', ') || '(none found under public/themes)'}`);
  }
  const validator = require(path.join(ciaRoot, 'scripts', 'theme-validator.js'));
  const text = fs.readFileSync(file, 'utf8');
  const blocks = validator.extractDataThemeBlocks(text);
  const values = blocks.length ? blocks[0].values : validator.extractRootBlock(text).values;
  return { name: base, file, values }; // Map<token, rawValue>
}

// ---------------------------------------------------------------------------
// Paired-mode detection for a single Tokens Studio / DTCG file
// ---------------------------------------------------------------------------
const PAIRS = [['color-light', 'color-dark'], ['light', 'dark'], ['colors-light', 'colors-dark']];

function splitPairedModes(tokens) {
  if (!isPlainObject(tokens)) return null;
  for (const [l, d] of PAIRS) {
    if (isPlainObject(tokens[l]) && isPlainObject(tokens[d])) {
      const rest = {};
      for (const [k, v] of Object.entries(tokens)) if (k !== l && k !== d) rest[k] = v;
      const light = { ...rest, color: tokens[l] };
      const dark = { ...rest, color: tokens[d] };
      return { light, dark, groups: [l, d] };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// One tokens object → Map<token, value> (+ bookkeeping)
// ---------------------------------------------------------------------------
function collect(tokens, format, contract) {
  const declared = new Map();     // token → value
  const unmapped = [];            // { path, emittedAs }
  const skipped = [];             // { path, reason }
  const fromPaths = new Map();    // token → path

  if (format === 'cia-flat') {
    for (const [k, v] of Object.entries(tokens)) {
      if (!k.startsWith('--')) throw new Error(`cia-flat: key "${k}" is not a custom property`);
      declared.set(k, String(v));
      if (!contract.all.has(k)) unmapped.push({ path: k, emittedAs: k });
    }
    return { declared, unmapped, skipped, fromPaths };
  }

  let entries;
  if (format === 'dtcg') entries = flattenDtcg(tokens);
  else {
    const { set } = mergeTokensStudioSets(tokens);
    entries = flattenTokensStudio(set);
  }
  entries = resolveAliases(entries);

  for (const e of entries) {
    const { token, mapped } = mapPath(e.path, contract);
    const norm = normalizeValue(e, token);
    if (norm.skip) { skipped.push({ path: e.path, reason: norm.skip }); continue; }
    declared.set(token, norm.value);
    fromPaths.set(token, e.path);
    if (!mapped) unmapped.push({ path: e.path, emittedAs: token });
  }
  return { declared, unmapped, skipped, fromPaths };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
const NAME_RE = /^[a-z0-9][a-z0-9-]*$/;

function themeFromTokens(opts = {}) {
  const ciaRoot = opts.ciaRoot || CIA_ROOT_DEFAULT;
  const name = String(opts.name || '').trim();
  if (!NAME_RE.test(name)) throw new Error(`name must be a kebab-case slug (got "${opts.name}")`);
  let tokens = typeof opts.tokens === 'string' ? JSON.parse(opts.tokens) : opts.tokens;
  let dark = typeof opts.dark === 'string' ? JSON.parse(opts.dark) : opts.dark || null;
  if (!isPlainObject(tokens)) throw new Error('tokens must be a JSON object (or a JSON string)');

  const contract = loadContract(ciaRoot);
  const base = loadBase(ciaRoot, opts.base || 'boilerplate');
  const mode = opts.mode === 'dark' ? 'dark' : 'light';

  let format = opts.format && opts.format !== 'auto' ? String(opts.format) : detectFormat(tokens);
  if (!['dtcg', 'tokens-studio', 'cia-flat'].includes(format)) throw new Error(`format must be auto | dtcg | tokens-studio | cia-flat (got "${format}")`);

  // A single file with paired light/dark groups is split automatically.
  let pairedGroups = null;
  if (!dark && format !== 'cia-flat') {
    const pair = splitPairedModes(tokens);
    if (pair) { tokens = pair.light; dark = pair.dark; pairedGroups = pair.groups; }
  }
  if (dark && !isPlainObject(dark)) throw new Error('dark must be a JSON object (or a JSON string)');
  const darkFormat = dark ? (opts.format && opts.format !== 'auto' ? format : detectFormat(dark)) : null;

  const light = collect(tokens, format, contract);
  const darkSide = dark ? collect(dark, darkFormat, contract) : null;
  const darkMode = Boolean(darkSide);

  const isColorish = (v) => /^(#|rgb|hsl|hwb|lab|lch|oklab|oklch|color\(|light-dark\()/i.test(String(v).trim()) || /^[a-z]+$/i.test(String(v).trim());
  const valueFor = (token) => {
    const l = light.declared.get(token);
    const d = darkSide ? darkSide.declared.get(token) : undefined;
    if (l == null && d == null) return undefined;
    if (d != null && l != null && d !== l && (isColorish(l) || isColorish(d))) return `light-dark(${l}, ${d})`;
    if (l == null) return darkMode ? `light-dark(${d}, ${d})` : d;
    return l;
  };

  const lines = [];
  const fromTokens = [];
  const inherited = [];
  const optionalDeclared = [];

  for (const token of contract.required) {
    const v = valueFor(token);
    if (v !== undefined) { lines.push([token, v]); fromTokens.push(token); continue; }
    const b = base.values.get(token);
    if (b === undefined) throw new Error(`base theme "${base.name}" does not declare required token ${token}; refusing to emit an incomplete theme`);
    lines.push([token, b]);
    inherited.push(token);
  }
  for (const token of contract.optional) {
    const v = valueFor(token);
    if (v !== undefined) { lines.push([token, v]); fromTokens.push(token); optionalDeclared.push(token); }
  }
  const seen = new Set(lines.map(([t]) => t));
  const extras = [];
  for (const [token, v] of light.declared) if (!seen.has(token)) { extras.push([token, valueFor(token)]); seen.add(token); }
  if (darkSide) for (const [token] of darkSide.declared) if (!seen.has(token)) { extras.push([token, valueFor(token)]); seen.add(token); }
  extras.sort((a, b) => a[0].localeCompare(b[0]));

  const scheme = darkMode ? 'light dark' : mode;
  const header =
    `/* css-is-awesome theme "${name}" — generated by tokens-to-theme ${GENERATOR_VERSION}\n` +
    `   source: ${format}${darkSide ? ` (+ dark side${pairedGroups ? `, paired groups ${pairedGroups.join('/')}` : ''})` : ''} · base: ${base.name} · contract ${contract.version}\n` +
    `   ${fromTokens.length} token(s) from the design file, ${inherited.length} inherited from the base, ${extras.length} passed through verbatim */\n`;
  const body =
    `:root, :root[data-theme="${name}"] {\n` +
    `  color-scheme: ${scheme};\n` +
    [...lines, ...extras].map(([t, v]) => `  ${t}: ${v};`).join('\n') +
    `\n}\n`;
  const css = header + body;

  const optionalMissing = contract.optional.filter((t) => !seen.has(t));
  const report = {
    name,
    format,
    base: base.name,
    darkMode,
    pairedGroups,
    fromTokens,
    inherited,
    unmapped: [...light.unmapped, ...(darkSide ? darkSide.unmapped.filter((u) => !light.unmapped.some((x) => x.emittedAs === u.emittedAs)) : [])],
    skipped: [...light.skipped, ...(darkSide ? darkSide.skipped : [])],
    optionalDeclared,
    optionalMissing,
    counts: { fromTokens: fromTokens.length, inherited: inherited.length, unmapped: light.unmapped.length, skipped: light.skipped.length },
  };

  let validation = null;
  if (opts.validate !== false) {
    const validator = require(path.join(ciaRoot, 'scripts', 'theme-validator.js'));
    validation = validator.validateText(css, validator.loadContract(), { label: name });
    validation.a11ySummary = summarizeA11y(validation);
  }
  return { css, report, validation };
}

function summarizeA11y(validation) {
  const audits = validation.mode === 'consolidated'
    ? (validation.themes || []).flatMap((t) => t.a11y || [])
    : validation.a11y || [];
  const s = { fail: 0, warn: 0, pass: 0, info: 0, skip: 0 };
  for (const r of audits) if (s[r.status] != null) s[r.status]++;
  return s;
}

module.exports = {
  themeFromTokens,
  detectFormat,
  flattenDtcg,
  flattenTokensStudio,
  mergeTokensStudioSets,
  resolveAliases,
  normalizeValue,
  mapPath,
  listBases,
  TOKEN_MAP,
  PATH_ALIASES,
  GENERATOR_VERSION,
};
