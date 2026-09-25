// Build-time status collector for /now.
//
// Server-only by construction: importing `node:fs` makes this module
// impossible to bundle into a client component, so no `server-only` guard
// dependency is needed. Same posture as src/lib/blog.ts and src/lib/recipes.ts.
//
// WHY THIS IS DERIVED AND NOT WRITTEN BY HAND
// -------------------------------------------
// Every hand-maintained status claim in this repository has gone stale, and
// several went stale in BOTH directions at once: an epic that had shipped was
// recorded as "not started", while another that was never built was recorded
// as done. One file contradicted itself inside a single table cell. A page
// whose entire purpose is to say "here is what is true right now" cannot be
// another hand-maintained claim, so everything on it that CAN be read from the
// repository IS read from the repository.
//
// Exactly two things stay hand-written, because no file in the repo knows
// them: the short "what I'm on" paragraph (src/content/now.md) and the blocked
// list (roadmap/now.json), whose entries are usually external — a token, a
// decision, someone else's release.
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const EPICS_DIR = path.join(ROOT, "roadmap", "epics");
const NOW_JSON = path.join(ROOT, "roadmap", "now.json");
const NOW_NOTE = path.join(ROOT, "src", "content", "now.md");
const CHANGELOG = path.join(ROOT, "CHANGELOG.md");

const REPO_URL = "https://github.com/Jerry2d3d/css-is-awesome";

/**
 * How an epic's `**Status:**` line is classified.
 *
 * `closed` covers every way an epic stops being work without shipping:
 * deferred, folded into something else, superseded, or gate-failed. They are
 * deliberately NOT surfaced on /now — a reader wants to know what is moving,
 * and a list of things that will never happen is noise. They are still parsed
 * so that "unclassified" means "I could not read this", never "I ignored it".
 */
export type EpicState = "complete" | "in-flight" | "planned" | "closed";

export type Epic = {
  /** e.g. "EPIC-04" */
  id: string;
  /** e.g. "v1-4" */
  wave: string;
  /** Human title, from the file's `#` heading. */
  title: string;
  state: EpicState;
  /** The raw status sentence, trimmed — shown as the "why" on the page. */
  status: string;
  /** Repo-relative path, so every line on /now links to its source. */
  href: string;
};

export type Blocker = {
  what: string;
  why: string;
  /** YYYY-MM-DD. */
  since: string;
  /** Optional link proving it. */
  href?: string;
};

export type Release = {
  version: string;
  /** YYYY-MM-DD, from the CHANGELOG heading. */
  date: string | null;
  href: string;
};

export type NowData = {
  release: Release;
  note: string;
  noteUpdated: string | null;
  currentWave: string;
  inFlight: Epic[];
  next: Epic[];
  blocked: Blocker[];
  /** Status lines the parser could not classify. Empty in a healthy repo. */
  unparsed: { file: string; line: string }[];
  /** ISO instant the page was generated. */
  builtAt: string;
};

/**
 * Classify a `**Status:**` sentence.
 *
 * The shapes in roadmap/epics/ grew organically over five waves and are not
 * uniform: some lead with an emoji, some with a word, some with both, and the
 * line is not always the third line of the file. Rather than force a rewrite
 * of 30-odd epic files, this reads what is actually there.
 *
 * ORDER MATTERS. "Superseded — delivered early in v1.0" contains the word
 * "delivered" and a checkmark would be wrong; "BUILT, PUBLISH-BLOCKED"
 * contains "BUILT" but is not complete. The closed and in-flight tests run
 * before the complete test for exactly that reason.
 */
export function classifyStatus(status: string): EpicState | null {
  const s = status.toLowerCase();

  // Stopped without shipping. Checked first: several of these sentences also
  // contain words like "complete" or "shipped" while describing what replaced
  // them.
  if (
    s.includes("⛔") ||
    s.includes("⚠️") ||
    s.includes("superseded") ||
    s.includes("deferred") ||
    s.includes("folded") ||
    s.includes("gate failed")
  ) {
    return "closed";
  }

  // Moving. "PARTIAL" and "publish-blocked" both mean work exists and is not
  // finished, which is what a reader of /now wants to see.
  if (
    s.includes("🟡") ||
    s.includes("partial") ||
    s.includes("in progress") ||
    s.includes("publish-blocked")
  ) {
    return "in-flight";
  }

  if (s.includes("✅") || s.includes("complete") || s.includes("shipped")) {
    return "complete";
  }

  if (s.includes("planned")) return "planned";

  return null;
}

function firstStatusLine(text: string): string | null {
  for (const line of text.split(/\r?\n/)) {
    if (line.startsWith("**Status:**")) {
      return line.slice("**Status:**".length).trim();
    }
  }
  return null;
}

function firstHeading(text: string): string | null {
  for (const line of text.split(/\r?\n/)) {
    if (line.startsWith("# ")) return line.slice(2).trim();
  }
  return null;
}

/**
 * Strip the markdown a status sentence carries so it can sit in a table cell.
 * Links keep their text and lose their target; emphasis markers go.
 */
