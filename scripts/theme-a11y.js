/* eslint-disable */
'use strict';

const AUDIT_PAIRS = [
  { fg: '--text-primary',   bg: '--paper',                    required: 4.5, kind: 'text',       note: 'primary body text on the page background' },
  { fg: '--text-secondary', bg: '--paper',                    required: 4.5, kind: 'text',       note: 'secondary body text on the page background' },
  { fg: '--text-tertiary',  bg: '--paper',                    required: 3.0, kind: 'large-text', warnIfBelow: 4.5, note: 'tertiary text - legal at large sizes; warn if used as body' },
  { fg: '--text-muted',     bg: '--paper',                    required: 4.5, kind: 'text',       note: 'muted UI text on the page background' },
  { fg: '--ink',            bg: '--paper',                    required: 4.5, kind: 'text',       note: 'native ink on native paper' },
  { fg: '--ink-soft',       bg: '--paper',                    required: 4.5, kind: 'text',       note: 'soft ink on native paper' },
  { fg: '--ink-faint',      bg: '--paper',                    required: 3.0, kind: 'large-text', warnIfBelow: 4.5, note: 'faint ink - large/UI only; warn if used as body' },
  { fg: '--text-link',      bg: '--paper',                    required: 4.5, kind: 'text',       note: 'inline link color on the page background' },
  { fg: '--text-inverse',   bg: '--action-primary-default',   required: 4.5, kind: 'text',       note: 'button label on the primary action surface' },
  { fg: '--text-inverse',   bg: '--ai',                       required: 4.5, kind: 'text',       note: 'inverse text on the AI/brand accent surface' },
  { fg: '--success-text',   bg: '--success-subtle',           required: 4.5, kind: 'text',       note: 'success message text on its subtle background' },
  { fg: '--warning-text',   bg: '--warning-subtle',           required: 4.5, kind: 'text',       note: 'warning message text on its subtle background' },
  { fg: '--error-text',     bg: '--error-subtle',             required: 4.5, kind: 'text',       note: 'error message text on its subtle background' },
  { fg: '--info-text',      bg: '--info-subtle',              required: 4.5, kind: 'text',       note: 'info message text on its subtle background' },
  { fg: '--border-default', bg: '--paper',                    required: 3.0, kind: 'non-text',   note: 'default border against the page background' },
  { fg: '--border-focus',   bg: '--paper',                    required: 3.0, kind: 'non-text',   note: 'focus ring against the page background' },
  { fg: '--shu',            bg: '--paper',                    required: 3.0, kind: 'non-text',   note: 'seal accent - must read as a UI mark on paper' },
];

