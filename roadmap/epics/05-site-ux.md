# Epic 5: Site UX

## Summary
This epic makes the docs site feel finished. A visitor can find what they need via search, scan a docs page with an auto-highlighting table of contents, move from one page to the next without hunting the nav, copy any snippet with one click, and share a link that renders a real social preview card. Keyboard users can skip the nav, mobile users get a real drawer, screen-reader users get a landmark-first DOM, and every page (including 404) keeps the theme picker working. This epic is about the chrome and wayfinding around the content — search, navigation, previews, polish, accessibility, and the thousand small details that separate a draft from a shippable site.

## Goals
- Search returns relevant results in under 300ms on any docs query, from anywhere on the site.
- Every docs page has an auto-highlighting TOC that tracks scroll position and a prev/next footer based on nav order.
- Every docs page has an "Edit on GitHub" link that opens the correct source file at the correct line.
- Every route ships OpenGraph + Twitter card metadata and a real preview image (generated or hand-built).
- Lighthouse a11y score is ≥95 on `/`, `/docs`, `/themes`, `/examples`, `/compare`, `/showcase`, and the 404 page.
- Mobile nav collapses into a hamburger drawer below 768px and supports full keyboard traversal (Tab, Enter, Escape).
- Copy-to-clipboard works on every `<pre>` block with a visible confirmation; Shiki produces build-time syntax highlighting with zero runtime JS.

## Out of scope
- Docs prose content itself (page copy, mixin reference, recipes, migration guides) — see Epic 4 (Documentation Content).
- Accessibility *tests* (axe-core, Playwright keyboard flows, screen-reader snapshots) — see Epic 6 (Testing & Quality).
- Storybook for component library — see Epic 7 (Infrastructure & Release).
- Deploy, analytics, and sitemap generation infrastructure — see Epic 7.
- React component wrappers referenced from docs pages — see Epic 3.

## Features

### Feature 5.1: Search (DocSearch / Pagefind)
Add a site-wide search that indexes every docs route and returns relevant hits with a keyboard-driven dropdown UI. Evaluate Algolia DocSearch (hosted, free for OSS docs) vs Pagefind (static, build-time index) and pick one based on deploy target and maintenance cost. The search input lives in the site header and opens a modal on click or `Cmd+K` / `Ctrl+K`.

#### User Stories

**US-5.1.1** — As a search user, I want to press `Cmd+K` (or `Ctrl+K`) anywhere on the site and type a query, so that I can jump to the right page without browsing the nav.

**Acceptance criteria:**
- [ ] `Cmd+K` on macOS and `Ctrl+K` on Windows/Linux open the search modal from any route.
- [ ] Typing a query returns results in under 300ms (measured locally on the built site).
- [ ] Arrow keys navigate results; Enter opens the highlighted result; Escape closes the modal.
- [ ] The modal is keyboard-accessible (focus trapped while open, restored on close).
- [ ] Works on mobile viewports (320px, 375px, 414px) — modal is full-screen on narrow widths.

**Priority:** P1
**Effort:** L

**US-5.1.2** — As a visitor on desktop, I want the search input to be visible in the site header, so that I know the site is searchable without discovering a keyboard shortcut.

**Acceptance criteria:**
- [ ] A search input (or button styled as one) is present in `SiteHeader` on viewports ≥768px.
- [ ] Clicking the input opens the search modal.
- [ ] The placeholder text shows the keyboard shortcut (e.g. "Search docs… ⌘K").
- [ ] No layout shift (CLS) when the header renders.

**Priority:** P1
**Effort:** S

**US-5.1.3** — As a system author, I want the search index to rebuild automatically as part of the site build, so that no doc page is ever missing from search.

**Acceptance criteria:**
- [ ] The chosen search provider's index is generated during `npm run build` (Pagefind) or scheduled via DocSearch crawler config.
- [ ] A new page added under any docs route appears in search after the next build with no manual step.
- [ ] The build step documents itself in `package.json` scripts and the site README.
- [ ] A fallback message ("Search unavailable") renders if the index fails to load (search is the documented exception to the "works without JS" rule).

**Priority:** P1
**Effort:** M

### Feature 5.2: TOC auto-highlight + scroll-spy
The right-side TOC on every docs page should track the current scroll position and highlight the heading the reader is currently viewing. Implement with `IntersectionObserver`, not scroll listeners. Clicking a TOC entry should smooth-scroll to the heading with the sticky-header offset applied.

