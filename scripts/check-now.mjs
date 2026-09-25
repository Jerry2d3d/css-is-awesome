#!/usr/bin/env node
/**
 * Guards /now against saying something untrue.
 *
 * The page exists because hand-maintained status claims in this repo went
 * stale in both directions at once — an epic that had shipped recorded as
 * "not started", a feature that ships recorded as "never built". Deriving the
 * page from the epic files removes the drift between page and files, but it
 * introduces a new way to be wrong: an epic whose status line the parser
 * cannot read would silently vanish from the page rather than appear wrong,
 * which is worse, because an absence is invisible.
 *
 * So: an unparseable status line fails the build.
 *
 * Checks, in order of how loudly they complain:
 *
 *   FAIL  a status line the collector cannot classify
 *   FAIL  roadmap/now.json names a currentWave folder that does not exist
 *   FAIL  a blocked entry pointing at an epic file that is gone
 *   FAIL  a blocked entry whose PR has since closed  (only when a GitHub
 *         token is present — the check is skipped offline rather than
 *         making CI depend on the network for a bookkeeping rule)
 *   WARN  the newest working note is more than 60 days old
 *
 * The note age is a warning and must stay one. The log has no cadence; a
 * quiet month is not a build failure.
 */
import fs from "node:fs";
import path from "node:path";
import { getEpics, getNow } from "../src/lib/now.ts";

const ROOT = process.cwd();
const NOTE_STALE_DAYS = 60;

const red = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

const failures = [];
const warnings = [];

// ---------------------------------------------------------------------------
// 1. Every epic status line must be readable.
// ---------------------------------------------------------------------------
const { epics, unparsed } = getEpics();

for (const u of unparsed) {
  failures.push(
    `${u.file}\n      status line could not be classified: ${dim(u.line)}\n` +
      `      Add or fix the "**Status:**" line. Recognised shapes: ✅/Complete/Shipped,\n` +
      `      🟡/Partial/In progress/publish-blocked, Planned, ⛔/⚠️/Superseded/Deferred/Folded/Gate failed.`,
  );
}

// ---------------------------------------------------------------------------
// 2. The hand-maintained half must point at things that exist.
// ---------------------------------------------------------------------------
const nowJsonPath = path.join(ROOT, "roadmap", "now.json");
if (!fs.existsSync(nowJsonPath)) {
  failures.push("roadmap/now.json is missing — /now has no currentWave or blocked list.");
}

const now = getNow();

if (now.currentWave) {
  const waveDir = path.join(ROOT, "roadmap", "epics", now.currentWave);
  if (!fs.existsSync(waveDir)) {
    failures.push(
      `roadmap/now.json currentWave is "${now.currentWave}" but roadmap/epics/${now.currentWave}/ does not exist.`,
    );
  }
} else {
  failures.push("roadmap/now.json has no currentWave — /now cannot scope its Next section.");
}

// A blocker that points at a local file must point at one that is still there.
for (const b of now.blocked) {
  if (!b.what || !b.why || !b.since) {
    failures.push(`A blocked entry is missing what/why/since: ${JSON.stringify(b)}`);
    continue;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.since)) {
    failures.push(`Blocked entry "${b.what}" has a malformed "since": ${b.since}`);
  }
  if (b.href && b.href.startsWith("roadmap/")) {
    if (!fs.existsSync(path.join(ROOT, b.href))) {
      failures.push(`Blocked entry "${b.what}" points at ${b.href}, which does not exist.`);
    }
  }
}

// ---------------------------------------------------------------------------
// 3. A blocker naming a PR must name one that is still open.
//     Network-dependent, so it runs only when a token is present.
// ---------------------------------------------------------------------------
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const prLinks = now.blocked
  .map((b) => ({ b, m: /github\.com\/([^/]+)\/([^/]+)\/(pull|issues)\/(\d+)/.exec(b.href ?? "") }))
  .filter((x) => x.m);

if (prLinks.length > 0 && token) {
  for (const { b, m } of prLinks) {
    const [, owner, repo, , number] = m;
    try {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/issues/${number}`,
        { headers: { Authorization: `Bearer ${token}`, "User-Agent": "check-now" } },
      );
      if (res.status === 404) {
        failures.push(`Blocked entry "${b.what}" points at ${b.href}, which does not exist.`);
        continue;
      }
      if (!res.ok) {
        warnings.push(`Could not check ${b.href} (HTTP ${res.status}); skipped.`);
        continue;
      }
      const data = await res.json();
      if (data.state === "closed") {
        failures.push(
          `Blocked entry "${b.what}" points at ${b.href}, which is CLOSED.\n` +
            `      If it is no longer blocked, remove the entry from roadmap/now.json.`,
        );
      }
    } catch (err) {
      warnings.push(`Could not check ${b.href} (${err.message}); skipped.`);
    }
  }
} else if (prLinks.length > 0) {
  console.log(dim(`  (skipping ${prLinks.length} PR state check(s) — no GITHUB_TOKEN)`));
}

// ---------------------------------------------------------------------------
// 4. Note staleness — a warning, never a failure.
// ---------------------------------------------------------------------------
const notesDir = path.join(ROOT, "src", "content", "notes");
if (fs.existsSync(notesDir)) {
  const dates = fs
    .readdirSync(notesDir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_") && f !== "README.md")
    .map((f) => /^(\d{4}-\d{2}-\d{2})/.exec(f)?.[1])
    .filter(Boolean)
    .sort();

  const newest = dates.at(-1);
  if (!newest) {
    warnings.push("No dated working notes found.");
  } else {
    const days = Math.floor((Date.now() - Date.parse(`${newest}T00:00:00Z`)) / 86_400_000);
    if (days > NOTE_STALE_DAYS) {
      warnings.push(
        `Newest working note is ${days} days old (${newest}). Not a failure — the log has no cadence.`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
const counts = epics.reduce((acc, e) => ({ ...acc, [e.state]: (acc[e.state] ?? 0) + 1 }), {});
console.log(
  `\n/now collector read ${epics.length} epic(s): ` +
    Object.entries(counts)
      .map(([k, v]) => `${v} ${k}`)
      .join(", "),
);
console.log(
  `  current wave ${now.currentWave} · ${now.inFlight.length} in flight · ` +
    `${now.next.length} next · ${now.blocked.length} blocked`,
);

for (const w of warnings) console.log(`  ${yellow("warn")} ${w}`);

if (failures.length > 0) {
  console.error(`\n${red(`check-now failed (${failures.length}):`)}`);
  for (const f of failures) console.error(`  ${red("✗")} ${f}`);
  console.error("");
  process.exit(1);
}

console.log(`  ${green("✓")} /now can be generated truthfully.\n`);
