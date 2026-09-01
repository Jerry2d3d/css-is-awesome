#!/usr/bin/env node
// ============================================================================
// generate-token-types.mjs
// ============================================================================
// Reads scripts/theme-contract.json and emits dist/tokens.d.ts — a TypeScript
// declaration file giving consumers IDE autocomplete on every cia CSS token.
//
// Usage:
//   node scripts/generate-token-types.mjs
//
// Output:
//   dist/tokens.d.ts — exports CiaToken (string literal union) and
//   CiaTokenMap (record of token → string).
// ============================================================================

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CONTRACT = resolve(ROOT, 'scripts/theme-contract.json');
const OUT = resolve(ROOT, 'dist/tokens.d.ts');

const contract = JSON.parse(await readFile(CONTRACT, 'utf-8'));
const tokens = contract.required ?? [];

if (tokens.length === 0) {
  console.error('No tokens found in theme-contract.json under `required`.');
  process.exit(1);
}

const unionLines = tokens.map((t) => `  | ${JSON.stringify(t)}`).join('\n');
const mapLines = tokens.map((t) => `  ${JSON.stringify(t)}: string;`).join('\n');

const banner = `// Generated from scripts/theme-contract.json on ${new Date().toISOString().slice(0, 10)}.
// Do not edit by hand. Run \`npm run build:token-types\` to regenerate.
`;

const body = `${banner}
/** Every CSS custom property cia themes are required to declare. */
export type CiaToken =
${unionLines};

/** Map of token name to its CSS value. */
export interface CiaTokenMap {
${mapLines}
}

/** Count of required tokens in the current contract. */
export declare const CIA_TOKEN_COUNT: ${tokens.length};
`;

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, body);
console.log(`Wrote ${OUT} with ${tokens.length} tokens.`);
