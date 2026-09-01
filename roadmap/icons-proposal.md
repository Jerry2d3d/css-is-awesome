# Icons — Proposal

A reference list of icons css-is-awesome should support, organized by pack. Whether we *ship* these as bundled assets or just publish a manifest others fill in is still open — this doc is the menu, not the order.

## Distribution model (mirrors themes)

Themes today ship two ways:
- **Bundled:** `public/theme.css` — one file, all six themes.
- **Per-theme:** `public/themes/<name>/theme.css` — standalone download.
- **Contract:** `CONTRACT.md` + `scripts/theme-contract.json` + `theme-validator.js`.

Icons would follow the same pattern:
- **Bundled:** `public/icons.svg` — single SVG sprite with `<symbol id="...">` per glyph (optional; nice-to-have for sites that prefer one HTTP request).
- **Per-pack folder:** `public/icons/<pack>/<name>.svg` — current model, already works via `m.svg(name)`.
- **Contract:** `scripts/icon-contract.json` listing canonical glyph names per pack; `icon-validator.js` fails if a pack is missing one.
- **Per-theme override:** `public/themes/<name>/icons/<pack>/` — theme ships its own visual style of the same glyph names.

That gets icons drop-in, swappable by theme, and contract-validated — same as themes.

---

## Pack 1 — `core` (UI essentials, ~50 icons)

Today shipped: 8. Goal: ~50, broadly enough that Tier 1 and Tier 2 consumers rarely need their own.

### Already shipped (8)
- arrow-right
- check
- chevron-down
- close
- download
- edit
- menu
- search

### Navigation (8 to add)
- arrow-left
- arrow-up
- arrow-down
- chevron-up
- chevron-left
- chevron-right
- external-link
- home

### Actions (12 to add)
- upload
- copy
- share
- trash
- save
- refresh
- settings
- filter
- sort
- plus
- minus
- more-horizontal

### Status (6 to add)
- info
- warning
- error
- success
- help
- loading

### Communication (5 to add)
- mail
- bell
- calendar
- clock
- message

### User / security (6 to add)
- user
- users
- lock
- unlock
- eye
- eye-off

### Media (4 to add)
- play
- pause
- star
- heart

**Pack 1 total target: 49 icons** (8 shipped + 41 to add).

---

## Pack 2 — `files` (file types, ~16 icons)

Common document/asset types. Shipped as a separate folder so consumers who don't need file-type glyphs pay nothing.

- file (generic)
- file-pdf
- file-doc
- file-xls
- file-ppt
- file-image
- file-video
- file-audio
- file-zip
- file-text
- file-code
- file-csv
- file-json
- file-download
- folder
- folder-open

**Pack 2 total: 16 icons.**

---

## Pack 3 (optional / later) — `editor` (rich-text controls, ~14 icons)

If we ever ship a rich-text or markdown component, these become essential. Skip for v1.

- bold
- italic
- underline
- strikethrough
- link
- list-ordered
- list-unordered
- quote
- code-inline
- code-block
- heading-1
- heading-2
- heading-3
- image-inline

---

## Naming rules

- Kebab-case: `file-pdf`, not `filePdf` or `file_pdf`.
- Category prefix groups related glyphs alphabetically in folder listings: `file-*`, `chevron-*`, `arrow-*`.
- One glyph per file. Multi-color art uses `m.svg-bg` and lives outside this list.
- All glyphs export with `fill="currentColor"` (or no fill) so `m.svg` mask-coloring works.

---

## Source

Two paths:

**(a) Bundle from Lucide (recommended).** MIT licensed, ~1500 glyphs, clean single-stroke line style. We'd vendor only the names listed above (~65 SVGs) into `public/icons/core/` and `public/icons/files/`. License notice goes in `public/icons/LICENSE-third-party`.

**(b) Draw our own.** Slow but on-brand. Likely the right move for the Sketchbook theme's *override* pack (hand-drawn glyphs match the aesthetic). Other themes can keep the Lucide defaults.

Default plan: vendor Lucide for the core defaults, allow per-theme overrides to draw their own when the visual style demands it.

---

## Per-theme override examples

Once Pack 1 and Pack 2 ship, every theme can override a subset by dropping replacements in its own folder. Examples we'd ship as proof:

- **Sketchbook** — hand-drawn versions of the ~10 most-used glyphs (search, menu, close, edit, check, plus, trash, settings, mail, bell). Falls back to core for the rest.
- **Terminal** — ASCII-block / monospace variants for the same ~10 (close = `[X]`, menu = `[≡]`, etc.).
- **Cupertino** — SF-Symbols-style filled variants.

---

## Open questions

1. Bundle or manifest-only? If manifest-only, we publish the list and consumers vendor their own. Less weight in the npm package.
2. Sprite or per-file? Per-file is simpler and matches today's mixin. Sprite (`icons.svg`) is one HTTP request and easier to scan.
3. Pack 3 (editor icons) — ship now or wait until there's a rich-text component to use them?

---

## What this doc is not

A commitment. The list is the *menu*, not the *order*. Final decision on which packs ship, in what form, is captured in ROADMAP.md and CHANGELOG.md when we cut the version that includes them.
