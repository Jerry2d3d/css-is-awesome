# EPIC v1.3-02 — Theme Marketplace

**Status:** Planned (v1.3)
**Effort estimate:** ~1 week
**Stories:** 8

## Mission

Ship `/themes/community` — a gallery page of community-submitted themes. Submissions via GitHub PR (no backend in v1.3). Maintainer moderation tooling. The Figma plugin + theme editor make submitting easy; the marketplace makes themes discoverable.

## Why now

v1.0 ships 9 themes. The theme editor (v1.0) and Figma plugin (v1.3) make creating a new theme accessible. Without a marketplace, community themes sit in scattered GitHub repos. With a marketplace, they're a click away on the cia website.

## Out of scope

- Paid themes / monetization
- Backend storage / user accounts (v1.3 uses GitHub PRs as the submission flow)
- Rating + comments (community feedback on PRs is enough for v1.3)
- Automatic moderation via AI (manual review only in v1.3)

## Features

### F2.1 — Community themes folder structure

#### US-V13.02.1.1 — Define `public/themes/community/<author>/<theme>/` structure

**Acceptance criteria:**
- [ ] Folder structure documented in `CONTRIBUTING-THEMES.md`
- [ ] Each theme directory contains: `theme.css`, `theme.scss`, `preview.png`, `README.md`
- [ ] README format requires: author info, theme name, description, mood, license
- [ ] Default license: MIT (community contributors agree by submitting)

**Effort:** S (≤4 hrs)

#### US-V13.02.1.2 — GitHub PR template for theme submissions

**Acceptance criteria:**
- [ ] PR template at `.github/PULL_REQUEST_TEMPLATE/theme-submission.md`
- [ ] Template includes a checklist: theme.css valid, contrast passes, preview image included, README complete
- [ ] CI runs `validate-themes` against any new files in `public/themes/community/`

**Effort:** S (≤4 hrs)

---

### F2.2 — Community gallery page

#### US-V13.02.2.1 — Build `/themes/community` page

**As** a cia user looking for inspiration
**I want** to browse community-submitted themes with preview images
**So that** I find a theme that matches my brand without building one from scratch

**Acceptance criteria:**
- [ ] Page at `src/app/themes/community/page.tsx`
- [ ] Lists every directory under `public/themes/community/` as a card
- [ ] Each card: preview image, name, author, one-line description, "Use" + "Edit in editor" buttons
- [ ] Filter by tag (e.g. dark, brutalist, editorial, minimal)
- [ ] Links to the existing `/themes/gallery` for shipped themes; this page is the community complement

**Effort:** M (4-8 hrs)
**Depends on:** US-V13.02.1.1

#### US-V13.02.2.2 — Theme detail page

**Acceptance criteria:**
- [ ] Page at `src/app/themes/community/[author]/[theme]/page.tsx`
- [ ] Shows preview, README, "Download .css" + "Download .scss" + "Open in editor" + "Use as base"
- [ ] Lists token customizations vs nearest base theme
- [ ] Contrast validation badge

**Effort:** M (4-8 hrs)

---

### F2.3 — Maintainer moderation tooling

#### US-V13.02.3.1 — Submission validation script

**As** the maintainer (Jerry) reviewing a theme PR
**I want** a script that checks the submitted theme against the contract + a11y validator + preview-image presence
**So that** I don't spend 20 minutes per submission on triage

**Acceptance criteria:**
- [ ] Script at `scripts/validate-community-theme.mjs`
- [ ] Runs `validate-themes` on the .css
- [ ] Asserts `preview.png` exists + is under 500 KB + is 1280×800
- [ ] Asserts README has all required sections
- [ ] CI runs on every PR that touches `public/themes/community/`
- [ ] CI status visible on the PR

**Effort:** M (4-8 hrs)

#### US-V13.02.3.2 — Featured themes mechanism

**Acceptance criteria:**
- [ ] `featured: true` flag in theme README frontmatter
- [ ] Community page sorts featured themes first
- [ ] Maintainer (only) can flip the flag via PR review
- [ ] Featured themes get a badge on their card

**Effort:** S (≤4 hrs)

---

### F2.4 — Launch + seed content

#### US-V13.02.4.1 — Seed marketplace with 3 themes

**Acceptance criteria:**
- [ ] Jerry submits 3 themes (or invites known cia users to submit) to seed the marketplace
- [ ] At least 1 theme demonstrates the Figma plugin import flow
- [ ] At least 1 theme demonstrates the in-browser theme editor flow

**Effort:** M (4-8 hrs)

#### US-V13.02.4.2 — Announce on launch

**Acceptance criteria:**
- [ ] Tweet / Bluesky / dev.to post when v1.3 ships
- [ ] cia README links to the marketplace
- [ ] Docs page explains how to submit

**Effort:** S (≤4 hrs)

## Definition of done

- [ ] All 8 stories accepted
- [ ] `/themes/community` page lives
- [ ] At least 3 themes seeded
- [ ] Validation script lives + runs in CI
- [ ] CONTRIBUTING-THEMES.md updated with submission flow
- [ ] PR template + CI checks live

## Risks

- **Submission quality.** Spam / low-effort themes could clutter. Mitigation: validation script catches the worst; manual maintainer review for taste.
- **Maintenance burden as marketplace grows.** Jerry doesn't want a treadmill. Mitigation: keep submission bar high; defer paid/featured mechanisms; revisit governance if it grows past 50 themes.
- **License clarity.** Contributors might submit themes that copy other systems' visual design. Mitigation: PR template asks "is this your original work?" — Jerry's call on each.

## Related

- [v1.3 EPIC-01-figma-plugin.md](./EPIC-01-figma-plugin.md) — Figma plugin can export to a marketplace-ready theme
- [v1.0 EPIC-02-theme-editor-polish.md](../v1-0/EPIC-02-theme-editor-polish.md) — in-browser editor produces marketplace-submittable themes