const NAMED_COLORS = Object.freeze({
  aliceblue:[240,248,255],antiquewhite:[250,235,215],aqua:[0,255,255],aquamarine:[127,255,212],
  azure:[240,255,255],beige:[245,245,220],bisque:[255,228,196],black:[0,0,0],
  blanchedalmond:[255,235,205],blue:[0,0,255],blueviolet:[138,43,226],brown:[165,42,42],
  burlywood:[222,184,135],cadetblue:[95,158,160],chartreuse:[127,255,0],chocolate:[210,105,30],
  coral:[255,127,80],cornflowerblue:[100,149,237],cornsilk:[255,248,220],crimson:[220,20,60],
  cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgoldenrod:[184,134,11],
  darkgray:[169,169,169],darkgreen:[0,100,0],darkgrey:[169,169,169],darkkhaki:[189,183,107],
  darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],
  darkred:[139,0,0],darksalmon:[233,150,122],darkseagreen:[143,188,143],darkslateblue:[72,61,139],
  darkslategray:[47,79,79],darkslategrey:[47,79,79],darkturquoise:[0,206,209],darkviolet:[148,0,211],
  deeppink:[255,20,147],deepskyblue:[0,191,255],dimgray:[105,105,105],dimgrey:[105,105,105],
  dodgerblue:[30,144,255],firebrick:[178,34,34],floralwhite:[255,250,240],forestgreen:[34,139,34],
  fuchsia:[255,0,255],gainsboro:[220,220,220],ghostwhite:[248,248,255],gold:[255,215,0],
  goldenrod:[218,165,32],gray:[128,128,128],green:[0,128,0],greenyellow:[173,255,47],
  grey:[128,128,128],honeydew:[240,255,240],hotpink:[255,105,180],indianred:[205,92,92],
  indigo:[75,0,130],ivory:[255,255,240],khaki:[240,230,140],lavender:[230,230,250],
  lavenderblush:[255,240,245],lawngreen:[124,252,0],lemonchiffon:[255,250,205],lightblue:[173,216,230],
  lightcoral:[240,128,128],lightcyan:[224,255,255],lightgoldenrodyellow:[250,250,210],lightgray:[211,211,211],
  lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightsalmon:[255,160,122],
  lightseagreen:[32,178,170],lightskyblue:[135,206,250],lightslategray:[119,136,153],lightslategrey:[119,136,153],
  lightsteelblue:[176,196,222],lightyellow:[255,255,224],lime:[0,255,0],limegreen:[50,205,50],
  linen:[250,240,230],magenta:[255,0,255],maroon:[128,0,0],mediumaquamarine:[102,205,170],
  mediumblue:[0,0,205],mediumorchid:[186,85,211],mediumpurple:[147,112,219],mediumseagreen:[60,179,113],
  mediumslateblue:[123,104,238],mediumspringgreen:[0,250,154],mediumturquoise:[72,209,204],mediumvioletred:[199,21,133],
  midnightblue:[25,25,112],mintcream:[245,255,250],mistyrose:[255,228,225],moccasin:[255,228,181],
  navajowhite:[255,222,173],navy:[0,0,128],oldlace:[253,245,230],olive:[128,128,0],
  olivedrab:[107,142,35],orange:[255,165,0],orangered:[255,69,0],orchid:[218,112,214],
  palegoldenrod:[238,232,170],palegreen:[152,251,152],paleturquoise:[175,238,238],palevioletred:[219,112,147],
  papayawhip:[255,239,213],peachpuff:[255,218,185],peru:[205,133,63],pink:[255,192,203],
  plum:[221,160,221],powderblue:[176,224,230],purple:[128,0,128],rebeccapurple:[102,51,153],
  red:[255,0,0],rosybrown:[188,143,143],royalblue:[65,105,225],saddlebrown:[139,69,19],
  salmon:[250,128,114],sandybrown:[244,164,96],seagreen:[46,139,87],seashell:[255,245,238],
  sienna:[160,82,45],silver:[192,192,192],skyblue:[135,206,235],slateblue:[106,90,205],
  slategray:[112,128,144],slategrey:[112,128,144],snow:[255,250,250],springgreen:[0,255,127],
  steelblue:[70,130,180],tan:[210,180,140],teal:[0,128,128],thistle:[216,191,216],
  tomato:[255,99,71],turquoise:[64,224,208],violet:[238,130,238],wheat:[245,222,179],
  white:[255,255,255],whitesmoke:[245,245,245],yellow:[255,255,0],yellowgreen:[154,205,50]
});

class UnsupportedColor extends Error {
  constructor(reason, raw) { super('unsupported color (' + reason + '): ' + raw); this.name = 'UnsupportedColor'; this.reason = reason; this.raw = raw; }
}
class InvalidColor extends Error {
  constructor(raw) { super('invalid color: ' + raw); this.name = 'InvalidColor'; this.raw = raw; }
}

function clamp01(n) { if (n < 0) return 0; if (n > 1) return 1; return n; }

function parseAlpha(raw) {
  const s = String(raw).trim();
  if (s.endsWith('%')) return clamp01(parseFloat(s) / 100);
  const n = parseFloat(s);
  if (!Number.isFinite(n)) return 1;
  return clamp01(n);
}

function parseChannel(raw) {
  const s = String(raw).trim();
  if (s.endsWith('%')) return Math.max(0, Math.min(255, (parseFloat(s) / 100) * 255));
  const n = parseFloat(s);
  if (!Number.isFinite(n)) throw new InvalidColor(raw);
  return Math.max(0, Math.min(255, n));
}

function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r1 = 0, g1 = 0, b1 = 0;
  if (h < 60)       { r1 = c; g1 = x; b1 = 0; }
  else if (h < 120) { r1 = x; g1 = c; b1 = 0; }
  else if (h < 180) { r1 = 0; g1 = c; b1 = x; }
  else if (h < 240) { r1 = 0; g1 = x; b1 = c; }
  else if (h < 300) { r1 = x; g1 = 0; b1 = c; }
  else              { r1 = c; g1 = 0; b1 = x; }
  return [(r1 + m) * 255, (g1 + m) * 255, (b1 + m) * 255];
}

function tokenizeFnArgs(inner) {
  if (inner.indexOf(',') >= 0) return inner.split(',').map(function(s){return s.trim();}).filter(Boolean);
  const slashIdx = inner.indexOf('/');
  if (slashIdx >= 0) {
    const left = inner.slice(0, slashIdx).trim();
    const right = inner.slice(slashIdx + 1).trim();
    return left.split(/\s+/).filter(Boolean).concat([right]);
  }
  return inner.split(/\s+/).filter(Boolean);
}

