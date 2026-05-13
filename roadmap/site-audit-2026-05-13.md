# Website audit — 2026-05-13

Inventory of issues found across the docs/marketing site (`src/`) ahead
of a planned style pass + dogfood conversion. Captured at the request
of Jerry post-eyebrow-mixin redo. Read-only audit; nothing edited.

The biggest structural finding — the **dogfooding gap** (page-level
modules consume tokens via `var(--*)` but skip the mixin/utility API
that the component modules use) — is tracked separately in
`ROADMAP.md` Phase 5.5. This document is the granular punch list that
sits underneath it.

Severity legend:
- **Blocker** — visibly broken or actively misleading to a visitor
- **Should-fix** — quality / consistency issue worth resolving in this pass
- **Nit** — cosmetic or future-proofing, not load-bearing

---

## 1. Broken / placeholder links — should-fix

Real visitor-facing dead ends:

- `src/app/blog/page.tsx:11, 19, 27, 35, 43, 51, 62` — all 7 blog
  posts use `href="#"`. Either link them, mark them disabled, or
  remove the listing until posts exist.
- `src/app/examples/page.tsx:72` — footer Docs / Examples / GitHub
  links are `href="#"`.
- `src/app/showcase/page.tsx:41-42, 60, 101` — 4 showcase CTA buttons
  use `href="#"`.

Inside Example/demo blocks (acceptable, but flag for the pass):

- `src/app/docs/page.tsx:54-55, 110-111` — 4 demo buttons
- `src/app/docs/mixins/page.tsx:594-596` — 3 button variant demos
- `src/app/docs/recipes/page.tsx:249-253` — 5 dashboard recipe nav
  links

Recommendation: convert demo `href="#"` to `type="button"` or use a
non-anchor primitive so they're not "links" from screen-reader POV.

---

## 2. Accessibility — should-fix

- **Missing `<main>` landmark.** `src/app/docs/layout.tsx` wraps
  children in `<article>` but the outer shell is a plain `<div>`. A
  page should have exactly one `<main>` — currently the docs route
  has none. Same applies to landing, /about, /blog, /compare,
  /showcase, /examples, /themes — verify each route hits exactly one
  `<main>`.
- **Navigation focus on `/themes` sidebar.** `src/app/themes/page.tsx:54`
  sidebar anchor links don't have a visible `:focus-visible` rule in
  the adjacent SCSS. The global rule in `src/app/globals.css:291`
  only targets `button`, not anchors.
- **Heading hierarchy** — sample the docs pages for `h1 → h3` jumps
  during the pass (no specific instance flagged here, but worth a
  systematic check).

OK as-is (verified):

- `src/components/LaunchGate/LaunchGate.tsx:130` — `×` button has
  `aria-label` on line 131 ✓
- `src/app/layout.tsx:28` — `suppressHydrationWarning` correctly
  scoped to the pre-hydration theme script ✓
- Button + input focus styles in `globals.css:291` and `360-362` ✓
- `src/components/Toast/ToastProvider.tsx:58-62` — proper `mounted`
  hydration guard before portal ✓

---

## 3. Hardcoded colors / theme-swap risk — should-fix

Defensive hex fallbacks inside `var()` defaults will paint wrong if
the variable is missing in a new theme:

- `src/components/Logo/Logo.module.scss:50` — `rgba(42, 36, 30, 0.1)`
- `src/components/ThemeEditorDock/ThemeEditorDock.tsx:619` —
  `"var(--error-text, #b00020)"`
- `src/components/ThemeEditorDock/ThemeEditorDock.module.scss:20, 42,
  73, 75, …` — multiple `#fff` / `#000` / `#888` fallbacks
- `src/components/ThemeEditorDock/rows.tsx:34, 44` — raw `#000000` /
  `#000` literals
- `src/components/ThemePicker/ThemePicker.module.scss` — hex
  fallbacks (line numbers TBD)

Decision needed: introduce neutral fallback tokens (e.g.
`--fallback-ink`, `--fallback-paper`) so the system has one canonical
"safety net" pair, OR remove the fallbacks entirely and rely on the
typed theme contract to fail loudly.