function toPlain(s: string): string {
  return s
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * A readable one-line summary of a status sentence.
 *
 * NOT "the first sentence". These lines usually open with a marker and a
 * single word — "🟡 PARTIAL — 12 of 13 stories shipped" — so cutting at the
 * first dash yields "PARTIAL", which tells a reader nothing they did not
 * already get from the section heading. The useful half is what comes after.
 *
 * So: keep the whole sentence, trimmed to a length that fits a line, cut on a
 * word boundary and marked with an ellipsis when it had to be cut. The marker
 * itself is dropped because the page already groups by state.
 */
function summarise(s: string, limit = 180): string {
  const plain = toPlain(s)
    // Leading marker + shouty word, e.g. "🟡 PARTIAL — " or "✅ Complete — ".
    .replace(/^[^A-Za-z0-9]*/u, "")
    .trim();
  if (plain.length <= limit) return plain;
  const cut = plain.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:—-]+$/, "")}…`;
}

/** Every epic file across every wave, with its parsed status. */
export function getEpics(): { epics: Epic[]; unparsed: { file: string; line: string }[] } {
  const epics: Epic[] = [];
  const unparsed: { file: string; line: string }[] = [];

  if (!fs.existsSync(EPICS_DIR)) return { epics, unparsed };

  const waves = fs
    .readdirSync(EPICS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^v\d+-\d+$/.test(d.name))
    .map((d) => d.name)
    .sort();

  for (const wave of waves) {
    const dir = path.join(EPICS_DIR, wave);
    const files = fs
      .readdirSync(dir)
      .filter((f) => /^EPIC-\d+.*\.md$/.test(f))
      .sort();

    for (const file of files) {
      const rel = `roadmap/epics/${wave}/${file}`;
      const text = fs.readFileSync(path.join(dir, file), "utf8");
      const status = firstStatusLine(text);

      if (status === null) {
        unparsed.push({ file: rel, line: "(no **Status:** line found)" });
        continue;
      }

      const state = classifyStatus(status);
      if (state === null) {
        unparsed.push({ file: rel, line: toPlain(status).slice(0, 120) });
        continue;
      }

      epics.push({
        id: (/^EPIC-\d+/.exec(file) ?? ["EPIC-??"])[0],
        wave,
        // toPlain() on the title too: several epic headings carry inline
        // code (`npm create cia`), and a raw backtick in a page heading reads
        // as a typo rather than as markup.
        title: toPlain(firstHeading(text) ?? file.replace(/\.md$/, "")),
        state,
        status: summarise(status),
        href: `${REPO_URL}/blob/main/${rel}`,
      });
    }
  }

  return { epics, unparsed };
}

/** Latest published version, and the date its CHANGELOG entry carries. */
export function getLatestRelease(): Release {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(ROOT, "package.json"), "utf8"),
  ) as { version: string };

  // Read the DATE from the changelog, but never the VERSION: package.json is
  // the one source the home page hero, the MCP server and the docs already
  // agree on, so taking the number from anywhere else invites a mismatch.
  let date: string | null = null;
  if (fs.existsSync(CHANGELOG)) {
    const text = fs.readFileSync(CHANGELOG, "utf8");
    const escaped = pkg.version.replace(/\./g, "\\.");
    const hit = new RegExp(
      `^#+ \\[?${escaped}\\]?[^\\n]*\\((\\d{4}-\\d{2}-\\d{2})\\)`,
      "m",
    ).exec(text);
    if (hit) date = hit[1];
  }

  return {
    version: pkg.version,
    date,
    href: `${REPO_URL}/releases/tag/v${pkg.version}`,
  };
}

type NowConfig = { currentWave: string; blocked: Blocker[] };

function readConfig(): NowConfig {
  if (!fs.existsSync(NOW_JSON)) return { currentWave: "", blocked: [] };
  const raw = JSON.parse(fs.readFileSync(NOW_JSON, "utf8")) as Partial<NowConfig>;
  return {
    currentWave: raw.currentWave ?? "",
    blocked: Array.isArray(raw.blocked) ? raw.blocked : [],
  };
}

/** The hand-written paragraph, plus the date it was last touched. */
function readNote(): { note: string; updated: string | null } {
  if (!fs.existsSync(NOW_NOTE)) return { note: "", updated: null };
  const raw = fs.readFileSync(NOW_NOTE, "utf8");
  const fm = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  const updated = fm ? (/^updated:\s*(.+)$/m.exec(fm[1])?.[1].trim() ?? null) : null;
  return { note: (fm ? raw.slice(fm[0].length) : raw).trim(), updated };
}

/**
 * Everything /now renders. One call, one read of the tree.
 *
 * `next` is scoped to the current wave on purpose. The backlog runs to v2.0
 * and listing all of it answers "what might happen eventually", which is the
 * roadmap's job. /now answers "what is happening", so it stops at the wave
 * actually being worked.
 */
export function getNow(): NowData {
  const { epics, unparsed } = getEpics();
  const { currentWave, blocked } = readConfig();
  const { note, updated } = readNote();

  return {
    release: getLatestRelease(),
    note,
    noteUpdated: updated,
    currentWave,
    inFlight: epics.filter((e) => e.state === "in-flight"),
    next: epics.filter((e) => e.state === "planned" && e.wave === currentWave),
    blocked,
    unparsed,
    builtAt: new Date().toISOString(),
  };
}

/** Pretty "v1-4" → "v1.4", for display only. */
export function waveLabel(wave: string): string {
  return wave.replace(/^v/, "v").replace("-", ".");
}
