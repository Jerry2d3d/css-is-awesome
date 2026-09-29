# EPIC v1.5-02 — Documented claims are gated, and cia's design has one source

**Status:** Planned (v1.5)
**Effort estimate:** ~3 working days
**Stories:** 9

## Mission

Make a false claim in the docs fail CI, the same way a false claim in the code
already does. And write down the rule that decides whose opinion shapes the
system, so it stops being decided case by case.

## Why now

A three-way documentation audit on 2026-09-28 found roughly sixty defects. The
distribution is the point:

| kind | examples |
| --- | --- |
| **Syntax that does not compile** | `@use 'css-is-awesome' with ($utilities: true)` in four files — the variable has never existed. `with ($brand: …)` in `THEMING.md` — the configurable name is `$theme-brand`. `m.button(primary)`, `m.button-primary`, `m.duration()` — no such mixin or function in any namespace. |
| **Classes and tokens that do not exist** | `.cia-btn`, `.cia-btn-primary`, `.cia-card`, `.cia-container` — zero rules in every shipped bundle, while `/docs` presents them as "the exact HTML that produced" a live demo. `cia-sm:` responsive variants — an entire documented section with no implementation. `--motion-duration-*`, `--text-default`, `VALID_THEMES`. |
| **Numbers that drifted** | optional tokens stated as 36 or 41 across eight files (really 49); audited contrast pairs as 17 or 22 across six (really 24); API coverage 174 (188); Playwright 240 (457); contract version 1 and 1.2 (1.3). |
| **Claims that undercut a promise** | `/docs/mobile` headed "Tap targets: 44px minimum" while `--touch-target-min` ships as 24px, so its own sample computed to 24px. |

None of this was caught by a person reading carefully, because **every one of
these documents agreed with another document.** The README said "34 tools" in
one paragraph and "30/30 MCP tools" in another and both survived for months.
Doc-agrees-with-doc is not verification, and it is the only kind of checking
this project has ever applied to prose.

Meanwhile the code side of the same repo has twenty-two CI gates. A mixin
cannot ship without a coverage fixture; a theme cannot ship missing a token; a
scale key cannot be mistyped without a warning. The asymmetry is the bug.

## Why it also matters for whose design this is

cia has downstream consumers — a documentation site, an installer, a
design-tool integration, a boilerplate. Each is a legitimate source of **bug
reports** and an illegitimate source of **design decisions**, and the
difference has had to be re-argued each time one of them sends a handoff.

The standing rule, written down here rather than remembered: **websites and web
apps come first; no downstream project shapes the system's design.** A handoff
from one of them is a claim about cia's behaviour, and it is actioned only
after being reproduced against cia's own source. That is how the page-surface
bug was handled correctly — reported from outside, confirmed inside, fixed
because the confirmation held, not because it was reported.

## Stories

### US-1.5.2.1 — `check:doc-claims`

A script that extracts every stated count from the docs and asserts it against
the tool that owns the number: `scripts/theme-contract.json` for required and
optional tokens and the contract version, `scripts/audit-pairs.json` for
audited pairs, `coverage:api` and `coverage:mcp` for coverage, the filesystem
for theme, recipe and glyph counts, `playwright test --list` for test counts.
Fails with the file, line, stated value and real value.

This alone would have caught about thirty of the sixty findings, and it catches
them on the commit that introduces them rather than a quarter later.

### US-1.5.2.2 — `check:doc-syntax`

Compile every SCSS sample in the docs — markdown fences and the JSX code
blocks on the docs site — against the real `scss/` sources. Any sample that
fails to compile fails the build.

`validate-recipes` already does exactly this for the 32 recipe files, and the
recipes were the only corpus in the audit with **zero** broken samples. The
gate works; it has simply never been pointed at the rest of the documentation.

### US-1.5.2.3 — Every documented class must exist

Extract every `cia-*` class name appearing in a doc and assert it is present in
`dist/css-is-awesome.css`. This is the check that would have caught the
getting-started page telling readers to write `class="cia-btn-primary"` against
a bundle that has never contained it.

### US-1.5.2.4 — Every documented token must exist

Same shape, for `--token` names: each must be in the contract or emitted by the
library. Catches `--motion-duration-*` and `--text-default`, and would have
caught `--touch-target-min` being quoted at a value it does not ship.

### US-1.5.2.5 — Shipped docs may only point at shipped paths

A doc inside the `files` manifest must not reference a path outside it. The
audit found consumer-facing docs pointing at `CONTRIBUTING.md`,
`.github/ISSUE_TEMPLATE/`, `roadmap/` and `src/` — all real in the repo, all
absent from an installed package, so every one is a dead end for the reader it
was written for.

### US-1.5.2.6 — No internal-only names in shipped files

Two shipped docs cite private notes-file names that exist nowhere in the
repository. Nothing checked, because nothing was looking. The guard: no
reference in a shipped file may name a path that is neither in the repo nor in
the manifest.

Same script covers absolute local paths and any downstream project's internal
file names — the existing privacy rule, enforced rather than remembered.

### US-1.5.2.7 — The namespace a sample uses must be the namespace that resolves

`scss/mixins` does not forward components, layout or animations; only the
`/api` barrel does. Thirty-four documented samples call `m.btn`, `m.modal`,
`m.stack` and friends through a binding that cannot resolve them. Compiling the
sample (US-1.5.2.2) catches this only when the sample includes its own `@use`
line — several do not, so the check must also flag a sample that shows a
namespace it never establishes.

### US-1.5.2.8 — Write the consumer rule into `AGENTS.md`

One short section: downstream projects are consumers. Their handoffs are bug
reports, reproduced against cia's source before anything changes. Design
direction comes from the system's own principles and from real consumer
signal, never from what happens to be convenient for a downstream tool.

### US-1.5.2.9 — Wire all of it into CI

Each check as its own named step with a comment saying which real failure it
exists to prevent, matching the convention every other gate in `ci.yml`
already follows.

## Definition of done

- [ ] All nine stories accepted
- [ ] The full audit findings list passes cleanly — every check green on a repo where the known defects are fixed, and red on the commit before
- [ ] Each new check fails loudly on a deliberately planted defect, proven in a test
- [ ] `npm run check:doc-claims` and `check:doc-syntax` run in `ci.yml` on every PR
- [ ] `AGENTS.md` carries the consumer rule

## Deliberately not in scope

**Generating the docs from the source.** It would make drift impossible and it
would also make the docs worse — the value of these pages is the prose around
the numbers, and a generator writes neither. The goal is a gate that fails when
prose and reality disagree, not the removal of prose.

**Rewriting the audit's findings.** That work is separate and lands first; this
epic is the guard that stops it happening again.
