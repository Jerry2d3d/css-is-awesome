#!/usr/bin/env node
// ============================================================================
// spike/render-test.mjs — does the generated component actually render?
// ============================================================================
// The epic's acceptance criteria include "Component renders in a sample
// Next.js app". A full Next app is overkill to answer the question; this
// transpiles each generated file with TypeScript (the files are .jsx but
// their contents are TSX — finding in its own right) and renders it with
// react-dom/server, stubbing the CSS-module import the same way a bundler
// would. A crash here is a crash in a real app.
// ============================================================================
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { createRequire } from 'node:module';

const require_ = createRequire(import.meta.url);
const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'spike', 'out');
const TMP = path.join(ROOT, 'spike', 'out', '.render');
mkdirSync(TMP, { recursive: true });

const React = require_('react');
const { renderToStaticMarkup } = require_('react-dom/server');

const files = process.argv.slice(2);

for (const f of files) {
  const src = readFileSync(path.join(OUT, f), 'utf8');
  const name = path.basename(f, '.jsx');
  let status = 'UNKNOWN';
  let detail = '';

  // 1. Can it even be parsed as JSX (the extension the epic specifies)?
  const asJsx = ts.transpileModule(src, {
    reportDiagnostics: true,
    compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    fileName: `${name}.jsx`,
  });
  const jsxErrors = (asJsx.diagnostics || []).filter((d) => d.category === ts.DiagnosticCategory.Error);

  // 2. Transpile as TSX (what the content really is) and try to render.
  const out = ts.transpileModule(src, {
    compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
    fileName: `${name}.tsx`,
  }).outputText;

  // Stub the CSS module import + react, the way a bundler resolves them.
  const js = out
    .replace(/require\("\.\/[^"]+\.module\.scss"\)/g, 'new Proxy({}, { get: (_, k) => String(k) })')
    .replace(/require\("react"\)/g, 'globalThis.__React');
  const file = path.join(TMP, `${name}.cjs`);
  writeFileSync(file, `const React = globalThis.__React;\n${js}`);

  globalThis.__React = React;
  try {
    const mod = require_(file);
    const Component = mod.default || mod[Object.keys(mod)[0]];
    if (typeof Component !== 'function') throw new Error(`no renderable export (got ${typeof Component})`);
    const html = renderToStaticMarkup(React.createElement(Component));
    status = 'RENDERED';
    detail = `${html.length} chars of HTML`;
  } catch (err) {
    status = 'CRASHED';
    detail = `${err.constructor.name}: ${err.message.split('\n')[0]}`;
  }

  console.log(`${f}`);
  console.log(`  parses as .jsx (epic spec): ${jsxErrors.length === 0 ? 'yes' : `NO — ${jsxErrors.length} error(s), first: ${ts.flattenDiagnosticMessageText(jsxErrors[0].messageText, ' ').slice(0, 80)}`}`);
  console.log(`  render: ${status} — ${detail}`);
  console.log('');
}