#### User Stories

**US-5.2.1** — As a TOC scanner, I want the active section to highlight as I scroll, so that I always know where I am in a long page.

**Acceptance criteria:**
- [ ] A `TableOfContents` component uses `IntersectionObserver` to detect the currently visible heading.
- [ ] The active entry gets a distinct visual state (color + border or background).
- [ ] Highlighting updates within 100ms of the heading entering the viewport.
- [ ] No layout shift (CLS) when the active state changes.
- [ ] Works on every docs route that renders a TOC.

**Priority:** P1
**Effort:** M

**US-5.2.2** — As a visitor on desktop, I want clicking a TOC entry to smooth-scroll to that heading, so that navigation feels polished.

**Acceptance criteria:**
- [ ] Clicking a TOC entry calls `element.scrollIntoView({ behavior: 'smooth' })` with a header-height offset applied.
- [ ] The URL hash updates (`#heading-slug`) without a hard jump.
- [ ] The target heading is visually positioned below the sticky header after scrolling.
- [ ] Keyboard-accessible (Tab to the entry, Enter activates).

**Priority:** P1
**Effort:** S

**US-5.2.3** — As a visitor on mobile, I want the TOC to either collapse or move to a reachable location, so that it doesn't eat my screen.

**Acceptance criteria:**
- [ ] Below 1024px the TOC either hides or collapses into a disclosure triggered by a "On this page" button.
- [ ] The collapsed TOC is keyboard-accessible (Tab, Enter to expand, Escape to close).
- [ ] Works on mobile viewports (320px, 375px, 414px).
- [ ] No layout shift (CLS) when expanding/collapsing.

**Priority:** P1
**Effort:** S

### Feature 5.3: Prev/next docs navigation
Every docs page gets a footer with "Previous" and "Next" links based on the canonical nav order. Order is defined in a single config (e.g. `src/lib/docs-nav.ts`) that also feeds the sidebar. Links render with the sibling page's title and a short arrow glyph.

#### User Stories

**US-5.3.1** — As a visitor on desktop, I want prev/next links at the bottom of every docs page, so that I can read through the docs in order without going back to the sidebar.

**Acceptance criteria:**
- [ ] Every page under `/docs` renders a `PrevNext` component in its footer.
- [ ] The component reads the current route from `usePathname()` (or equivalent) and resolves the sibling pages from the nav config.
- [ ] The first page shows only "Next"; the last page shows only "Previous".
- [ ] Each link shows the sibling page's title (not just "Next →").
- [ ] Keyboard-accessible (Tab, Enter).
- [ ] Still works when JavaScript is disabled (static links, resolved at build time).

**Priority:** P1
**Effort:** M

**US-5.3.2** — As a system author, I want prev/next order to come from the same source as the sidebar, so that the two can never drift.

**Acceptance criteria:**
- [ ] A single `docs-nav.ts` (or `.json`) file exports the ordered list of docs routes.
- [ ] Both the sidebar and `PrevNext` consume this file.
- [ ] Adding a new page to the nav config places it in both the sidebar and the prev/next chain automatically.
- [ ] A unit test (or build-time check) asserts every docs page is referenced in the nav config.

**Priority:** P1
**Effort:** S

**US-5.3.3** — As a visitor on mobile, I want prev/next links to stack vertically and stay tappable, so that they work on a phone.

**Acceptance criteria:**
- [ ] Below 640px prev/next stack into a single column with full-width tap targets (≥44px height).
- [ ] Works on mobile viewports (320px, 375px, 414px).
- [ ] No layout shift (CLS).

**Priority:** P1
**Effort:** S

### Feature 5.4: Edit on GitHub links
Every docs page ships a small "Edit this page on GitHub" link that opens the source file for that route on `github.com/<owner>/<repo>/edit/<branch>/<path>`. The path is computed from the route at build time so no per-page boilerplate is needed.

#### User Stories

**US-5.4.1** — As a visitor on desktop, I want an "Edit on GitHub" link on every docs page, so that I can fix typos and submit a PR without cloning the repo.

**Acceptance criteria:**
- [ ] Every page under `/docs` renders an "Edit on GitHub" link in a consistent location (e.g. end of content, above prev/next).
- [ ] The link targets `https://github.com/<owner>/<repo>/edit/main/<source-path>` with the correct file path for the current route.
- [ ] Link is keyboard-accessible.
- [ ] Link opens in a new tab with `rel="noopener noreferrer"`.

