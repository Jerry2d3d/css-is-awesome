/**
 * cia migrate bootstrap — parse a Bootstrap _variables.scss + map to cia.
 *
 * US-03.2.1 + US-03.2.2 (PR 4 of EPIC-03). Same shape as migrate-tailwind:
 *   1. Parse the input file (Bootstrap variables in this case)
 *   2. Map to cia contract tokens with confidence levels
 *   3. Write a cia theme.scss (via writeThemeScss from migrate-tailwind.cjs)
 *
 * cia migrate bootstrap leans on Bootstrap's well-established variable
 * naming convention. Bootstrap's $primary maps to cia's action-primary-
 * default; $body-bg maps to background-default; $border-radius to
 * radius-md, etc. Some Bootstrap variables ($light, $dark utility colors;
 * Sass map values like $spacers) don't have a clean cia analog and surface
 * in the UNMAPPED block for manual review.
 */
'use strict';

const fs = require('fs');
const path = require('path');

// Shared writer + flag parser from the Tailwind module — no need to fork.
const {
  writeThemeScss,
  parseFlags,
  parseRem,
  closestByRem,
  CIA_RADII,
  CIA_FONT_SIZES,
} = require('./migrate-tailwind.cjs');

// ─── Bootstrap variable parser ───────────────────────────────────────────────

// Walk a SCSS file line-by-line. Capture `$var: value [!default];` patterns,
// honoring parenthesis balance so multi-line map/list literals don't split.
// Returns an object: { name: value }, with $ prefix stripped. !default
// declarations capture the value; later non-default declarations overwrite.
function parseBootstrapVars(scssText) {
  const vars = {};
  const lines = scssText.split(/\r?\n/);
  let buffer = '';
  let parenDepth = 0;

  for (const rawLine of lines) {
    // Strip line comments (but preserve in-string // — rare in Bootstrap)
    const line = rawLine.replace(/\/\/.*$/, '').trim();
    if (!line && parenDepth === 0) {
      // Blank line outside an open paren ends any unterminated statement
      buffer = '';
      continue;
    }
    if (!line) continue;

    buffer += (buffer ? ' ' : '') + line;
    for (const ch of line) {
      if (ch === '(') parenDepth++;
      else if (ch === ')') parenDepth = Math.max(0, parenDepth - 1);
    }

    if (parenDepth === 0 && buffer.endsWith(';')) {
      const stmt = buffer.slice(0, -1).trim();
      // Match $name: value [!default]
      const m = stmt.match(/^(\$[\w-]+)\s*:\s*([\s\S]+?)(\s*!default)?\s*$/);
      if (m) {
        const [, name, rawValue, isDefault] = m;
        const value = rawValue.trim();
        const key = name.slice(1);
        // Honor Bootstrap's override convention: non-default wins over default;
        // we record the most recent non-default, else the most recent default.
        const existing = vars[key];
        const incomingIsDefault = !!isDefault;
        if (!existing || !existing.isDefault || incomingIsDefault === false) {
          vars[key] = { value, isDefault: incomingIsDefault };
        }
      }
      buffer = '';
    }
  }

  // Strip the {value, isDefault} envelope — just return value strings, but
  // keep an isDefault map for diagnostics.
  const out = {};
  const meta = {};
  for (const [k, v] of Object.entries(vars)) {
    out[k] = v.value;
    meta[k] = { isDefault: v.isDefault };
  }
  return { vars: out, meta };
}

// ─── Bootstrap → cia mapping ─────────────────────────────────────────────────

// Bootstrap variable names → cia contract token slot.
// HIGH-confidence mappings: semantic alignment is well-established.
const BOOTSTRAP_DIRECT_MAP = {
  // Status / brand colors
  primary: 'action-primary-default',
  secondary: 'action-secondary-default',
  success: 'success-default',
  info: 'info-default',
  warning: 'warning-default',
  danger: 'error-default', // Bootstrap "danger" → cia "error"

  // Surfaces + text
  'body-bg': 'background-default',
  'body-color': 'text-primary',
  'body-secondary-bg': 'background-subtle',
  'body-tertiary-bg': 'surface-muted',
  'body-secondary-color': 'text-secondary',
  'body-tertiary-color': 'text-muted',

  // Border
  'border-color': 'border-default',
  'border-color-translucent': 'border-subtle',

  // Type
  'font-family-base': 'font-sans',
  'font-family-monospace': 'font-mono',
  'font-family-serif': 'font-serif',

  // Spacing baseline
  spacer: 'space-4',
};

