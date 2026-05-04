# Session resume — 2026-05-04 pause

Quick-reference doc for picking the work back up after the computer restart.
Branch is `feat/v0.7-port-fixes` and pushed.

## Where we are

- v0.7 release branch is in shape — all 4 audit items shipped, React bundle stripped, every theme paired light/dark, naming migration done.
- Tarball: ~64 files / ~134 KB. Pure styling system.
- Validator: 14 files / 33 theme blocks pass.

## In-flight work (uncommitted at the time of pause — landing in the WIP commit alongside this file)

1. **Light/dark toggle** — `src/components/LightDarkToggle/` — committed earlier, working on every paired theme.
2. **Family-picker dropdown** — `src/components/ThemeSelect/` — wired into the header alongside the toggle. Picks family, preserves mode (Glass Light → Sketchbook = Sketchbook Light). NOT FINAL — see "next session."
3. **Header SCSS** — `src/components/SiteHeader/SiteHeader.module.scss` adds `.themeControls` flex group on the right.
4. **Terminal folder rename** — `public/themes/terminal/` → `public/themes/terminal-dark/` to align with naming convention.

## Design decisions made today

### Two controls on every page (header)
- **Theme switch (dropdown)** — full list, all themes including Prism + future add-ons.
- **Light/dark toggle** — flips mode within the current family.

### Floating bottom-right control (every page) — NOT BUILT YET
- Limited to the **6 core themes** that ship in the npm download (sketchbook, press, graphite, glass, cupertino, terminal).
- Linked to the header dropdown — picking one updates the other.
- Open: "override" mechanic. Reading A (most recent click wins, simple sync) vs Reading B (bottom-right is the saved anchor, dropdown is preview). **Question still open with user.**

### `/themes` page only — cross-theme pairing UI ("cool control") — NOT BUILT YET
- Lets users say "my light theme is Glass, my dark theme is Sketchbook."
- Not on every page; clutter belongs in the config destination.
- Implements Feature 2.15 (cross-theme mixing) — already in roadmap.

### User is rebuilding Terminal Light
- User has a UI/UX builder tool that generates theme.css files.
- They will hand-deliver `public/themes/terminal-light/theme.css` from their tool.
- Mood: "computer program light theme" — light gray paper, near-black text.
- Drop the file in, run `node scripts/bundle-companion-themes.mjs`, validate, commit.

## Open questions for next session

1. **Floating bottom-right behavior — A or B?**
   - A: most recent click wins, both controls always sync.
   - B: bottom-right is anchored choice; dropdown is preview that doesn't disturb the anchor.
2. **`ThemeSelect` in header — keep, modify, or replace with the floating control entirely?**
   - User wants the dropdown on every page AND a floating bottom-right.
   - Currently committed in this WIP — header has the dropdown. Floating widget still TBD.
3. **Terminal Light** — wait for user to deliver their version or proceed with my gray rebuild?

## Next actions when resuming

1. **Confirm A vs B** on the override mechanic.
2. **Receive Terminal Light** from user's UI/UX builder; replace the current `terminal-light/theme.css`.
3. **Build the floating bottom-right control** — new `src/components/ThemeFloater/` (or similar). Limited to 6 core themes. Linked to header `ThemeSelect`.
4. **Build `/themes` page cross-pairing widget** — Feature 2.15. "Cool control" with two dropdowns ("Light theme" / "Dark theme") so the user can pick different themes per mode.
5. **Add the new floater + cross-pair widget to roadmap** as Features 4.31 / 4.32 (or similar).
6. **Decide whether to commit the dropdown placement or rework header layout** based on how the floater looks.

## What NOT to do

- Don't publish 0.7.0 yet — design isn't final, branch still evolving.
- Don't add new components to `src/components/` for the published library — `src/components/` stays docs-only.
- Don't touch the published npm package shape (post-strip state is correct).

## Status of related work

- **Boilerplate-side audit** — both `feat/v0.7-port-fixes` and the roadmap fully address the four items (CRITICAL React packaging stripped per decision, HIGH Turbopack scss fix shipped, MEDIUM Prism theme shipped + paired, LOW theme-init script documented as a snippet in AGENTS.md).
- **Roadmap** — Features 2.13 / 2.14 / 2.15 / 2.16 / 4.30 / 6.9 already documented. Cross-pair widget needs a new feature entry.
- **`prism-light` and `prism-dark`** — both ship.
- **All 14 themes validated** — no contract gaps.

## Branch / commits at pause

```
fba63a9 fix(themes): rebuild Terminal Light with light-gray paper
df261b1 feat(themes): Terminal Light — daylight-editor companion
b4ed7d8 feat(themes,docs): bundle companion themes + add LightDarkToggle
53cbeda feat(themes)!: rename existing themes with -light/-dark suffixes
136d158 revert(react): strip React component bundle
```

Plus this WIP commit landing now with: ThemeSelect, header wiring, terminal folder rename, this notes file.