**Priority:** P1
**Effort:** S

**US-5.4.2** — As a system author, I want the source-path resolution to live in one helper, so that adding a new page doesn't require wiring the link manually.

**Acceptance criteria:**
- [ ] A `getEditUrl(pathname)` helper (or equivalent) returns the correct GitHub edit URL for any docs route.
- [ ] The repo owner, name, branch, and base source directory are read from a single config (env var or constants file).
- [ ] Adding a new docs page requires zero manual edit-link wiring.
- [ ] The helper is covered by a unit test (even a trivial one) to lock the URL format.

**Priority:** P1
**Effort:** S

### Feature 5.5: OpenGraph / social share metadata
Every route ships a full set of social-share meta tags (`og:title`, `og:description`, `og:image`, `og:url`, `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`). Preview images live at `public/og/<route>.png`; at minimum produce hand-built images for `/`, `/docs`, `/themes`, `/examples`, `/compare`, `/showcase`, `/blog`, `/about`.

#### User Stories

**US-5.5.1** — As a social-share recipient, I want a link to css-is-awesome to render a rich preview card in Twitter, Slack, and Discord, so that I know what I'm clicking.

**Acceptance criteria:**
- [ ] Every route under `src/app/` exports Next.js `metadata` with `openGraph` and `twitter` fields populated.
- [ ] Each route has a preview image at `public/og/<route>.png` sized 1200×630.
- [ ] `og:title`, `og:description`, `og:image`, `og:url`, `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image` are all present in rendered HTML (verified via `curl <url>`).
- [ ] Twitter's Card Validator and a Slack unfurl both render the card correctly for at least `/` and `/docs`.

**Priority:** P1
**Effort:** M

**US-5.5.2** — As a system author, I want a default OG image that applies when a route doesn't declare its own, so that no page ever ships without a card.

**Acceptance criteria:**
- [ ] `public/og/default.png` exists (1200×630, branded).
- [ ] Routes that don't override `openGraph.images` fall back to the default.
- [ ] The root `layout.tsx` defines `metadata.openGraph.images` with the default.
- [ ] Any new route inherits the default automatically.

**Priority:** P1
**Effort:** S

**US-5.5.3** — As a visitor on desktop, I want the page `<title>` and meta description to match the OG card, so that browser tabs and search snippets stay consistent.

**Acceptance criteria:**
- [ ] Every route's `metadata.title` and `metadata.description` are identical to its `openGraph.title` and `openGraph.description`.
- [ ] A build-time check (or test) asserts parity for every route.
- [ ] No route uses a default placeholder like "Next.js App".

**Priority:** P1
**Effort:** S

### Feature 5.6: Custom 404 page
Replace the default Next.js 404 with a themed page that matches the rest of the site. The page renders the normal `SiteHeader` and `SiteFooter`, keeps the theme picker working, offers a search input (if search is available), and suggests 3–5 popular destinations. Route: `src/app/not-found.tsx`.

#### User Stories

**US-5.6.1** — As a visitor on desktop, I want a themed 404 page when I hit a broken link, so that I don't feel dropped into a default error screen.

**Acceptance criteria:**
- [ ] `src/app/not-found.tsx` exists and renders a page with `SiteHeader`, a clear "404 — page not found" headline, a short message, 3–5 suggested links, and `SiteFooter`.
- [ ] The theme picker in the header works on the 404 page (switches themes and persists).
- [ ] The page has its own OG metadata (see Feature 5.5).
- [ ] Works on mobile viewports (320px, 375px, 414px).
- [ ] No layout shift (CLS) on load.

**Priority:** P0
**Effort:** S

**US-5.6.2** — As a search user, I want a search input on the 404 page, so that I can find what I was looking for without going home first.

**Acceptance criteria:**
- [ ] If search (Feature 5.1) is live, the 404 page renders the search input in the content area (not just the header).
- [ ] Hitting Enter in the input opens the search modal pre-populated with the query.
- [ ] Works on mobile viewports.
- [ ] Keyboard-accessible.

**Priority:** P2
**Effort:** S

**US-5.6.3** — As a screen-reader user, I want the 404 page to announce itself clearly, so that I know a navigation error occurred.

**Acceptance criteria:**
- [ ] The page has a single `<h1>` with the 404 message.
- [ ] The document title is "Page not found — css-is-awesome" (or equivalent).
- [ ] Landmarks (`<header>`, `<main>`, `<footer>`) are present and labeled.
- [ ] Lighthouse a11y score is ≥95 on the 404 page.