// Bootstrap utility colors that have NO clean cia analog — list explicitly so
// the UNMAPPED block can carry helpful guidance.
const BOOTSTRAP_UTILITY_COLORS = new Set([
  'light', 'dark', 'white', 'black', 'gray',
]);

// Variables whose value is a Sass expression / variable reference we can't
// resolve without a full Sass evaluator. Surfaces as UNMAPPED with a note.
function isUnresolvableExpression(value) {
  if (typeof value !== 'string') return true;
  const trimmed = value.trim();
  // Map / list literals
  if (trimmed.startsWith('(')) return true;
  // Sass variable reference (e.g. `$white`, `$gray-900`)
  if (trimmed.startsWith('$')) return true;
  // Math expression with named vars (heuristic: contains $ followed by word)
  if (/\$[a-z]/i.test(trimmed)) return true;
  return false;
}

// Strip Sass-isms from a value where possible (var(--bs-...) wrappers etc.)
function cleanValue(value) {
  if (typeof value !== 'string') return value;
  // Bootstrap 5+ uses var(--bs-font-sans-serif) etc.; pass through as-is —
  // these are valid CSS at runtime.
  return value.trim();
}

function mapBootstrapToCia(vars, meta) {
  const mappings = {};
  const unmapped = [];

  for (const [name, rawValue] of Object.entries(vars)) {
    const value = cleanValue(rawValue);
    const sourceLabel = `\$${name}${meta[name] && meta[name].isDefault ? ' !default' : ''}`;

    // 1) Direct mapping table — HIGH confidence semantic match
    if (BOOTSTRAP_DIRECT_MAP[name]) {
      if (isUnresolvableExpression(value)) {
        unmapped.push({
          source: sourceLabel,
          value,
          reason: `'\$${name}' references another Sass variable or expression we can't evaluate without compiling. Resolve manually (e.g. paste the literal hex/rem value) then re-run.`,
        });
        continue;
      }
      mappings[BOOTSTRAP_DIRECT_MAP[name]] = {
        value,
        source: sourceLabel,
        confidence: 'HIGH',
        rationale: `Bootstrap '\$${name}' → cia '${BOOTSTRAP_DIRECT_MAP[name]}' (semantic equivalent in established Bootstrap convention).`,
      };
      continue;
    }

    // 2) Border radius family — closest cia radius by rem proximity
    if (/^border-radius(-[\w-]+)?$/.test(name)) {
      if (name === 'border-radius') {
        // Bootstrap's default border-radius → cia radius-md per convention
        if (!isUnresolvableExpression(value)) {
          mappings['radius-md'] = {
            value,
            source: sourceLabel,
            confidence: 'HIGH',
            rationale: `Bootstrap's '\$border-radius' (base) → cia radius-md by convention.`,
          };
          continue;
        }
      }
      // border-radius-sm / -lg / -xl etc. — rem proximity
      const rem = parseRem(value);
      if (rem != null) {
        const match = closestByRem(rem, CIA_RADII);
        if (match && match.key !== 'full' && match.key !== 'none') {
          const slot = `radius-${match.key}`;
          mappings[slot] = {
            value: `${match.value}rem`,
            source: sourceLabel,
            twRem: rem,
            ciaRem: match.value,
            deltaRem: match.deltaRem,
            confidence: match.confidence,
            rationale: match.confidence === 'HIGH'
              ? `Bootstrap '\$${name}' (${rem}rem) → cia ${slot} (exact match).`
              : `Bootstrap '\$${name}' (${rem}rem) → cia ${slot} (${match.value}rem); delta ${match.deltaRem.toFixed(4)}rem.`,
          };
          continue;
        }
      }
      unmapped.push({
        source: sourceLabel,
        value,
        reason: `Could not place '\$${name}' on cia's radius scale.`,
      });
      continue;
    }

    // 3) Font sizes — Bootstrap has font-size-base, font-size-sm, etc.
    if (name === 'font-size-base') {
      if (!isUnresolvableExpression(value)) {
        const rem = parseRem(value);
        if (rem != null) {
          // 1rem is Bootstrap's default = cia font-size-3 (1rem)
          mappings['font-size-3'] = {
            value,
            source: sourceLabel,
            confidence: 'HIGH',
            rationale: `Bootstrap '\$font-size-base' (typically 1rem) → cia font-size-3 by convention.`,
          };
          continue;
        }
      }
    }
    if (/^font-size-(sm|lg|xl|xxl)$/.test(name)) {
      const rem = parseRem(value);
      if (rem != null) {
        const match = closestByRem(rem, CIA_FONT_SIZES);
        if (match) {
          mappings[`font-size-${match.key}`] = {
            value: `${match.value}rem`,
            source: sourceLabel,
            confidence: match.confidence,
            rationale: `Bootstrap '\$${name}' (${rem}rem) → cia font-size-${match.key} (${match.value}rem); delta ${match.deltaRem.toFixed(4)}rem.`,
          };
          continue;
        }
      }
    }

    // 4) line-height-base → cia line-height-4 (1.5 by convention)
    if (name === 'line-height-base') {
      // Bootstrap default is 1.5; cia line-height-4 is 1.5
      unmapped.push({
        source: sourceLabel,
        value,
        reason: `'\$line-height-base' has no themable cia token — cia uses --line-height-* tokens (4 = 1.5 by default). Override --line-height-4 in your theme if needed.`,
      });
      continue;
    }

    // 5) Utility colors ($light, $dark, $white, $black, $gray-*)
    if (BOOTSTRAP_UTILITY_COLORS.has(name) || /^gray-\d+$/.test(name)) {
      unmapped.push({
        source: sourceLabel,
        value,
        reason: `Bootstrap utility color '\$${name}' has no direct cia semantic. cia uses --paper / --ink / --text-* / --surface-* token families. Add as a brand-* token if needed.`,
      });
      continue;
    }

    // 6) Catch-all for "I see this is a variable but I don't know where it goes"
    // We only surface unmapped entries for variables that LOOK like they
    // matter (border, font, color, spacer-like names) — skip the long tail
    // of Bootstrap's internal config knobs.
    if (/border|radius|font|color|spacer|margin|padding|shadow|width|height/i.test(name)) {
      unmapped.push({
        source: sourceLabel,
        value,
        reason: `No cia semantic mapping for Bootstrap '\$${name}'. If it's a brand/design knob you care about, add as a brand-* token or override the closest cia token manually.`,
      });
    }
  }

  // Build confidence counts
  const counts = { HIGH: 0, MEDIUM: 0, LOW: 0, UNMAPPED: 0 };
  for (const m of Object.values(mappings)) {
    if (counts[m.confidence] != null) counts[m.confidence] += 1;
  }
  counts.UNMAPPED = unmapped.length;
  counts.total = counts.HIGH + counts.MEDIUM + counts.LOW + counts.UNMAPPED;

  return { mappings, unmapped, report: counts };
}

