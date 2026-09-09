// Live WCAG contrast for the theme editor (v1.2 EPIC-07 F3.1).
//
// AUDIT_PAIRS is a REAL shared import — scripts/audit-pairs.json is the same
// file scripts/theme-a11y.js reads for the CI contrast audit, via
// resolveJsonModule (no ambient declarations needed).
//
// The relative-luminance/contrast-ratio MATH below is a deliberate port, not
// a shared import: tsconfig.json sets `allowJs: false`, so a CJS `.js` module
// like theme-a11y.js can't be imported into a `.ts` file without adding a
// fragile ambient `declare module` shim. The algorithm itself is WCAG 2.x's
// fixed, versioned spec (relative luminance + (L1+0.05)/(L2+0.05)) — not
// something that drifts — so porting it is a one-time cost, not an ongoing
// sync burden. If it ever needs to change, change both call sites; the pair
// DATA above is what actually gets curated over time, and that stays shared.

import auditPairs from "../../scripts/audit-pairs.json";

export type AuditPair = {
  fg: string;
  bg: string;
  required: number;
  kind: string;
  note: string;
  warnIfBelow?: number;
  decorative?: boolean;
};

export const AUDIT_PAIRS: AuditPair[] = auditPairs as AuditPair[];

type RGBA = { r: number; g: number; b: number; a: number };

const NAMED_COLORS: Record<string, [number, number, number]> = {
  black: [0, 0, 0], white: [255, 255, 255], red: [255, 0, 0], green: [0, 128, 0],
  blue: [0, 0, 255], gray: [128, 128, 128], grey: [128, 128, 128],
  transparent: [0, 0, 0],
};

function clamp01(n: number): number {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

function parseChannel(raw: string): number {
  const s = raw.trim();
  if (s.endsWith("%")) return Math.max(0, Math.min(255, (parseFloat(s) / 100) * 255));
  return Math.max(0, Math.min(255, parseFloat(s)));
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r1 = 0, g1 = 0, b1 = 0;
  if (h < 60) { r1 = c; g1 = x; b1 = 0; }
  else if (h < 120) { r1 = x; g1 = c; b1 = 0; }
  else if (h < 180) { r1 = 0; g1 = c; b1 = x; }
  else if (h < 240) { r1 = 0; g1 = x; b1 = c; }
  else if (h < 300) { r1 = x; g1 = 0; b1 = c; }
  else { r1 = c; g1 = 0; b1 = x; }
  return [(r1 + m) * 255, (g1 + m) * 255, (b1 + m) * 255];
}

/** Same coverage as theme-a11y.js's parseColor for the cases the editor's
 * colour rows can actually produce: #hex(a), rgb()/rgba(), hsl()/hsla(), and
 * a small named-colour set. oklch/lab/etc. throw, same as theme-a11y.js. */
export function parseColor(raw: string): RGBA {
  const s = raw.trim().toLowerCase();
  if (!s) throw new Error(`invalid color: ${raw}`);

  if (s[0] === "#") {
    const h = s.slice(1);
    let r: number, g: number, b: number, a = 1;
    if (h.length === 3 || h.length === 4) {
      if (!/^[0-9a-f]+$/.test(h)) throw new Error(`invalid color: ${raw}`);
      r = parseInt(h[0] + h[0], 16);
      g = parseInt(h[1] + h[1], 16);
      b = parseInt(h[2] + h[2], 16);
      if (h.length === 4) a = parseInt(h[3] + h[3], 16) / 255;
    } else if (h.length === 6 || h.length === 8) {
      if (!/^[0-9a-f]+$/.test(h)) throw new Error(`invalid color: ${raw}`);
      r = parseInt(h.slice(0, 2), 16);
      g = parseInt(h.slice(2, 4), 16);
      b = parseInt(h.slice(4, 6), 16);
      if (h.length === 8) a = parseInt(h.slice(6, 8), 16) / 255;
    } else {
      throw new Error(`invalid color: ${raw}`);
    }
    return { r, g, b, a };
  }

  const fnMatch = /^(rgba?|hsla?)\(([^)]+)\)$/.exec(s);
  if (fnMatch) {
    const fn = fnMatch[1];
    const args = fnMatch[2].split(/[,/]/).map((p) => p.trim()).filter(Boolean);
    if (fn === "rgb" || fn === "rgba") {
      if (args.length < 3) throw new Error(`invalid color: ${raw}`);
      const a = args.length === 4 ? clamp01(parseFloat(args[3])) : 1;
      return { r: parseChannel(args[0]), g: parseChannel(args[1]), b: parseChannel(args[2]), a };
    }
    if (args.length < 3) throw new Error(`invalid color: ${raw}`);
    const h = parseFloat(args[0]);
    const sat = clamp01(parseFloat(args[1]) / 100);
    const lig = clamp01(parseFloat(args[2]) / 100);
    const a = args.length === 4 ? clamp01(parseFloat(args[3])) : 1;
    const [r, g, b] = hslToRgb(h, sat, lig);
    return { r, g, b, a };
  }

  if (NAMED_COLORS[s]) {
    const [r, g, b] = NAMED_COLORS[s];
    return { r, g, b, a: s === "transparent" ? 0 : 1 };
  }

  throw new Error(`unsupported or invalid color: ${raw}`);
}

function linearize(c8: number): number {
  const c = c8 / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(rgb: RGBA): number {
  return 0.2126 * linearize(rgb.r) + 0.7152 * linearize(rgb.g) + 0.0722 * linearize(rgb.b);
}

export function contrastRatio(c1: RGBA, c2: RGBA): number {
  const l1 = relativeLuminance(c1);
  const l2 = relativeLuminance(c2);
  const light = Math.max(l1, l2);
  const dark = Math.min(l1, l2);
  return (light + 0.05) / (dark + 0.05);
}

function mix(a: RGBA, b: RGBA, t: number): RGBA {
  return { r: a.r + (b.r - a.r) * t, g: a.g + (b.g - a.g) * t, b: a.b + (b.b - a.b) * t, a: 1 };
}

function toHex(c: RGBA): string {
  const h = (n: number) => Math.round(clamp01(n / 255) * 255).toString(16).padStart(2, "0");
  return `#${h(c.r)}${h(c.g)}${h(c.b)}`;
}

/** Nudge `fgHex` toward black or white (whichever raises contrast against
 * `bgHex`) until it clears `required`, via binary search on the blend
 * factor. Returns a hex string, or null if even full black/white can't
 * reach it (only possible when `bgHex` itself is unparsable/mid-contrast
 * to both ends, effectively never for a real theme background). */
export function nearestPassingColor(fgHex: string, bgHex: string, required: number): string | null {
  let fg: RGBA, bg: RGBA;
  try {
    fg = parseColor(fgHex);
    bg = parseColor(bgHex);
  } catch {
    return null;
  }
  const target: RGBA = relativeLuminance(bg) > 0.5 ? { r: 0, g: 0, b: 0, a: 1 } : { r: 255, g: 255, b: 255, a: 1 };
  if (contrastRatio(target, bg) + 1e-6 < required) return null;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (contrastRatio(mix(fg, target, mid), bg) + 1e-6 >= required) hi = mid;
    else lo = mid;
  }
  return toHex(mix(fg, target, hi));
}
