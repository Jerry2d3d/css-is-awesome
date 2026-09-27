#!/usr/bin/env node
// ============================================================================
// check-theme-parity.mjs
// ============================================================================
// Compares the 24 shipped themes AGAINST EACH OTHER, which nothing else does.
//
// Every other check looks at one theme in isolation: the validator grades it
// against the contract, the drift check regenerates it and compares it to
// itself. Both passed for weeks while `press` shipped four page-surface
// tokens written outside any selector, where a custom property applies to
// nothing. A consumer switching to press got a hero band that silently did
// not theme, with no error anywhere.
//
// The information was there the whole time. The validator printed
// "page-surfaces 9" for press and "page-surfaces 5" for the other 23, on
// every single run. Nobody read it, because a count of undeclared OPTIONAL
// tokens is ordinary — until you put it next to the same count from every
// other theme, and one number is different.
//
// That comparison is this file.
//
// WHY IT ONLY FLAGS LONE OUTLIERS
// Themes are ALLOWED to differ. Terminal deliberately omits things; press
// and cupertino deliberately declare per-component radii that sketchbook
// does not. A check demanding uniformity would be wrong about the design and
// would be switched off within a week.
//
// So it only speaks when the imbalance is itself the evidence:
//
//   GLOBAL  every theme but one declares a token  → the one is suspect
//   FAMILY  two of a family's three files declare → the third is suspect
//
// The family rule exists because a family is one design in three files. If
// `terminal` and `terminal-dark` declare a token and `terminal-light` does
// not, nobody decided that.
//
// Usage: node scripts/check-theme-parity.mjs
// ============================================================================
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const THEMES = resolve(ROOT, 'public/themes');
const CONTRACT = resolve(__dirname, 'theme-contract.json');

const red = (s) => `\x1b[31m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

/**
 * EVERY block a theme emits for its own selector, matched by BRACE COUNTING
 * from each selector rather than by file position.
 *
 * Two lessons are baked in here, both learned the hard way on this file.
 *
 * Position is not ownership. `press` ends with an `@media print` block, so
 * "the last closing brace" belonged to the media query, not to the theme —
 * which is how four tokens came to be written outside any selector at all.
 *
 * And a theme can emit its selector MORE THAN ONCE. `glass` opens
 * `:root, :root[data-theme=glass]`, closes it, emits a dark-scheme media
 * block, then opens the same selector again for its scales. Reading only the
 * first block reported glass as missing six tokens it plainly declares — a
 * false positive this check produced on its very first run, which is a
 * useful reminder that a new check is itself unproven code.
 */
function themeBlocks(css) {
  const head = /:root\s*,\s*:root\[data-theme=[^\]]+\]\s*\{/g;
  const blocks = [];
  let m;
  while ((m = head.exec(css))) {
    const open = m.index + m[0].length - 1;
    let depth = 0;
    for (let i = open; i < css.length; i++) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}') {
        depth--;
        if (depth === 0) {
          blocks.push(css.slice(open + 1, i));
          head.lastIndex = i;
          break;
        }
      }
    }
  }
  return blocks;
}

/** Tokens a theme declares INSIDE its own selector. Nowhere else counts. */
function declaredTokens(css) {
  const blocks = themeBlocks(css);
  if (blocks.length === 0) return null;
  const found = new Set();
  for (const block of blocks) {
    for (const m of block.matchAll(/(^|\n)\s*(--[\w-]+)\s*:/g)) found.add(m[2]);
  }
  return found;
}

/** "press-light" and "press-dark" both belong to the "press" family. */
const familyOf = (name) => name.replace(/-(light|dark)$/, '');

const contract = JSON.parse(readFileSync(CONTRACT, 'utf8'));
const optional = contract.optional ?? [];
const groupOf = new Map();
for (const [group, spec] of Object.entries(contract.features ?? {})) {
  for (const token of spec.tokens ?? []) groupOf.set(token, group);
}

if (!existsSync(THEMES)) {
  console.error(`check-theme-parity: ${THEMES} does not exist — run build:css:themes first.`);
  process.exit(1);
}

const themes = readdirSync(THEMES, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .filter((name) => existsSync(join(THEMES, name, 'theme.css')))
  .sort();

const declared = new Map();
const unreadable = [];
for (const name of themes) {
  const tokens = declaredTokens(readFileSync(join(THEMES, name, 'theme.css'), 'utf8'));
  if (tokens === null) unreadable.push(name);
  else declared.set(name, tokens);
}

const failures = [];

// A theme whose selector block cannot be found is broken outright.
for (const name of unreadable) {
  failures.push(
    `${name}: no \`:root, :root[data-theme=…]\` block found. Every declaration in\n` +
      `      that file applies to nothing.`,
  );
}

