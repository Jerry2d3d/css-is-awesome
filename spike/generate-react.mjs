#!/usr/bin/env node
// ============================================================================
// spike/generate-react.mjs  —  EPIC-04 US-V11.04.1.2 + .1.3 (spike, no ship)
// ============================================================================
// Implements the epic's acceptance criteria as literally as they are written:
//
//   "Reads the 'React' framework section of the recipe (this is the source of
//    truth — codegen just copies it into the right file shape)"
//   "Adds prop interface (children, className, ...rest)"
//   "Default selector class is `cia-recipe-<name>`; consumers can override
//    via className prop"
//   "Output is single-file React component (function component)"
//
// plus US-V11.04.1.3's colocated `.module.scss`.
//
// The point of writing it literally is to find out what those criteria
// actually produce when applied to real recipes, rather than to what the
// epic imagined recipes would look like.
// ============================================================================
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { parseRecipe } from './parse-recipe.mjs';

/** breadcrumb → Breadcrumb, combobox-multiselect → ComboboxMultiselect */
function pascal(slug) {
  return slug.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}

/**
 * Inspect the recipe's React source to see what it actually exports and what
 * it expects. This is the measurement the verdict rests on.
 */
export function analyseReact(code) {
  const lines = code.split('\n');
  const defaultExport = /export\s+default\s+function\s+(\w+)/.exec(code);
  const namedExports = [...code.matchAll(/export\s+(?:function|const)\s+(\w+)/g)].map((m) => m[1]);
  const propsMatch = defaultExport
    ? new RegExp(`export\\s+default\\s+function\\s+${defaultExport[1]}\\s*\\(([^)]*)\\)`).exec(code)
    : null;
  const propsSig = propsMatch ? propsMatch[1].trim() : '';
  // Module-scope const arrays / records = demo fixtures baked into the file.
  const fixtures = [...code.matchAll(/^const\s+([A-Z_][A-Z0-9_]*)\s*(?::[^=]+)?=\s*([[{][\s\S]*?)$/gm)]
    .map((m) => ({ name: m[1], preview: m[2].split('\n')[0].slice(0, 72) }));
  const styleImport = /import\s+styles\s+from\s+["'](.+?)["']/.exec(code);
  return {
    lines: lines.length,
    lang: 'tsx',
    defaultExportName: defaultExport ? defaultExport[1] : null,
    namedExports,
    propsSig,
    takesNoProps: propsSig === '',
    fixtures,
    styleImport: styleImport ? styleImport[1] : null,
    isTypeScript: /:\s*(string|number|boolean|React\.|\w+\[\])/.test(code) || /^type\s+\w+/m.test(code),
    usesHooks: /use(State|Ref|Effect|Callback|Id|Context|Memo)\s*\(/.test(code),
    hasContext: /createContext\s*\(/.test(code),
  };
}

/** US-V11.04.1.2: wrap the recipe's React section in "the right file shape". */
export function generateReact(recipe) {
  const react = recipe.frameworks.react;
  const Name = pascal(recipe.name);
  const a = analyseReact(react.code);

  const header = [
    `// GENERATED FROM ${recipe.name}.md — DO NOT EDIT`,
    `// Regenerate with: npm run build:react`,
    `//`,
    `// Recipe: ${recipe.meta.description}`,
    '',
  ].join('\n');

  // "Adds prop interface (children, className, ...rest)" + "default selector
  // class is cia-recipe-<name>". The recipe's own component is copied in
  // verbatim; the wrapper is the only thing this generator actually writes.
  const wrapper = [
    `const CIA_CLASS = "cia-recipe-${recipe.name}";`,
    '',
    `export function ${Name}({ children, className, ...rest }) {`,
    `  const cls = className ? \`\${CIA_CLASS} \${className}\` : CIA_CLASS;`,
    `  return (`,
    `    <div className={cls} {...rest}>`,
    `      <${a.defaultExportName || Name}Recipe />`,
    `      {children}`,
    `    </div>`,
    `  );`,
    `}`,
    '',
    `export default ${Name};`,
  ].join('\n');

  // The recipe body, copied verbatim but with its default export demoted so
  // the file has one public entry point.
  let body = react.code;
  if (a.defaultExportName) {
    body = body.replace(
      new RegExp(`export\\s+default\\s+function\\s+${a.defaultExportName}\\b`),
      `function ${a.defaultExportName}Recipe`,
    );
  }

  const code = `${header}${body}\n\n${wrapper}\n`;
  const verbatimLines = react.code.split('\n').filter((l) => l.trim()).length;
  const totalLines = code.split('\n').filter((l) => l.trim()).length;
  return {
    filename: `${Name}.jsx`,
    code,
    analysis: a,
    counts: {
      verbatim: verbatimLines,
      synthesised: totalLines - verbatimLines,
      total: totalLines,
    },
  };
}

/** US-V11.04.1.3: colocated module.scss from the recipe's styling section. */
export function generateScss(recipe) {
  const Name = pascal(recipe.name);
  const lines = [
    `// GENERATED FROM ${recipe.name}.md — DO NOT EDIT`,
    `@use 'css-is-awesome' as cia;`,
    '',
    `// Epic says: "Selector targets match the className the React component`,
    `// renders (e.g. .cia-recipe-dialog)". The recipe's own selectors are`,
    `// consumer-chosen names (.my-*), so they are rewritten here.`,
    `.cia-recipe-${recipe.name} {`,
  ];
  for (const rule of recipe.stylingScss) {
    const scoped = rule.selector.replace(/^\.my-[\w-]+\s*/, '').trim();
    const target = scoped ? `  ${scoped} { @include cia.${rule.mixin}${rule.params ? `(${rule.params})` : ''}; }`
                          : `  @include cia.${rule.mixin}${rule.params ? `(${rule.params})` : ''};`;
    lines.push(target);
  }
  lines.push('}', '');
  return { filename: `${Name}.module.scss`, code: lines.join('\n') };
}

// ─── CLI ────────────────────────────────────────────────────────────────────
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const OUT = path.join(ROOT, 'spike', 'out');

if (process.argv[1]?.endsWith('generate-react.mjs')) {
  const slugs = process.argv.slice(2);
  if (!slugs.length) { console.error('usage: node spike/generate-react.mjs <slug> [slug…]'); process.exit(2); }
  mkdirSync(OUT, { recursive: true });
  const report = [];
  for (const slug of slugs) {
    const recipe = parseRecipe(path.join(ROOT, 'scss', 'recipes', `${slug}.md`));
    const jsx = generateReact(recipe);
    const scss = generateScss(recipe);
    writeFileSync(path.join(OUT, jsx.filename), jsx.code);
    writeFileSync(path.join(OUT, scss.filename), scss.code);
    report.push({ slug, file: jsx.filename, ...jsx.counts, analysis: jsx.analysis });
    console.log(`${slug} → ${jsx.filename} + ${scss.filename}`);
    console.log(`   verbatim ${jsx.counts.verbatim} / synthesised ${jsx.counts.synthesised} (${Math.round(jsx.counts.verbatim / jsx.counts.total * 100)}% copied)`);
    console.log(`   default export: ${jsx.analysis.defaultExportName || '(none)'} | named exports: ${jsx.analysis.namedExports.join(', ') || '(none)'}`);
    console.log(`   props: ${jsx.analysis.takesNoProps ? 'NONE — takes no props' : jsx.analysis.propsSig.slice(0, 70)}`);
    console.log(`   baked-in fixtures: ${jsx.analysis.fixtures.map((f) => f.name).join(', ') || '(none)'}`);
    console.log(`   style import: ${jsx.analysis.styleImport || '(none)'} | TypeScript: ${jsx.analysis.isTypeScript}`);
    console.log('');
  }
  writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
}