// ─── CLI entry ────────────────────────────────────────────────────────────────

const HELP = `cia migrate bootstrap — convert a Bootstrap _variables.scss to a cia theme.scss

Usage:
  cia migrate bootstrap <path> [options]

Default behavior:
  Parses a Bootstrap SCSS variables file, maps known Bootstrap variables
  ($primary, $body-bg, $border-radius, etc.) to cia contract tokens with
  confidence scoring, and writes a cia theme.scss to ./cia-themes/<name>.scss.
  Diagnostics print to stderr.

Arguments:
  path             Path to a SCSS variables file (commonly _variables.scss
                   or your project's custom-variables.scss).

Options:
  --name <name>    Theme name to use in @include m.theme('<name>') and as
                   the default filename. Default: migrated
  --out <path>     Write to this path instead of the default location.
  --json           Skip the file write and dump the full JSON (vars + cia
                   mappings + unmapped + report) to stdout. Useful for
                   scripts. Diagnostics still print to stderr.
  -h, --help       Show this help.

Examples:
  cia migrate bootstrap ./scss/_variables.scss
  cia migrate bootstrap ./scss/_variables.scss --name brand
  cia migrate bootstrap ./scss/_variables.scss --out ./scss/themes/brand.scss
  cia migrate bootstrap ./scss/_variables.scss --json > bootstrap-report.json

Notes:
  - Variables that reference other Sass variables (e.g. \$primary: \$blue;)
    can't be resolved without compiling — those surface in UNMAPPED with a
    note to paste the literal value and re-run.
  - Bootstrap utility colors (\$light, \$dark, \$gray-*) don't have direct
    cia analogs and surface in UNMAPPED with brand-* token suggestions.
`;