function stripValueComments(s) { return String(s).replace(/\/\*[\s\S]*?\*\//g, '').trim(); }

function parseColor(rawValue) {
  if (rawValue == null) throw new InvalidColor(String(rawValue));
  let s = stripValueComments(rawValue).toLowerCase();
  if (s === '' || s === 'none') throw new InvalidColor(rawValue);
  if (s === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  if (s === 'currentcolor' || s === 'inherit' || s === 'initial' || s === 'unset' || s === 'revert') {
    throw new UnsupportedColor('keyword', rawValue);
  }

  if (s.charAt(0) === '#') {
    const h = s.slice(1);
    let r, g, b, a = 1;
    if (h.length === 3 || h.length === 4) {
      if (!/^[0-9a-f]+$/.test(h)) throw new InvalidColor(rawValue);
      r = parseInt(h.charAt(0) + h.charAt(0), 16);
      g = parseInt(h.charAt(1) + h.charAt(1), 16);
      b = parseInt(h.charAt(2) + h.charAt(2), 16);
      if (h.length === 4) a = parseInt(h.charAt(3) + h.charAt(3), 16) / 255;
    } else if (h.length === 6 || h.length === 8) {
      if (!/^[0-9a-f]+$/.test(h)) throw new InvalidColor(rawValue);
      r = parseInt(h.slice(0, 2), 16);
      g = parseInt(h.slice(2, 4), 16);
      b = parseInt(h.slice(4, 6), 16);
      if (h.length === 8) a = parseInt(h.slice(6, 8), 16) / 255;
    } else {
      throw new InvalidColor(rawValue);
    }
    return { r: r, g: g, b: b, a: a };
  }

  const fnMatch = /^(rgba?|hsla?)\(([^)]+)\)$/.exec(s);
  if (fnMatch) {
    const fn = fnMatch[1];
    const args = tokenizeFnArgs(fnMatch[2]);
    if (fn === 'rgb' || fn === 'rgba') {
      if (args.length < 3 || args.length > 4) throw new InvalidColor(rawValue);
      const r = parseChannel(args[0]);
      const g = parseChannel(args[1]);
      const b = parseChannel(args[2]);
      const a = args.length === 4 ? parseAlpha(args[3]) : 1;
      return { r: r, g: g, b: b, a: a };
    }
    if (args.length < 3 || args.length > 4) throw new InvalidColor(rawValue);
    let h = parseFloat(args[0]);
    if (!Number.isFinite(h)) throw new InvalidColor(rawValue);
    if (args[0].endsWith('rad')) h = (h * 180) / Math.PI;
    else if (args[0].endsWith('grad')) h = (h * 360) / 400;
    else if (args[0].endsWith('turn')) h = h * 360;
    const sRaw = args[1];
    const lRaw = args[2];
    if (!sRaw.endsWith('%') || !lRaw.endsWith('%')) throw new InvalidColor(rawValue);
    const sat = clamp01(parseFloat(sRaw) / 100);
    const lig = clamp01(parseFloat(lRaw) / 100);
    const a = args.length === 4 ? parseAlpha(args[3]) : 1;
    const rgb = hslToRgb(h, sat, lig);
    return { r: rgb[0], g: rgb[1], b: rgb[2], a: a };
  }

  if (/^(oklch|oklab|lab|lch|hwb|color|color-mix)\b/.test(s)) {
    const reason = s.split(/[(\s]/, 1)[0];
    throw new UnsupportedColor(reason, rawValue);
  }

  if (Object.prototype.hasOwnProperty.call(NAMED_COLORS, s)) {
    const arr = NAMED_COLORS[s];
    return { r: arr[0], g: arr[1], b: arr[2], a: 1 };
  }

  throw new InvalidColor(rawValue);
}

function linearize(c8) {
  const c = c8 / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(rgb) {
  const R = linearize(rgb.r);
  const G = linearize(rgb.g);
  const B = linearize(rgb.b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(c1, c2) {
  const L1 = relativeLuminance(c1);
  const L2 = relativeLuminance(c2);
  const light = Math.max(L1, L2);
  const dark  = Math.min(L1, L2);
  return (light + 0.05) / (dark + 0.05);
}

function composite(fg, bg) {
  const a = fg.a;
  if (a >= 1) return { r: fg.r, g: fg.g, b: fg.b, a: 1 };
  const r = fg.r * a + bg.r * (1 - a);
  const g = fg.g * a + bg.g * (1 - a);
  const b = fg.b * a + bg.b * (1 - a);
  return { r: r, g: g, b: b, a: 1 };
}

function extractTokenValuesFromBlock(blockBody) {
  const out = new Map();
  const re = /(--[A-Za-z_][A-Za-z0-9_-]*)\s*:/g;
  let m;
  while ((m = re.exec(blockBody)) !== null) {
    const name = m[1];
    let i = m.index + m[0].length;
    let depth = 0;
    let value = '';
    while (i < blockBody.length) {
      const ch = blockBody.charAt(i);
      if (ch === '(') depth++;
      else if (ch === ')') depth--;
      else if (ch === ';' && depth === 0) break;
      else if (ch === '}' && depth === 0) break;
      value += ch;
      i++;
    }
    out.set(name, value.trim());
  }
  return out;
}

function resolveTokenValue(tokenName, values, globals) {
  const seen = new Set();
  const chain = [];
  let current = tokenName;
  while (true) {
    if (seen.has(current)) return { value: null, chain: chain, error: 'cycle detected at ' + current };
    seen.add(current);
    chain.push(current);
    let raw = values.get(current);
    if (raw == null && globals) raw = globals.get(current);
    if (raw == null) return { value: null, chain: chain, error: 'undefined token ' + current };
    raw = stripValueComments(raw);
    const varOnly = /^var\(\s*(--[A-Za-z_][A-Za-z0-9_-]*)\s*(?:,\s*([^)]*))?\)$/.exec(raw);
    if (varOnly) {
      const refName = varOnly[1];
      if (values.has(refName) || (globals && globals.has(refName))) { current = refName; continue; }
      const fallback = (varOnly[2] || '').trim();
      if (fallback) return { value: fallback, chain: chain.concat(['(fallback) ' + fallback]), error: null };
      return { value: null, chain: chain, error: 'undefined var ref ' + refName };
    }
    return { value: raw, chain: chain, error: null };
  }
}

function resolveColor(tokenName, values, globals) {
  const r = resolveTokenValue(tokenName, values, globals);
  if (!r.value) return { error: r.error, raw: null, chain: r.chain };
  try {
    const rgba = parseColor(r.value);
    return { rgba: rgba, raw: r.value, chain: r.chain };
  } catch (err) {
    return { error: err.message, raw: r.value, chain: r.chain, errorKind: err.name };
  }
}

function auditThemeTokens(env, options) {
  const opts = options || {};
  const warnMargin = typeof opts.warnMargin === 'number' ? opts.warnMargin : 0.5;
  const out = [];

  const paperResolved = env.values.has('--paper')
    ? resolveColor('--paper', env.values, env.globals)
    : null;
  const paperRgba = paperResolved && paperResolved.rgba
    ? paperResolved.rgba
    : { r: 255, g: 255, b: 255, a: 1 };

  for (const pair of AUDIT_PAIRS) {
    const fg = resolveColor(pair.fg, env.values, env.globals);
    const bg = resolveColor(pair.bg, env.values, env.globals);

    if (fg.errorKind === 'UnsupportedColor' || bg.errorKind === 'UnsupportedColor') {
      out.push({
        pair: pair, status: 'skip',
        skipReason: 'unsupported color space (oklch/oklab/etc.)',
        fgRaw: fg.raw, bgRaw: bg.raw,
      });
      continue;
    }

    if (fg.error || bg.error) {
      out.push({
        pair: pair, status: 'skip',
        skipReason: fg.error ? (pair.fg + ': ' + fg.error) : (pair.bg + ': ' + bg.error),
        fgRaw: fg.raw, bgRaw: bg.raw,
      });
      continue;
    }

    const bgOpaque = bg.rgba.a < 1 ? composite(bg.rgba, paperRgba) : bg.rgba;
    const fgOpaque = fg.rgba.a < 1 ? composite(fg.rgba, bgOpaque) : fg.rgba;

    const ratio = contrastRatio(fgOpaque, bgOpaque);
    const required = pair.required;
    let status;
    if (ratio + 1e-6 < required) status = 'fail';
    else if (typeof pair.warnIfBelow === 'number' ? ratio + 1e-6 < pair.warnIfBelow : ratio < required + warnMargin) status = 'warn';
    else status = 'pass';

    out.push({
      pair: pair, status: status, ratio: ratio, required: required, kind: pair.kind, note: pair.note,
      fgRaw: fg.raw, bgRaw: bg.raw, fgChain: fg.chain, bgChain: bg.chain,
    });
  }
  return out;
}

module.exports = {
  AUDIT_PAIRS: AUDIT_PAIRS,
  parseColor: parseColor,
  relativeLuminance: relativeLuminance,
  contrastRatio: contrastRatio,
  composite: composite,
  resolveTokenValue: resolveTokenValue,
  resolveColor: resolveColor,
  extractTokenValuesFromBlock: extractTokenValuesFromBlock,
  auditThemeTokens: auditThemeTokens,
  UnsupportedColor: UnsupportedColor,
  InvalidColor: InvalidColor,
};