const total = declared.size;

for (const token of optional) {
  const have = [...declared.entries()].filter(([, set]) => set.has(token)).map(([n]) => n);
  const missing = [...declared.keys()].filter((n) => !declared.get(n).has(token));
  const group = groupOf.get(token) ?? 'ungrouped';

  // GLOBAL: all but one.
  if (have.length === total - 1 && missing.length === 1) {
    failures.push(
      `${token} (${group}) is declared by ${have.length} of ${total} themes.\n` +
        `      Missing only from ${red(missing[0])}. One theme differing from every\n` +
        `      other is a mistake far more often than it is a decision.`,
    );
    continue;
  }

  // FAMILY: two of three, OR one of three.
  //
  // BOTH DIRECTIONS. The first version of this rule only looked for
  // two-of-three, which catches "the majority declares it and one file
  // forgot". It was blind to the inverse - one file declares it and the
  // other two do not - and so missed `sketchbook-light` carrying a spacing
  // alias that neither `sketchbook` nor `sketchbook-dark` has. The check
  // reported "no lone outlier" while that sat in the tree.
  //
  // A lone declarer is exactly as much of an accident as a lone omitter.
  // Reported by the Figma export, which turns each theme into a mode and
  // therefore sees a token present in 2 of 10 modes immediately.
  const byFamily = new Map();
  for (const name of declared.keys()) {
    const f = familyOf(name);
    if (!byFamily.has(f)) byFamily.set(f, []);
    byFamily.get(f).push(name);
  }
  for (const [family, members] of byFamily) {
    if (members.length !== 3) continue;
    const has = members.filter((n) => declared.get(n).has(token));

    if (has.length === 2) {
      const odd = members.find((n) => !declared.get(n).has(token));
      failures.push(
        `${token} (${group}) is declared by 2 of the 3 \`${family}\` files,\n` +
          `      but not by ${red(odd)}. A family is one design in three files.`,
      );
    } else if (has.length === 1) {
      failures.push(
        `${token} (${group}) is declared ONLY by ${red(has[0])}, and not by\n` +
          `      the other two \`${family}\` files. A lone declarer is as much an\n` +
          `      accident as a lone omitter.`,
      );
    }
  }
}

console.log(`\ntheme parity — ${total} themes, ${optional.length} optional tokens compared`);

if (failures.length > 0) {
  console.error(`\n${red(`${failures.length} parity problem(s):`)}`);
  for (const f of failures) console.error(`  ${red('✗')} ${f}`);
  console.error(
    `\n  ${dim('If a difference is deliberate, declare the token in the odd theme out')}\n` +
      `  ${dim('with the value it should have. "Leave it undeclared" and "declare it to')}\n` +
      `  ${dim('the same value the fallback gives" render identically, and only one of')}\n` +
      `  ${dim('them says so on purpose.')}\n`,
  );
  process.exit(1);
}

console.log(`  ${green('✓')} no theme is a lone outlier.`);
console.log(
  `  ${dim('Only all-but-one and two-of-three differences are reported. Themes are')}\n` +
    `  ${dim('allowed to differ; a check demanding uniformity would be wrong about the')}\n` +
    `  ${dim('design and switched off within a week.')}\n`,
);
