# EPIC v1.4-04 — The devlog: `/now` + working notes

**Status:** ✅ Complete — built 2026-09-25. All five open questions answered (see below). `/now`, `/notes` and the first `ai`-track post are live; two CI guards keep them honest. One story shipped differently from its acceptance criteria and is disclosed there.
**Effort estimate:** ~3-4 working days
**Stories:** 9

## Mission

Two surfaces that answer "what is this person working on right now", one
generated and one written:

- **`/now`** — the current state of the project, derived at build time from
  sources that cannot go stale: the latest release, the epic statuses in this
  folder, and whatever is blocked. Replaced on every build, never appended.
- **Working notes** — short dated entries in the author's voice: what got
  built this week, what broke, what got decided and why. Days, not essays.

Together they are the answer to a visitor's first question. The docs say what
cia *is*; the blog says what was *learned*; neither says what is *happening*.

## Why now

Three reasons, in order of honesty.

1. **The portfolio reason.** The repo is public and the site is live, but a
   visitor landing today sees a finished artefact with no pulse. A `/now` page
   showing "1.19.1 shipped Tuesday, page surfaces in progress, install wizard
   blocked on a token" converts a static impression into an active one. That
   is the single cheapest signal of momentum this project can emit.
2. **The anti-staleness reason.** Every documentation sweep this month found
   the same failure: a hand-maintained claim that quietly stopped being true.
   Stale recipe counts, a roadmap epic marked unstarted while the feature was
   live, another marked planned while it was built, a "current published
   version is 0.8.2" line eleven versions out of date. A status page written by
   hand would rot the same way inside a fortnight. A status page *derived* from
   the epic files and the release history cannot — and it makes the roadmap's
   own accuracy load-bearing, which is exactly the pressure that keeps it true.
3. **The writing reason.** The blog has three tracks and the third is empty
   (`engineering` 12 posts, `discovery` 3, `ai` 0). Long-form posts have a high
   activation cost, so they get written when something big happens and never in
   between. Working notes are the low-friction format that fills the gap, and
   in practice they become the raw material for the long-form posts later.

## Out of scope

- A CMS, an editor UI, or any authoring surface. Notes are markdown files in
  the repo, like every other piece of content here.
- Comments, reactions, or any social layer.
- Analytics. Separate decision, separate work.
- Anything about other projects' internals — see the privacy rule below, which
  is a hard constraint on this epic, not a preference.
- Backdating. The log starts the day it ships; it does not invent history.

## Hard constraints

- **Static export.** `/now` is generated at build time, not fetched at runtime.
- **Zero runtime JavaScript in the npm package.** This is site-only work.
- **The privacy rule already recorded in `roadmap/handoffs/README.md` applies
  verbatim.** Working notes may say "shipped a fix a consumer reported"; they
  may not name another project's internals, file paths, architecture or
  inventory counts. The whole point of the September 2026 privacy sweep was to
  get that material *out* of the public repo; a devlog is the most likely
  surface to put it back in by accident.
- **No AI attribution**, per the standing rule. Notes describe the work, not
  the tooling that helped produce it.

## Features

### F4.1 — `/now`, derived from real sources

#### US-V14.04.1.1 — Build-time status collector

**As** the site
**I want** a server-side module that assembles the current project state from
sources already in the repo
**So that** the page cannot drift from reality the way a hand-written one would

**Acceptance criteria:**
- [ ] Module at `src/lib/now.ts`, server-only by construction (reads `node:fs`)
- [ ] **Latest release:** version + date, read from `package.json` and `CHANGELOG.md` (the same package.json the home page already stamps, so the two can never disagree)
- [ ] **In flight:** epics under `roadmap/epics/` whose status line marks them in progress or partial, with their version folder
- [ ] **Next up:** epics marked Planned in the *current* wave only, not the whole backlog
- [ ] **Blocked:** an explicit, hand-maintained short list (some blockers are external — an npm token, a decision — and no file in the repo knows about them)
- [ ] Parses the existing status-line shapes; a status line it cannot parse is reported at build time rather than silently dropped
- [ ] Unit-tested against the real `roadmap/epics/` tree

**Effort:** L (1-2 days)

#### US-V14.04.1.2 — The `/now` page

