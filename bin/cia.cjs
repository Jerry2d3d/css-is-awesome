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
  cia migrate <tool> [path]

Tools:
  tailwind   Read a tailwind.config.{js,ts,mjs,cjs} and dump its theme as JSON.
             Future PRs: map to cia tokens + emit theme.scss with @include cia.theme().
  bootstrap  Planned. Read _variables.scss and map to cia tokens.

Examples:
  cia migrate tailwind ./tailwind.config.js
  cia migrate tailwind                       # auto-detect
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
      fail(
        `migrate bootstrap is not implemented yet (planned for v0.9 — see ` +
          `roadmap/epics/v1-0/EPIC-03-migration-on-ramp.md F3.2).`,
      );
    }
    fail(`unknown migrate tool '${tool}'. Available now: tailwind. Planned: bootstrap.`);
  }

  fail(`unknown command '${command}'. Run \`cia --help\` for usage.`);
}

main().catch((err) => {
  fail(err && err.message ? err.message : String(err));
});
