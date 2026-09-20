# EPIC-06 — The blog: engineering the system + CSS discoveries

**Status:** ✅ Complete — 5/5 stories, verified 2026-09-19.

> **Completion note (2026-09-19).** All five stories were delivered
> incrementally through September as the blog grew; the checkboxes below
> were never flipped, so the epic read "unstarted" while the feature was
> live. A verification pass on 2026-09-19 checked each story against the
> source and closed the one genuine gap.
>
> - **B6.1** — `src/lib/blog-tracks.ts` owns the track model; the index
>   (`src/app/blog/BlogExplorer.tsx`) renders one section per track with
>   `aria-pressed` chip filters plus a text filter. **Shipped as THREE
>   tracks, not two:** engineering, CSS discoveries, and AI. The third
>   drawer is a deliberate expansion of this epic's charter.
> - **B6.2** — three discovery posts live, exactly the candidates this
>   epic named: `css-anchor-positioning-dropdown-engine`,
>   `the-popover-attributes-invisible-ua-stylesheet`,
>   `there-is-no-nth-of-class`.
> - **B6.3** — `src/app/feed.xml/route.ts`, an Atom feed built from the
>   same frontmatter the index reads, `dynamic = "force-static"` so it
>   lands in the static export as a literal file. Undated posts are
>   excluded; `<link rel="alternate">` is on `/blog`.
> - **B6.4** — forward links were present in all three posts; the
>   **reverse** direction was missing entirely. Closed 2026-09-19: the
>   browser-support matrix now links the post that explains its row for
>   Popover API, `:has()`/tabs and anchor positioning, and the
>   `nth-of-class` post now also links `/docs/components/tabs` (which
>   still indexes panels with `:nth-of-type()` — verified in
>   `scss/components/_tabs.scss`).
> - **B6.5** — `src/content/blog/README.md` carries the two-drawer rule,
>   the four standing publish rules, the "quality over cadence" note and
>   the frontmatter schema.

> Added 2026-09-06 (Jerry's charter). The blog is about **two things**:
> css-is-awesome itself, and the new/cool CSS Jerry finds along the way.
> Not a marketing feed — a working engineer's notebook with two drawers.

## Mission

Make the blog a destination worth following even for people who never
install cia — the same positioning as the planned YouTube channel: **CSS
knowledge, brought to you by css-is-awesome**, not a cia tutorial feed.
The engineering posts prove how the system is built; the discovery posts
prove the author lives on the platform's edge.

## The two tracks

**Track A — Engineering the system** (exists, keep going)
Post-mortems and build stories from the repo: the validator that wasn't
looking, the tabs that highlighted but never switched, the barrel that
emits nothing. Standing rule already in force: publish only after the
fix ships; never describe an open security hole; no secrets/paths.

**Track B — CSS discoveries** (NEW)
New and cool CSS: platform features as they land (anchor positioning,
`@starting-style`, view transitions, `:has()` tricks, container style
queries), techniques found in the wild, honest "we tried it, here's
what broke" notes. Where a discovery intersects cia, say so in one
closing paragraph — the discovery is the star, cia is the sponsor.

## Stories

- [x] **B6.1 — Category split in the index.** Frontmatter `category`
      already exists (`engineering`); add `discovery`; the blog index
      groups or filters by track (tabs or chips — reuse the recipe-chip
      pattern, tokens only).
- [x] **B6.2 — First three discovery posts.** Seed Track B so it's a
      track, not a promise. Candidates from this month's real work:
      anchor positioning + `position-try-fallbacks` (the dropdown saga),
      the Popover API's hidden UA styles (`width: fit-content`,
      `display` guards), `nth-of-type` vs the missing `nth-of-class`.
- [x] **B6.3 — RSS/Atom feed.** Static export can emit `feed.xml` at
      build time from the same frontmatter the index reads; followers
      without bookmarks.
- [x] **B6.4 — Cross-links.** Each discovery post links the docs page or
      recipe where cia operationalized the idea (and vice versa — the
      browser-support matrix links posts that explain a tier row).
- [x] **B6.5 — Cadence note in CONTRIBUTING/blog README.** Two drawers,
      no schedule pressure: engineering posts when something ships or
      breaks; discovery posts when something is genuinely cool. Quality
      over cadence.

## Relationship to existing plans

- `roadmap/blog-architecture.md` (2026-05, 26 planned posts) supplies
  Track A's backlog; this epic doesn't replace it — it adds Track B and
  the index/feed plumbing.
- The YouTube channel strategy (broad CSS knowledge, cia as sponsor)
  shares Track B's editorial line; discovery posts are natural video
  scripts later.

## Definition of done

Index shows both tracks distinctly; `discovery` category live with ≥3
posts; feed.xml served; standing publish rules recorded where authors
will see them.
