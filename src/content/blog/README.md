# Blog authoring guide

> This file is not a post. `src/lib/blog.ts` excludes `README.md` and any
> `_`-prefixed file from the post list — use `_something.md` for drafts.

Every `.md` file in this directory (other than the exclusions above) renders
at `/blog/<filename-without-extension>/`, appears on the `/blog` index, and is
syndicated in `/feed.xml`. Committing a post **is** publishing it.

## The two tracks

The blog is two drawers, split on the index by the `category` frontmatter:

- **Engineering the system** (Track A) — post-mortems and build stories from
  this repo: the validator that wasn't looking, the tabs that highlighted but
  never switched, the barrel that emits nothing. Proof of how the system is
  built.
- **CSS discoveries** (Track B, `category: discovery`) — new and cool CSS:
  platform features as they land, techniques found in the wild, honest "we
  tried it, here's what broke" notes. **The discovery is the star; cia is the
  sponsor** — where a discovery intersects cia, say so in one closing
  paragraph, not throughout.

Any category other than the literal `discovery` (including a missing one)
lands in Track A. Track A categories in use: `engineering`, `architecture`,
`technique`.

## Standing publish rules

1. **Publish only after the fix ships.** A post-mortem goes live when the
   commit it describes is on `main` (or released), never before.
2. **Never describe an open security hole.** If the write-up would hand
   someone an exploit against a live deployment, it waits.
3. **No secrets, no local paths.** No tokens, no `K:\...` or `/Users/...`
   paths, no internal URLs. Code snippets get the same scrub as the code
   itself.
4. **Sponsor, not subject** (Track B). Discovery posts must be worth reading
   for people who will never install cia.

## Cadence: quality over cadence

There is no schedule. Engineering posts happen when something ships or
breaks; discovery posts happen when something is genuinely cool. A month of
silence beats a filler post — never publish to fill a calendar.

## Frontmatter schema

Flat `key: value` lines between `---` fences (no nested YAML). List fields
are comma-separated.

```yaml
---
title: The validator that wasn't looking     # required
slug: the-validator-that-wasnt-looking       # informational — the FILENAME is the slug
category: engineering                        # engineering | architecture | technique | discovery
tags: accessibility, testing, post-mortem    # comma-separated
audience: front-end developers               # comma-separated, optional
excerpt: One or two sentences for the index card and the feed summary.
author: Jerry Hansen                         # defaults to Jerry Hansen if omitted
publishDate: 2026-08-17                      # YYYY-MM-DD; without it the post is
                                             # undated, sorts last, and is left out of feed.xml
updatedDate: 2026-08-17                      # optional; bump on meaningful revisions
---
```

Do **not** add a `readingTime` key — it is computed from the body at build
time and a frontmatter value would be ignored (hand-typed values were wrong
in six of the first eight posts).