---

## 4. SEO / metadata — nit

Only `src/app/layout.tsx` exports `metadata`. None of the route pages
do:

- `src/app/blog/page.tsx`
- `src/app/about/page.tsx`
- `src/app/showcase/page.tsx`
- `src/app/compare/page.tsx`
- `src/app/themes/page.tsx`
- `src/app/examples/page.tsx`
- every `src/app/docs/*/page.tsx`

Effect: browser tab title and social-share previews are identical
("CSS is Awesome — a tiny design system") for every page. Per-route
`export const metadata` would fix it.

---

## 5. Version display inconsistency — nit

`<Seal>` and `<DraftStamp>` display version strings inline as static
JSX:

- `src/app/page.tsx:10` — `v0.1 · Draft` (DraftStamp)
- `src/app/about/page.tsx:56` — `<Seal>Approved · v0.1</Seal>`
- `src/app/showcase/page.tsx:44` — `<Seal>New · v0.5</Seal>`

Three different versions visible to a visitor in the same site. Pick
one source of truth — read `package.json.version` at build, or just
hardcode the marketing-suffix once and reuse.

---

## 6. Component library coverage — nit

These components exist in `src/components/` but appear unused by any
route on the site:

`Divider`, `List`, `ListItem`, `MenuItem`, `Pagination`, `Popover`,
`Radio`, `Select`, `Slider`, `Switch`, `Textarea`, `Tooltip`

For a dogfood docs site, this is a missed opportunity — these
components are part of the visual story but the site doesn't show
them. Either build a gallery page that exercises every component, or
prune the ones that aren't going to ship with Gremlin UI either.

---

## 7. Hydration / runtime safety — OK

No issues found:

- `src/app/layout.tsx:28` — theme cookie pre-paint script gated by
  `suppressHydrationWarning` and regex-validated input
- `src/components/Toast/ToastProvider.tsx:58-62` — `mounted` flag
  before portal mount
- `src/components/LaunchGate/LaunchGate.tsx:39` — `flags.json` fetch
  uses `cache: "no-cache"` intentionally; safe

---

## 8. Mobile / responsive — OK

- `src/app/globals.css:200-211` — `.docs-shell` 3-col grid collapses
  to single-column at `max-width: 1024px`; sidebar + TOC hide on
  mobile correctly.
- No fixed pixel widths flagged.

---

## 9. Performance — OK / nit

- No `<img>` tags audited that need `next/image` migration (most
  imagery is inline SVG via the icon system).
- `LaunchGate` re-fetches `flags.json` on every mount with
  `no-cache`; intentional but worth a TTL if it becomes hot.

---

## 10. Type safety — OK

Only one tagged `any` in `src/components/Dropdown/Dropdown.tsx:59-60`,
documented and necessary for `cloneElement` on unknown children. No
`@ts-ignore` / `@ts-expect-error` found.

---

## What the audit DID NOT cover (do these in the pass)

- **Cross-theme visual regression.** Audit was static; some hex
  fallbacks may look wrong only in specific themes. Spot-check every
  page in Sketchbook, Press, Graphite, Glass, Cupertino, Terminal,
  Boilerplate, Prism — both light and dark variants.
- **Copy review.** Did not read body text for tone, typos, or
  outdated claims (e.g. "v0.6" mentions if any).
- **Lighthouse / axe.** No automated a11y or perf scan run; this
  audit is structural only.

---

## Next steps (proposed order)

1. **Style pass** — fix items in §1, §2, §3, §5. Land before the
   dogfood conversion so we don't churn the same files twice.
2. **Dogfood conversion** — Phase 5.5 work: replace raw `var(--*)` in
   `page.module.scss` files with `@include m.type(...)`, `m.space(...)`,
   `cia-*` utility classes where appropriate.
3. **Component gallery page** — close the §6 coverage gap.
4. **Cross-theme + Lighthouse pass** — the items the static audit
   couldn't catch.