async function run(args) {
  const { flags, positional } = parseFlags(args);
  if (flags.help) {
    process.stdout.write(HELP);
    return;
  }

  let varsPath = positional[0];
  if (!varsPath) {
    throw new Error(
      `cia migrate bootstrap requires a path to a SCSS variables file. ` +
        `Example: cia migrate bootstrap ./scss/_variables.scss`,
    );
  }
  if (!path.isAbsolute(varsPath)) {
    varsPath = path.resolve(process.cwd(), varsPath);
  }
  if (!fs.existsSync(varsPath)) {
    throw new Error(`variables file not found: ${varsPath}`);
  }

  process.stderr.write(`cia migrate bootstrap\n`);
  process.stderr.write(`  variables: ${varsPath}\n`);
  process.stderr.write(`  parsing...\n`);

  const scssText = fs.readFileSync(varsPath, 'utf8');
  const { vars, meta } = parseBootstrapVars(scssText);

  const varCount = Object.keys(vars).length;
  const defaultCount = Object.values(meta).filter((m) => m.isDefault).length;
  process.stderr.write(`  parsed ${varCount} variable(s) (${defaultCount} with !default).\n`);

  process.stderr.write(`\n  mapping to cia contract tokens...\n`);
  const cia = mapBootstrapToCia(vars, meta);

  process.stderr.write(`\n  ─── confidence report ─────────────────────────\n`);
  process.stderr.write(`    HIGH     (semantic match):   ${cia.report.HIGH}\n`);
  process.stderr.write(`    MEDIUM   (close, ≤0.125rem): ${cia.report.MEDIUM}\n`);
  process.stderr.write(`    LOW      (best guess):       ${cia.report.LOW}\n`);
  process.stderr.write(`    UNMAPPED (no cia analog):    ${cia.report.UNMAPPED}\n`);
  process.stderr.write(`    ─────────────────────────────────────────────\n`);
  process.stderr.write(`    total                         ${cia.report.total}\n`);

  // ── Output: file (default) or JSON (--json) ──
  if (flags.json) {
    if (cia.report.UNMAPPED > 0) {
      process.stderr.write(`\n  ${cia.report.UNMAPPED} unmapped value(s) — see .cia.unmapped in the JSON below\n`);
    }
    process.stderr.write(`\n  --- JSON dump on stdout below ---\n`);
    const output = {
      source: varsPath,
      cia_cli_phase: 'PR 4 — Bootstrap parse + map + write',
      summary: { variables: varCount, defaults: defaultCount },
      vars,
      cia,
    };
    process.stdout.write(JSON.stringify(output, null, 2));
    process.stdout.write('\n');
    return;
  }

  // Write the theme.scss
  const scss = writeThemeScss(cia, { name: flags.name, source: varsPath, tool: 'bootstrap' });
  let outPath = flags.out;
  if (outPath) {
    if (!path.isAbsolute(outPath)) outPath = path.resolve(process.cwd(), outPath);
  } else {
    outPath = path.join(process.cwd(), 'cia-themes', `${flags.name}.scss`);
  }
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, scss, 'utf8');

  process.stderr.write(`\n  wrote ${outPath}\n`);
  process.stderr.write(`  ${scss.split('\n').length - 1} lines, ${Object.keys(cia.mappings).length} mapped tokens\n`);
  if (cia.report.UNMAPPED > 0) {
    process.stderr.write(`  ${cia.report.UNMAPPED} unmapped value(s) appended as /* */ comment block — review + add manually\n`);
  }
  process.stderr.write(`\n  Next steps:\n`);
  process.stderr.write(`    1. Review the file (LOW/MEDIUM/UNMAPPED entries are flagged)\n`);
  process.stderr.write(`    2. @use this file from your app's SCSS entry\n`);
  process.stderr.write(`    3. Set <html data-theme="${flags.name}"> and run npm run build:css\n`);
  process.stderr.write(`    4. Run npm run validate-themes to confirm WCAG 2.2 AA contrast\n`);
}

module.exports = {
  run,
  parseBootstrapVars,
  mapBootstrapToCia,
  BOOTSTRAP_DIRECT_MAP,
};
