# Working notes

Short dated entries about what was being worked on. Rendered at `/notes`.

## Format

One markdown file per note, named `YYYY-MM-DD-slug.md`:

```markdown
---
title: A sentence, not a label
date: 2026-09-25
tags: optional, comma, separated
---

Body.
```

`title` and `date` are the only fields that matter. Files starting with `_`
are drafts and are not rendered, same convention as the blog.

## Length

100 to 300 words is the target. Nothing enforces it. The point of the target
is that a note should cost minutes, because a note that costs an hour does
not get written and the log dies.

## There is no cadence

Gaps are expected and are not a failure. This is a log, not a quota. CI warns
if the newest note is more than 60 days old and it will never fail the build
for it.

## The rules

**Privacy.** The same rule as `roadmap/handoffs/README.md`, which exists
because a sweep had to pull other projects' material back out of this public
repo. A note may say "a consumer reported a break and here is what we changed".
A note may not name another project's source, file paths, architecture or
inventory counts. `scripts/check-notes-privacy.mjs` machine-checks the obvious
half of this in CI; the judgement half is yours.

**Scope: this project only.** Decided 2026-09-24. The log covers
css-is-awesome and nothing else. A cross-project log would put the privacy
rule under constant pressure, which is the opposite of what the sweep
achieved.

**No tooling attribution.** Notes describe the work, not what helped produce
it.

**Every claim links to its evidence.** A commit, a PR, a file, a release. A
note asserting something with nothing to check is the thing this log exists to
stop.
