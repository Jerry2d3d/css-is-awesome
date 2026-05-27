#!/usr/bin/env node
/**
 * cia — css-is-awesome CLI
 *
 * Subcommand router. Each subcommand lives in its own file under bin/ and
 * exposes a `run(args)` async function.
 *
 * Status (PR 1 — feature/v0.9.0-migrate-tailwind-scaffold):
 *   migrate tailwind  — parse tailwind.config.* + dump theme JSON (this PR)
 *   migrate bootstrap — planned (US-03.2.1)
 *
 * cia core ships ZERO JavaScript in the `files` manifest. The CLI lives in
 * `bin/` which is explicitly allowed per the architecture lock — same path
 * as the MCP server (mcp/server.cjs). cia core remains a styling
 * foundation; this CLI is consumer-facing tooling, not consumed by browser
 * code at runtime.
 */
'use strict';

const args = process.argv.slice(2);
const [command, ...rest] = args;

const HELP = `cia — css-is-awesome CLI

Usage:
  cia <command> [options]

Commands:
  migrate <tool> [path]   Convert another design system's config to a cia
                          theme. Tools: tailwind | bootstrap (planned).

Examples:
  cia migrate tailwind ./tailwind.config.js
  cia migrate tailwind                       # auto-detect tailwind.config.*

Run \`cia <command> --help\` for command-specific help.
`;

const MIGRATE_HELP = `cia migrate — convert another design system's config to a cia theme

Usage:
  cia migrate <tool> [path] [options]

Tools:
  tailwind   Read a tailwind.config.{js,ts,mjs,cjs} and write a cia
             theme.scss with HIGH/MEDIUM/LOW/UNMAPPED confidence levels.
             Run \`cia migrate tailwind --help\` for full options.

  bootstrap  Read a Bootstrap _variables.scss (or custom-variables.scss)
             and write a cia theme.scss. Maps \$primary / \$body-bg /
             \$border-radius / \$font-family-base / \$spacer / status colors
             via Bootstrap convention.
             Run \`cia migrate bootstrap --help\` for full options.

Common options (both tools):
  --name <name>    Theme name. Default: migrated
  --out <path>     Custom output path. Default: ./cia-themes/<name>.scss
  --json           Skip the file write and dump JSON to stdout (pipe-safe).

Examples:
  cia migrate tailwind ./tailwind.config.js
  cia migrate bootstrap ./scss/_variables.scss --name acme
  cia migrate bootstrap ./scss/_variables.scss --json | jq '.cia.report'
`;

function fail(message, exit = 1) {
  process.stderr.write(`cia: ${message}\n`);
  process.exit(exit);
}

async function main() {
  if (!command || command === '-h' || command === '--help' || command === 'help') {
    process.stdout.write(HELP);
    return;
  }

  if (command === '--version' || command === '-v') {
    // Read version from sibling package.json
    const path = require('path');
    const fs = require('fs');
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
      process.stdout.write(`${pkg.version}\n`);
      return;
    } catch (err) {
      fail(`could not read version: ${err.message}`);
    }
  }

  if (command === 'migrate') {
    const [tool, ...migrateArgs] = rest;
    if (!tool || tool === '-h' || tool === '--help' || tool === 'help') {
      process.stdout.write(MIGRATE_HELP);
      return;
    }
    if (tool === 'tailwind') {
      const { run } = require('./migrate-tailwind.cjs');
      await run(migrateArgs);
      return;
    }
    if (tool === 'bootstrap') {
      const { run } = require('./migrate-bootstrap.cjs');
      await run(migrateArgs);
      return;
    }
    fail(`unknown migrate tool '${tool}'. Available: tailwind, bootstrap.`);
  }

  fail(`unknown command '${command}'. Run \`cia --help\` for usage.`);
}

main().catch((err) => {
  fail(err && err.message ? err.message : String(err));
});