**Acceptance criteria:**
- [ ] Page at `src/app/(site)/now/page.tsx`, statically exported
- [ ] Sections: a one-paragraph hand-written "what I'm on" note, then Shipped / In flight / Next / Blocked from the collector
- [ ] Every generated line links to its source (the epic file, the release, the changelog entry)
- [ ] States plainly when it was last built, so a reader knows the page's age
- [ ] Styled with cia mixins only, tokens only, no new one-off CSS
- [ ] Linked from the site nav and from the About page

**Effort:** M (4-8 hrs)

---

### F4.2 — Working notes

#### US-V14.04.2.1 — The note format

**As** the author
**I want** a format lighter than a blog post
**So that** writing one costs minutes and therefore actually happens

**Acceptance criteria:**
- [ ] Notes live in `src/content/notes/*.md` with frontmatter: `date`, `title`, optional `tags`
- [ ] A note is expected to be 100-300 words; nothing enforces it, but the template says so
- [ ] Rendered by the existing markdown pipeline — no second renderer (see the recipe/blog renderer both already using `marked`)
- [ ] `src/content/notes/README.md` records the format, the privacy rule and the no-cadence-pressure rule

**Effort:** M (4-8 hrs)

#### US-V14.04.2.2 — The notes index + individual note pages

**Acceptance criteria:**
- [ ] `/notes` lists newest first, grouped by month, each entry showing date + title + first line
- [ ] `/notes/<slug>` renders one note
- [ ] Both statically exported; both in the smoke spec, with routes **derived from disk** rather than hand-listed (the blog and recipe route lists both fell behind when hand-maintained)
- [ ] Included in the existing `feed.xml`, or given a sibling feed — decide during build, record which and why

**Effort:** M (4-8 hrs)

#### US-V14.04.2.3 — Seed the log

**Acceptance criteria:**
- [ ] 3 notes written from real September 2026 work, verified against the repo
- [ ] Candidates: the two-hour spike that killed a two-week epic; the consumer-reported contract break fixed with a CI gate the same day; the roadmap audit that found five epics whose status contradicted the code
- [ ] Each links to the commit, PR or epic it describes
- [ ] Each passes the privacy rule — describes cia's side of the story only

**Effort:** M (4-8 hrs)

---

### F4.3 — Keeping it honest

#### US-V14.04.3.1 — Staleness guard

**As** the maintainer
**I want** CI to fail when `/now` would render something untrue
**So that** the page that exists to prevent staleness cannot itself go stale

**Acceptance criteria:**
- [ ] Script at `scripts/check-now.mjs`, wired into CI
- [ ] Fails if the collector cannot parse an epic status line
- [ ] Fails if the hand-maintained "blocked" list references an epic or PR that no longer exists or has since closed
- [ ] Warns if the newest working note is older than 60 days — a warning, never a failure; this is a log, not a quota

**Effort:** M (4-8 hrs)

#### US-V14.04.3.2 — Privacy lint for notes

**Acceptance criteria:**
- [ ] The existing privacy rule is machine-checked for `src/content/notes/**`: no local filesystem paths (`K:/`, `C:/Users`), no other project's internal source paths
- [ ] Reuses or extends whatever check the September privacy sweep left behind rather than writing a second one
- [ ] Runs in CI

**Effort:** S (≤4 hrs)

---

### F4.4 — Discoverability

#### US-V14.04.4.1 — Entry points

**Acceptance criteria:**
- [ ] Nav links `/now`; the About page links both `/now` and `/notes`
- [ ] The home page carries one line of current status linking to `/now` — one line, not a widget
- [ ] `llm.txt` mentions `/now` so an agent asking "what is being worked on" has an answer

**Effort:** S (≤4 hrs)

#### US-V14.04.4.2 — The "how I use AI" post

**Acceptance criteria:**
- [ ] One long-form post in the empty `ai` track, giving that track its first entry
- [ ] Angle, decided 2026-09-21: what the tooling got *wrong* and what was built to catch it — not a productivity claim
- [ ] Four episodes, all verifiable in this repo: the epic killed by its own spike; a false all-clear given to a consumer and how it was caught; a validator that passed while auditing nothing; a roadmap that lied in both directions
- [ ] Every claim links to the commit, PR or file that proves it
- [ ] No AI attribution anywhere in the post's framing — it is an engineering post about verification, not a tools review

