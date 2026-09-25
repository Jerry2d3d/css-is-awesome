#!/usr/bin/env node
/**
 * Machine-checks the privacy rule over the working notes.
 *
 * The rule itself is in roadmap/handoffs/README.md and src/content/notes/README.md:
 * record the ask, the answer and the release; never another project's source,
 * file paths, internal architecture or inventory counts. It exists because a
 * sweep in September 2026 had to pull exactly that material back out of this
 * public repository, and a devlog is the single most likely surface to put it
 * back in by accident — it is written quickly, in the middle of the work,
 * with the other project's code open in the next window.
 *
 * WHAT THIS CAN AND CANNOT DO
 * ---------------------------
 * It catches the mechanical half: absolute paths from a dev machine, sibling
 * repository paths, Windows drive letters, home directories. Those are the
 * leaks that happen by paste rather than by decision.
 *
 * It cannot catch the judgement half. "Their generator emits about 100
 * components" contains no path and breaks the rule completely. No regex will
 * find that. The README says so plainly rather than letting a green check
 * imply a note has been cleared.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const NOTES_DIR = path.join(ROOT, "src", "content", "notes");

const red = (s) => `\x1b[31m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

/**
 * Each rule is a shape that should never appear in a published note.
 * Kept explicit rather than clever: a reader should be able to see exactly
 * what is banned without decoding a regex.
 */
const RULES = [
  {
    id: "windows-drive-path",
    why: "an absolute path from a dev machine",
    re: /\b[A-Za-z]:[\\/](?:repo|Users|Windows|Program Files)\b/i,
  },
  {
    id: "home-directory",
    why: "a home directory path",
    re: /(?:\/home\/[a-z0-9_.-]+|\/Users\/[A-Za-z0-9_.-]+)\//,
  },
  {
    id: "sibling-repo-path",
    why: "a path inside another project's checkout",
    re: /\b(?:\.\.\/)+(?:boiler-project-ai|create-cia|css-is-awesome-mcp|figma-import-export)\b/,
  },
  {
    id: "node-modules-path",
    why: "someone's installed tree",
    re: /\bnode_modules\/(?!css-is-awesome)/,
  },
];

/**
 * Fenced code blocks are exempt from the path rules. A note explaining a
 * command legitimately shows a path, and banning that would make the check
 * so annoying it gets disabled — which is how privacy checks die.
 * Prose is where the accidental paste lands, so prose is what is checked.
 */
function stripCodeBlocks(text) {
  const lines = text.split(/\r?\n/);
  let inFence = false;
  return lines.map((line) => {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      return "";
    }
    if (inFence) return "";
    // Inline code spans too, same reasoning.
    return line.replace(/`[^`]*`/g, "");
  });
}

if (!fs.existsSync(NOTES_DIR)) {
  console.log("\nno src/content/notes/ — nothing to check.\n");
  process.exit(0);
}

const files = fs
  .readdirSync(NOTES_DIR)
  .filter((f) => f.endsWith(".md") && f !== "README.md")
  .sort();

const hits = [];

for (const file of files) {
  const raw = fs.readFileSync(path.join(NOTES_DIR, file), "utf8");
  const lines = stripCodeBlocks(raw);

  lines.forEach((line, i) => {
    if (!line.trim()) return;
    for (const rule of RULES) {
      const m = rule.re.exec(line);
      if (m) {
        hits.push({
          file: `src/content/notes/${file}`,
          line: i + 1,
          rule: rule.id,
          why: rule.why,
          text: m[0],
        });
      }
    }
  });
}

console.log(`\nnotes privacy lint — ${files.length} note(s), ${RULES.length} rule(s)`);

if (hits.length > 0) {
  console.error(`\n${red(`privacy lint failed (${hits.length}):`)}`);
  for (const h of hits) {
    console.error(`  ${red("✗")} ${h.file}:${h.line}  ${h.why}`);
    console.error(`      matched ${dim(h.text)}  ${dim(`[${h.rule}]`)}`);
  }
  console.error(
    `\n  Notes are published. Describe what cia did and let the other side of the\n` +
      `  story stay theirs — see src/content/notes/README.md.\n`,
  );
  process.exit(1);
}

console.log(`  ${green("✓")} no machine-detectable leaks.`);
console.log(
  `  ${dim("The judgement half — inventory counts, someone else's architecture — is not")}\n` +
    `  ${dim("checkable here and stays the author's call.")}\n`,
);