**Priority:** P0
**Effort:** S

### Feature 5.7: Favicon variants + PWA manifest
Ship a complete favicon set (`favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `favicon-dark.ico` or SVG variant) and a `manifest.json` that makes the site installable as a PWA (name, short_name, icons, theme_color, background_color, start_url, display).

#### User Stories

**US-5.7.1** — As a visitor on desktop, I want a crisp favicon in my browser tab, so that the site looks finished and I can find the tab quickly.

**Acceptance criteria:**
- [ ] `public/favicon.ico` exists (multi-resolution, includes 16×16 and 32×32 frames).
- [ ] `public/favicon-16x16.png` and `public/favicon-32x32.png` exist.
- [ ] `public/apple-touch-icon.png` exists at 180×180.
- [ ] `src/app/layout.tsx` references all of the above in the `<head>` via Next.js metadata.
- [ ] The favicon renders correctly in Chrome, Safari, and Firefox.

**Priority:** P0
**Effort:** S

**US-5.7.2** — As a visitor on mobile, I want to install the site as a PWA and get a proper icon on my home screen, so that it feels like a real app.

**Acceptance criteria:**
- [ ] `public/manifest.json` exists with `name`, `short_name`, `icons` (192×192 and 512×512), `theme_color`, `background_color`, `start_url`, and `display`.
- [ ] Chrome's "Add to Home Screen" prompt offers the site as installable.
- [ ] The installed app opens with the declared `start_url` and `display` mode.
- [ ] The home-screen icon matches the declared 192/512 PNG.

**Priority:** P0
**Effort:** S

**US-5.7.3** — As a visitor on desktop with dark-mode OS preference, I want a dark-variant favicon in Safari's pinned-tab / dark-tab rendering, so that the icon stays readable.

**Acceptance criteria:**
- [ ] A `favicon-dark` variant (SVG with `prefers-color-scheme: dark` media block, or a second PNG) is shipped.
- [ ] The `<link>` tags in `layout.tsx` reference the dark variant for dark-mode browsers.
- [ ] Verified in Safari and a dark-mode Chrome profile.

**Priority:** P2
**Effort:** S

### Feature 5.8: Copy-to-clipboard on code blocks
Every `<pre>` on the site gets a small button in its top-right corner that copies the raw snippet to the clipboard. On success the button shows a "Copied!" tooltip for ~1.5s then reverts. Implementation wraps rendered `<pre>` blocks at build time (for MDX) or in a shared `CodeBlock` component.

#### User Stories

**US-5.8.1** — As a copy-paste user, I want a copy button on every code block, so that I don't have to triple-click to select the snippet.

**Acceptance criteria:**
- [ ] Every `<pre>` rendered on a docs, examples, or compare page has a visible copy button in the top-right corner.
- [ ] Clicking the button copies the raw snippet text (not the highlighted HTML) to the clipboard.
- [ ] On success the button shows a "Copied!" confirmation for ~1.5s, then reverts.
- [ ] Works on mobile viewports (button is tappable, min 32×32).
- [ ] Keyboard-accessible (Tab, Enter/Space).

**Priority:** P0
**Effort:** M

**US-5.8.2** — As a screen-reader user, I want the copy button to announce its action and result, so that I know the snippet was copied.

**Acceptance criteria:**
- [ ] The button has an accessible label (e.g. `aria-label="Copy code snippet"`).
- [ ] On success, an `aria-live` region announces "Copied to clipboard" (or equivalent).
- [ ] Focus does not move unexpectedly on click.
- [ ] Lighthouse a11y score ≥95 on any page that renders code blocks.

**Priority:** P0
**Effort:** S

**US-5.8.3** — As a visitor on a browser without `navigator.clipboard`, I want a graceful fallback, so that the button doesn't appear broken.

**Acceptance criteria:**
- [ ] If `navigator.clipboard` is undefined, the button falls back to `document.execCommand('copy')` or hides entirely.
- [ ] No uncaught exception in the console on unsupported browsers.
- [ ] The underlying `<pre>` remains selectable so manual copy still works.

**Priority:** P2
**Effort:** S

### Feature 5.9: Shiki syntax highlighting
Replace the hand-coded `<span className="tok-*">` highlighting with Shiki, run at build time, so that the rendered HTML already includes the right classes/colors with no runtime JS cost. Support at least `css`, `scss`, `html`, `tsx`, `jsx`, `json`, `sh`. Pick a theme pair (light/dark) that matches the site's default theme tokens.

#### User Stories

**US-5.9.1** — As a visitor on desktop, I want code snippets to have accurate, consistent syntax highlighting, so that samples are easy to read.

**Acceptance criteria:**
- [ ] Shiki is integrated into the MDX / content pipeline at build time.
- [ ] At least 7 languages are supported: `css`, `scss`, `html`, `tsx`, `jsx`, `json`, `sh`.
- [ ] Rendered HTML contains Shiki's tokens as `<span>`s with inline styles or class names — no runtime JS required.
- [ ] All existing hand-coded `tok-*` spans in the site are removed.
- [ ] Still works when JavaScript is disabled.

**Priority:** P1
**Effort:** M

**US-5.9.2** — As a system author, I want Shiki's theme to match the site's current theme tokens, so that highlighting doesn't clash with the surrounding UI.

**Acceptance criteria:**
- [ ] A light Shiki theme is applied by default and a dark Shiki theme is applied when `data-theme="dark"` (or the equivalent) is active.
- [ ] The highlighting swaps without a page reload when the theme picker changes.
- [ ] Token colors visually harmonize with the site's primary/secondary tokens (spot-check against each in-repo theme).
- [ ] No FOUC on initial load.

**Priority:** P1
**Effort:** S

**US-5.9.3** — As a system author, I want the Shiki build step to fail loudly on an unknown language, so that a typo'd code fence doesn't ship as plain text.

**Acceptance criteria:**
- [ ] Using an unregistered language in a code fence fails the build (or logs a warning visible in CI).
- [ ] The error message names the offending file and fence.
- [ ] Adding a new language requires one documented edit in the Shiki config.

**Priority:** P2
**Effort:** S

### Feature 5.10: Mobile nav (hamburger + drawer)
`SiteHeader` is sticky on desktop. Below 768px it should collapse into a hamburger button that opens a full-height drawer containing the full nav + theme picker. Drawer slides in, focus is trapped, Escape closes, scroll on the underlying page is locked while open.

#### User Stories

**US-5.10.1** — As a visitor on mobile, I want a hamburger button that opens the full nav in a drawer, so that I can navigate the site on a phone.

**Acceptance criteria:**
- [ ] Below 768px the desktop nav is replaced by a hamburger button in the header.
- [ ] Tapping the hamburger opens a drawer from the right (or left) containing every top-level nav link + the theme picker.
- [ ] Tapping outside the drawer, tapping a nav link, or tapping a close button closes it.
- [ ] Body scroll is locked while the drawer is open.
- [ ] Works on mobile viewports (320px, 375px, 414px).

**Priority:** P0
**Effort:** M

**US-5.10.2** — As a keyboard user, I want to open and close the mobile drawer with the keyboard, so that I can navigate without a touchscreen.

**Acceptance criteria:**
- [ ] Tab reaches the hamburger button; Enter/Space opens the drawer.
- [ ] Focus moves into the drawer on open and is trapped inside until close.
- [ ] Escape closes the drawer and returns focus to the hamburger button.
- [ ] All nav links inside the drawer are reachable via Tab.
- [ ] Lighthouse a11y score ≥95 on mobile viewports.

**Priority:** P0
**Effort:** S

**US-5.10.3** — As a screen-reader user, I want the hamburger button and drawer to be announced correctly, so that I know the nav is there and how to use it.

**Acceptance criteria:**
- [ ] The hamburger has `aria-label="Open navigation"` (or toggles between open/close labels) and `aria-expanded` reflecting state.
- [ ] The drawer is a `<dialog>` or has `role="dialog"` with `aria-modal="true"` and a labeled heading.
- [ ] The rest of the page is inert (`aria-hidden` or `inert`) while the drawer is open.
- [ ] Verified with VoiceOver on iOS and TalkBack on Android at least once.

**Priority:** P0
**Effort:** S

### Feature 5.11: Skip-to-content + keyboard polish
Every page ships a "Skip to content" link as the first focusable element. When focused (Tab on page load) it becomes visible and, when activated, moves focus to the `<main>` landmark. Also audit focus-visible outlines, tab order, and ensure the theme picker, search, and drawer all behave under keyboard-only operation.

#### User Stories

**US-5.11.1** — As a keyboard user, I want a "Skip to content" link as the first focusable element, so that I can bypass the nav on every page.

**Acceptance criteria:**
- [ ] A `<a href="#main">Skip to content</a>` (or equivalent) is the first focusable element on every page.
- [ ] The link is visually hidden by default and becomes visible when focused.
- [ ] Activating the link moves focus to the `<main>` landmark and scrolls it into view.
- [ ] Works on every route, including the 404 page.
- [ ] Still works when JavaScript is disabled.

**Priority:** P0
**Effort:** S

**US-5.11.2** — As a keyboard user, I want every interactive element to have a visible focus outline, so that I always know where I am.

**Acceptance criteria:**
- [ ] Every link, button, input, and custom interactive element shows a visible `:focus-visible` outline.
- [ ] The outline color meets 3:1 contrast against adjacent colors (per WCAG 2.4.11).
- [ ] No rule in global CSS sets `outline: none` without a replacement style.
- [ ] Lighthouse a11y score ≥95 on a sampled page.

**Priority:** P0
**Effort:** S

**US-5.11.3** — As a screen-reader user, I want landmark regions on every page, so that I can jump between sections.

**Acceptance criteria:**
- [ ] Every page has `<header>`, `<main>`, and `<footer>` landmarks.
- [ ] Docs pages also have a `<nav aria-label="Table of contents">` for the TOC and a `<nav aria-label="Primary">` for the sidebar (when present).
- [ ] No page has more than one `<h1>`.
- [ ] Verified with a screen reader (VoiceOver or NVDA) on at least `/`, `/docs`, and the 404 page.

**Priority:** P0
**Effort:** S

### Feature 5.12: Smooth scroll + anchor offset
Clicking any internal link that targets a fragment (e.g. `/docs/buttons#variants`) should smooth-scroll to the target heading with the sticky-header height offset applied, so the heading lands below the header rather than under it. Apply via `scroll-margin-top` on headings plus `scroll-behavior: smooth` on the root, with a JS fallback only where needed.

#### User Stories

**US-5.12.1** — As a visitor on desktop, I want fragment links to smooth-scroll with the header offset baked in, so that clicking `#variants` doesn't bury the heading under the sticky nav.

**Acceptance criteria:**
- [ ] `html { scroll-behavior: smooth; }` is set (respecting `prefers-reduced-motion`).
- [ ] Every heading that serves as an anchor target has `scroll-margin-top` equal to the sticky-header height plus a small buffer.
- [ ] Clicking a TOC entry, a nav-menu anchor, or pasting a `#`-URL lands the heading visibly below the header.
- [ ] Works on every route that has headings.

**Priority:** P2
**Effort:** S

**US-5.12.2** — As a visitor with `prefers-reduced-motion`, I want smooth scrolling to be suppressed, so that my accessibility preference is respected.

**Acceptance criteria:**
- [ ] `@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }` is applied.
- [ ] Fragment-link clicks jump instantly (no smooth animation) when the preference is on.
- [ ] Verified by toggling "Reduce motion" in OS settings.

**Priority:** P2
**Effort:** S

**US-5.12.3** — As a system author, I want a single CSS variable (e.g. `--header-height`) to drive both the sticky header height and the anchor offset, so that the two can never drift.

**Acceptance criteria:**
- [ ] `--header-height` is defined once on `:root` (or a close ancestor).
- [ ] The sticky header consumes it for its own height/padding.
- [ ] Headings' `scroll-margin-top` reads from the same variable.
- [ ] Changing the variable updates both simultaneously.

**Priority:** P2
**Effort:** S

## Dependencies
- Blocks: the mobile UX story for 1.0 (a site without a working mobile nav, skip-to-content, and themed 404 cannot ship as 1.0). Also blocks perceived polish for launch announcements (OG cards, favicons, PWA manifest).
- Blocked by: Epic 4 (Documentation Content) — the TOC, prev/next, and edit-on-GitHub features can be built against stub content, but are considered unfinished until Epic 4's real prose exists to exercise them end-to-end. Search (Feature 5.1) needs real content to produce useful results.

## Priority
P1 (wanted for 1.0). Individual features split further: P0 for Features 5.6, 5.7, 5.8, 5.10, 5.11. P1 for Features 5.1, 5.2, 5.3, 5.4, 5.5, 5.9. P2 for Feature 5.12 and any error-boundary / loading-state polish deferred out of the P0/P1 set.