**Effort:** M (4-8 hrs)

## Definition of done

- [x] `/now` live, generated, every line traceable to its source — `src/lib/now.ts` reads `package.json`, `CHANGELOG.md` and every `roadmap/epics/*/EPIC-*.md`; each row links to the epic file it came from
- [x] `/notes` live with 3 real seed entries — the spike that killed an epic, the green check that proved nothing, the roadmap that lied in both directions
- [x] CI fails on an unparseable epic status or a stale blocker reference — `npm run check:now`; it found one epic file with no status line at all on its first run
- [x] Privacy lint covers the notes directory — `npm run check:notes-privacy`, mechanical half only, and the script says so rather than implying more
- [x] The `ai` track has its first post — `src/content/blog/what-the-ai-got-wrong.md`
- [x] Nav, About and `llm.txt` point at the new surfaces — **home page line deliberately NOT built, see open question 5**

## Risks

- **It becomes another thing to maintain.** Mitigated by design: `/now` is
  derived, and notes carry no cadence obligation. The only hand-maintained
  piece is the blocked list, which is short and CI-checked.
- **Privacy regression.** The likeliest place to leak another project's detail
  is a casual note. That is why F4.3.2 is a CI check and not a guideline.
- **Writing stops.** If the log goes quiet the page says so honestly rather
  than pretending. A dated, obviously-dormant log is still more honest than a
  polished page implying activity that stopped.
- **`/now` disagrees with the roadmap.** Impossible by construction — it reads
  the roadmap. This is the point.

## Open questions — need Jerry's call before build

1. ~~**Scope of "what I'm working on".**~~ **DECIDED 2026-09-24: this project
   only.** The log covers css-is-awesome and nothing else. A cross-project
   log would put the privacy rule under constant pressure, which is the
   opposite of what the September sweep achieved; if one is ever wanted it
   belongs on a personal site, not in this repository. This is a hard
   constraint on every note, not a default to drift from.
2. ~~**Is `/notes` a fourth blog track, or its own surface?**~~ **DECIDED
   2026-09-25: its own surface.** Blog posts are narrative and permanent;
   notes are dated and disposable. Mixing them makes the blog index harder to
   scan and, worse, puts quiet pressure on every note to justify itself as a
   post — which is the pressure that stops short notes from being written at
   all. `/notes` is deliberately not in the nav either; it is reached from
   `/now` and from About, because a working log is something a reader goes
   looking for rather than something the site pushes at them.
3. ~~**One feed or two?**~~ **DECIDED 2026-09-25: one feed.** `/feed.xml` now
   carries posts and notes merged and sorted by date, each with an Atom
   `<category>` (`note` / `Working notes` for notes, the existing track for
   posts). Two feeds would mean anyone wanting both has to find and subscribe
   to both, and anyone subscribing to one silently misses half the output.
   A reader who wants one kind filters; a reader who wants everything does
   nothing.
4. ~~**How blunt is "blocked"?**~~ **DECIDED 2026-09-25: name technical
   blockers, never people.** The one entry seeded reads "create-cia is not on
   npm — the publish token returns E401". That is a fact about a credential,
   not about a person, and it is already visible in the repo's own CI logs.
   `scripts/check-now.mjs` fails the build if a blocked entry points at a PR
   that has since closed, so the list cannot quietly become fiction.
5. ~~**Does the home page carry a status line?**~~ **DEFERRED 2026-09-25 — not
   built, needs Jerry's eye.** Everything else in F4.4 shipped: the nav links
   `/now`, About links both surfaces, `llm.txt` points an agent at `/now`
   before it asks whether a feature exists. The home-page line is the one
   piece that changes the page Jerry most wants stable, and a logo change to
   that same page was reverted on request the day before this was built. It is
   a one-line addition whenever he wants it; it should not arrive as a
   side effect of an epic.

## Related

- [v1-1 EPIC-06](../v1-1/EPIC-06-blog.md) — the blog's two tracks; this epic
  adds the third surface and fills the empty `ai` track
- [`roadmap/handoffs/README.md`](../../handoffs/README.md) — the privacy rule
  this epic inherits as a hard constraint
- [`roadmap/blog-architecture.md`](../../blog-architecture.md) — the long-form
  post backlog; working notes feed it rather than replace it
