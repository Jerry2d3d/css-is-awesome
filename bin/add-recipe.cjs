/**
 * cia add — copy a recipe from the installed package into the project.
 *
 * The recipes book ships inside the npm package (scss/recipes/*.md). This
 * command copies one into the consumer's tree so they OWN the pattern —
 * the registry model: own the generated code, don't import an opaque
 * component. Markdown pattern recipes only; the opt-in SCSS recipes
 * (e.g. bare-tags) are `@use`d, not copied.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const RECIPES_DIR = path.join(__dirname, '..', 'scss', 'recipes');

const HELP = `cia add — copy a recipe into your project

Usage:
  cia add <recipe> [options]
  cia add --list

Options:
  --list           List available recipes.
  --out <path>     Output path. Default: ./cia-recipes/<recipe>.md
  --force          Overwrite if the target file exists.

Examples:
  cia add --list
  cia add bottom-nav
  cia add mobile-nav --out docs/patterns/mobile-nav.md
`;

function fail(message) {
  process.stderr.write(`cia add: ${message}\n`);
  process.exit(1);
}

function listRecipes() {
  return fs
    .readdirSync(RECIPES_DIR)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_') && f !== 'README.md')
    .map((f) => f.replace(/\.md$/, ''))
    .sort();
}

function frontmatterDescription(raw) {
  const m = raw.match(/^---[\s\S]*?\ndescription:\s*(.+?)\r?\n[\s\S]*?---/);
  return m ? m[1].trim() : '';
}

async function run(args) {
  if (!args.length || args[0] === '-h' || args[0] === '--help' || args[0] === 'help') {
    process.stdout.write(HELP);
    return;
  }

  if (args.includes('--list')) {
    for (const slug of listRecipes()) {
      const raw = fs.readFileSync(path.join(RECIPES_DIR, `${slug}.md`), 'utf8');
      process.stdout.write(`${slug.padEnd(16)} ${frontmatterDescription(raw)}\n`);
    }
    return;
  }

  const slug = args[0];
  const recipes = listRecipes();
  if (!recipes.includes(slug)) {
    fail(`unknown recipe '${slug}'. Available: ${recipes.join(', ')}.`);
  }

  const outFlag = args.indexOf('--out');
  const outPath =
    outFlag !== -1 && args[outFlag + 1]
      ? path.resolve(args[outFlag + 1])
      : path.resolve('cia-recipes', `${slug}.md`);

  if (fs.existsSync(outPath) && !args.includes('--force')) {
    fail(`${path.relative(process.cwd(), outPath)} already exists. Pass --force to overwrite.`);
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.copyFileSync(path.join(RECIPES_DIR, `${slug}.md`), outPath);

  const rel = path.relative(process.cwd(), outPath);
  process.stdout.write(
    `✓ ${slug} → ${rel}\n\n` +
      `The recipe is yours now — correct HTML, the cia mixin calls, and the\n` +
      `a11y checklist. Read it, copy the pattern into your stack, keep the\n` +
      `checklist. Docs: https://cssisawesome.com/docs/recipes/${slug}/\n`,
  );
}

module.exports = { run };
