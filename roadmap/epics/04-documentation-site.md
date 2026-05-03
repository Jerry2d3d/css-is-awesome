# Epic 4: Documentation Site

## Summary
Turn the placeholder `/docs` route into a complete, shippable documentation site — both the prose that teaches the system (getting started, install, tokens, mixins, utilities, migration, theme and icon authoring guides, animation, accessibility, recipes, FAQ) and the chrome that lets visitors move through it (search, auto-highlighting TOC, prev/next, edit-on-GitHub, OpenGraph previews, themed 404, favicons, PWA manifest, copy-to-clipboard, Shiki syntax highlighting, mobile drawer, skip-to-content, smooth anchor scrolling). Neither half is useful without the other: prose with no navigation is a wiki dump, and a polished shell with placeholder content doesn't teach anyone anything. This epic delivers both as one cohesive site.

## Goals
- Every public mixin exported from `src/styles/_mixins.scss` and every `.cia-*` utility class has a reference entry with signature (or purpose), example markup, and rendered preview.
- Time-to-first-working-install under 5 minutes: a new user can land on `/docs`, copy a CDN snippet, paste into an HTML file, and see a themed page render.
- Search returns relevant results in under 300ms on any docs query, from anywhere on the site.
- Every docs page renders identically (re-skinned) in all shipped themes — live previews, token galleries, recipes, and code samples re-skin when the theme picker swaps themes.
- Lighthouse a11y score ≥95 on `/`, `/docs`, `/themes`, `/examples`, `/compare`, `/showcase`, and the 404 page.
- Every route ships OpenGraph + Twitter card metadata with a real preview image, and every docs page has a prev/next footer plus an "Edit on GitHub" link wired from a single nav config.

## Out of scope
- Component playground / Storybook iframes — see Epic 5 (Quality & Delivery).
- MCP server, JSON token export, AI prompt templates — see Epic 6 (AI Integration).
- Blog posts, changelog prose, release notes — handled in Epic 5 and Epic 7.
- CONTRIBUTING / CoC / SECURITY docs — see Epic 7 (Community & Project Meta).
- Visual regression tests on doc pages, axe-core runs, Playwright keyboard flows, screen-reader snapshot tests — see Epic 5 (Quality & Delivery).
- Deploy, analytics, and sitemap generation infrastructure — see Epic 5.
- React component wrappers referenced from docs pages — see Epic 3 (React Component Library).

## Features

### Feature 4.1: Getting Started (5-minute track)
A single linear page at `/docs` (or `/docs/intro`) that walks a brand-new visitor from "what is this" to "I have a themed button on screen" in under five minutes. One CDN snippet, one HTML scaffold, one theme swap, one `@include` example. No choices, no branches — the shortest path to a working page.

#### User Stories

**US-4.1.1** — As a new user, I want a single "copy this, paste it, reload" snippet at the top of `/docs`, so that I see a styled page within the first minute.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] First code block is a complete, runnable HTML document (doctype, head, body, one visible element).
- [ ] Snippet uses the CDN URL and applies a default theme.
- [ ] Pasting the snippet into a blank `.html` file and opening it in a browser renders a themed, non-default-browser-styled element.
- [ ] Scannable — has a heading, a code block, and a screenshot or live preview of the expected result.

**Priority:** P0
**Effort:** 1
**Role:** new user

**US-4.1.2** — As a new user, I want the Getting Started page to show me how to swap themes with one line, so that I see the "theming is the whole point" value prop before I read anything else.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] A "swap the theme" step shows the exact token file change (or `data-theme` attribute, or link-tag swap) that re-skins the page.
- [ ] Live preview re-skins when the theme picker swaps themes.
- [ ] Every code sample runs as shown if copy-pasted.
- [ ] Content is authoritative — reflects current theme-loading mechanics, not aspiration.

**Priority:** P0
**Effort:** 1
**Role:** new user

**US-4.1.3** — As an AI assistant reading the docs to generate user code, I want the Getting Started page to state the minimum viable setup as a labeled, copy-safe block, so that I can emit it verbatim when a user asks "how do I start".

**Acceptance criteria:**
- [ ] Page has a clearly labeled "Minimum setup" section with a single canonical code block.
- [ ] Block is valid HTML/SCSS with no placeholders like `…` or `YOUR_KEY_HERE`.
- [ ] Adjacent prose states what the block does and what prerequisites it assumes (browser, Node version, nothing).
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P0
**Effort:** 1
**Role:** AI assistant reading the docs to generate user code

---

### Feature 4.2: Install Options
A dedicated `/docs/install` page covering three install tiers: zero-build CDN drop-in, npm + SCSS integration, and framework integration (React/Next). Each tier is a self-contained section with prerequisites, commands, verification step, and "when to choose this tier" guidance.

#### User Stories

**US-4.2.1** — As a new user with an HTML file and no build tools, I want a CDN install path, so that I can use the system without installing Node.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] "CDN" section shows the exact `<link>` tag and a verification snippet.
- [ ] Every code sample runs as shown if copy-pasted.
- [ ] Content is authoritative — reflects current CDN URL and file layout.

**Priority:** P0
**Effort:** 1
**Role:** new user with an HTML file and no build tools

**US-4.2.2** — As a Bootstrap migrant with a Sass build already configured, I want an npm + SCSS integration guide, so that I can import tokens and mixins into my existing stylesheet.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Section covers `npm install`, the SCSS `@use` / `@forward` entry point, and the expected load order.
- [ ] Every code sample runs as shown if copy-pasted.
- [ ] Scannable — has headings, code blocks, and at-a-glance takeaways.

**Priority:** P0
**Effort:** 3
**Role:** Bootstrap migrant with a Sass build already configured

**US-4.2.3** — As a React developer, I want a framework integration section showing how to pull the stylesheet into a Next.js or Vite project, so that my components pick up theme tokens.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Section includes a `layout.tsx` or `_app.tsx` import snippet and a `data-theme` wiring example.
- [ ] Live previews re-skin when the theme picker swaps themes.
- [ ] Content is authoritative — reflects current React wrapper surface.

**Priority:** P0
**Effort:** 3
**Role:** React developer

**US-4.2.4** — As a copy-paster, I want a "download a theme file" option so that I can grab a single `.css` or `.scss` file and drop it into my project without any package manager.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] "Download" section links to a prebuilt theme file per shipped theme.
- [ ] Instructions state exactly where to place the file and how to reference it.
- [ ] Every code sample runs as shown if copy-pasted.

**Priority:** P1
**Effort:** 1
**Role:** copy-paster

---

### Feature 4.3: Token Reference
Live, visual reference at `/docs/tokens` (or subpages) for every token family: color, spacing, typography, shadow, radius, motion, blur/glow. Each family renders its values as actual visual elements — not a list of hex codes but a row of swatches, not a list of pixel values but stacked bars. The numbered sizing scale is authoritative and locked.

#### User Stories

**US-4.3.1** — As a new user, I want a color token page showing every palette swatch with its token name, so that I can pick the right token for my design.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Every color token renders a swatch with its token name, hex/oklch value, and usage hint.
- [ ] Live previews re-skin when the theme picker swaps themes.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P0
**Effort:** 3
**Role:** new user

**US-4.3.2** — As a theme author, I want a spacing visualizer showing every step of the numbered scale rendered at scale, so that I can see the rhythm my theme will inherit.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Every spacing step renders as a bar or box at its actual size.
- [ ] Each step is labeled with its numbered token name and computed value.
- [ ] Live previews re-skin when the theme picker swaps themes.
- [ ] Scannable — has headings, code blocks, and at-a-glance takeaways.

**Priority:** P0
**Effort:** 3
**Role:** theme author

**US-4.3.3** — As a new user, I want a type scale preview rendering each step of the typography scale with live text, so that I can see how headings and body text relate.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Every type-scale step renders with sample text at its actual size, weight, and line-height.
- [ ] Live previews re-skin when the theme picker swaps themes.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P0
**Effort:** 3
**Role:** new user

**US-4.3.4** — As a copy-paster, I want shadow, radius, motion, and blur galleries, so that I can see every tier side-by-side and pick one.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Shadow, radius, motion (duration + ease), and blur/glow each have a gallery grid.
- [ ] Each tile is labeled with its token name and renders the effect live.
- [ ] Live previews re-skin when the theme picker swaps themes.
- [ ] Every code sample runs as shown if copy-pasted.

**Priority:** P0
**Effort:** 3
**Role:** copy-paster

**US-4.3.5** — As an AI assistant, I want the token page headings to include stable token-name anchors, so that I can deep-link users to a specific token.

**Acceptance criteria:**
- [ ] Every token entry has a stable `#token-name` anchor.
- [ ] Anchors match the exact SCSS/CSS variable name.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P1
**Effort:** 1
**Role:** AI assistant

---

### Feature 4.4: Mixin API Reference
A reference page at `/docs/mixins` documenting every public mixin in `src/styles/_mixins.scss`, grouped by family: primitives (color, space, radius), typography (font, font-size, line-height), layout (stack, inline, grid), components (btn-base, card-base, alert, modal, dropdown, tooltip, tabs, pagination), feedback (badge, progress, spinner), icons (svg, svg-bg, svg-text). Each entry has a signature, parameters with defaults, an example call, and the rendered CSS output.

#### User Stories

**US-4.4.1** — As a Bootstrap migrant, I want every public mixin documented with signature and parameters, so that I can read the API without reading the source.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Every public mixin from `_mixins.scss` appears with `@include name(args)` signature.
- [ ] Each parameter lists type, default, and purpose.
- [ ] Content is authoritative — reflects current code, not aspiration.
- [ ] Scannable — has headings, code blocks, and at-a-glance takeaways.

**Priority:** P0
**Effort:** 7
**Role:** Bootstrap migrant

**US-4.4.2** — As a new user, I want each mixin entry to include an example call and the compiled CSS output, so that I know what my code will produce.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Every mixin has a "Usage" code block and an "Output" code block.
- [ ] Every code sample runs as shown if copy-pasted.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P0
**Effort:** 7
**Role:** new user

**US-4.4.3** — As an AI assistant, I want mixins grouped into named families with stable anchor IDs, so that I can reference them consistently when generating user code.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Mixins are grouped into primitives, typography, layout, components, feedback, icons.
- [ ] Every mixin and group heading has a stable anchor ID.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P0
**Effort:** 3
**Role:** AI assistant

**US-4.4.4** — As a theme author, I want a "component mixin contract" note on each component mixin, so that I know which tokens it reads and which a theme must define.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Each component mixin lists the tokens it consumes.
- [ ] Content is authoritative — reflects current code, not aspiration.
- [ ] Scannable — has headings, code blocks, and at-a-glance takeaways.

**Priority:** P1
**Effort:** 3
**Role:** theme author

---

### Feature 4.5: Utility Class Reference
A searchable table at `/docs/utilities` listing every `.cia-*` class with purpose, example markup, and rendered preview. Grouped by family: spacing, typography, display, position, flex, grid, border/radius, shadow, color, responsive, animation. Site-level search hookup is Feature 4.13 in this epic; this feature provides the underlying table and metadata.

#### User Stories

**US-4.5.1** — As a copy-paster, I want a single utility reference page listing every `.cia-*` class with a purpose and example, so that I can use the site as a cheatsheet.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Every `.cia-*` class has a row with class name, purpose, and example markup.
- [ ] Every code sample runs as shown if copy-pasted.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P0
**Effort:** 7
**Role:** copy-paster

**US-4.5.2** — As a new user, I want utility classes grouped by family, so that I can find the spacing utilities without scanning the whole table.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Classes are grouped into spacing, typography, display, position, flex, grid, border/radius, shadow, color, responsive, animation.
- [ ] Each group heading has a stable anchor ID.
- [ ] Scannable — has headings, code blocks, and at-a-glance takeaways.

**Priority:** P0
**Effort:** 3
**Role:** new user

**US-4.5.3** — As a Bootstrap migrant, I want each utility row to render a live preview of the effect, so that I can confirm the class does what its name implies.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Every utility row has a rendered preview cell.
- [ ] Live previews re-skin when the theme picker swaps themes.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P0
**Effort:** 3
**Role:** Bootstrap migrant

**US-4.5.4** — As an AI assistant, I want the utility table exposed as a machine-readable data source, so that I can enumerate valid classes without scraping HTML.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] A JSON or similar structured file is linked from the page listing every class with name, family, purpose.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P1
**Effort:** 1
**Role:** AI assistant

---

### Feature 4.6: Migration from Bootstrap
A `/docs/migration` page with side-by-side comparisons for the most common Bootstrap tasks: buttons, cards, grids, modals, alerts, forms, navbars, dropdowns, badges, utilities. Each entry shows the Bootstrap markup and the cia equivalent in adjacent columns with a short "why it's different" note.

#### User Stories

**US-4.6.1** — As a Bootstrap migrant, I want side-by-side markup for buttons, cards, grids, modals, and alerts, so that I can translate existing code without learning the full API first.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] At least 10 Bootstrap patterns have side-by-side Bootstrap vs cia markup.
- [ ] Every code sample runs as shown if copy-pasted.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P1
**Effort:** 7
**Role:** Bootstrap migrant

**US-4.6.2** — As a Bootstrap migrant, I want a "conceptual differences" intro explaining the mixin-first, theme-token model vs Bootstrap's utility-and-override model, so that I understand why some patterns don't map 1:1.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Intro section explains tokens, mixins, and theme swapping in three paragraphs or fewer.
- [ ] Scannable — has headings, code blocks, and at-a-glance takeaways.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P1
**Effort:** 3
**Role:** Bootstrap migrant

**US-4.6.3** — As a Bootstrap migrant, I want a "gotchas" list — things I'll trip over on day one, so that I don't assume the system behaves like Bootstrap where it doesn't.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Gotchas section covers grid differences, utility naming, form default behavior, modal z-index.
- [ ] Scannable — has headings, code blocks, and at-a-glance takeaways.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P1
**Effort:** 3
**Role:** Bootstrap migrant

---

### Feature 4.7: Theme Authoring Guide
A `/docs/themes/authoring` page that walks a theme author from empty file to validated, working theme. Token contract, palette selection, font pairing, running the theme validator, previewing in the docs site, submitting to the repo.

#### User Stories

**US-4.7.1** — As a theme author, I want a step-by-step guide from empty file to working theme, so that I can ship my first theme in one sitting.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Guide lists the token contract — every token a theme must define.
- [ ] Each step has a code block showing the file state after the step.
- [ ] Every code sample runs as shown if copy-pasted.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P1
**Effort:** 7
**Role:** theme author

**US-4.7.2** — As a theme author, I want guidance on palette selection and font pairing, so that my theme feels coherent rather than a random list of colors.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Section covers contrast targets, tonal step guidance, and recommended font-pair patterns.
- [ ] Live previews re-skin when the theme picker swaps themes.
- [ ] Scannable — has headings, code blocks, and at-a-glance takeaways.

**Priority:** P1
**Effort:** 3
**Role:** theme author

**US-4.7.3** — As a theme author, I want instructions for running the theme validator and submitting to the repo, so that I know when my theme is done.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Section covers the validator command, expected pass output, and the PR submission flow.
- [ ] Every code sample runs as shown if copy-pasted.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P1
**Effort:** 3
**Role:** theme author

---

### Feature 4.8: Icon Authoring Guide
A `/docs/icons/authoring` page covering how to drop an SVG into `public/icons/` (or a theme's icon folder), reference it via `@include m.svg(name)`, control size and color, choose mask vs background, when to use `svg-text`, and how to handle multi-color icons.

#### User Stories

**US-4.8.1** — As an icon author, I want a "drop an SVG, reference it by name" walkthrough, so that I can add an icon to the system in under a minute.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Walkthrough shows the target folder path and the `@include m.svg(name)` call.
- [ ] Every code sample runs as shown if copy-pasted.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P1
**Effort:** 1
**Role:** icon author

**US-4.8.2** — As an icon author, I want guidance on size and color control, and on mask vs background, so that I pick the right rendering technique for my use case.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Section compares `svg`, `svg-bg`, and `svg-text` with use cases and trade-offs.
- [ ] Every code sample runs as shown if copy-pasted.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P1
**Effort:** 3
**Role:** icon author

**US-4.8.3** — As an icon author, I want guidance on multi-color icons, so that I know the system's limits before I try to use a full-color illustration.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Section states which mixins support multi-color SVGs and which flatten to a single `currentColor`.
- [ ] Scannable — has headings, code blocks, and at-a-glance takeaways.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P1
**Effort:** 1
**Role:** icon author

---

### Feature 4.9: Animation Reference
A `/docs/animation` page listing every shipped keyframe with a live demo tile per theme, arranged as a grid of keyframes x themes so visitors can see that theme-driven duration and ease actually change the feel.

#### User Stories

**US-4.9.1** — As a new user, I want a live tile for every keyframe, so that I can see what each named animation looks like before using it.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Every keyframe has a tile running the animation on loop (with a pause control).
- [ ] Content is authoritative — reflects current code, not aspiration.
- [ ] Scannable — has headings, code blocks, and at-a-glance takeaways.

**Priority:** P1
**Effort:** 3
**Role:** new user

**US-4.9.2** — As a theme author, I want the animation grid to show the same keyframe across every shipped theme, so that I can feel the difference theme motion tokens make.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Grid has rows per keyframe and columns per theme (or equivalent).
- [ ] Live previews re-skin when the theme picker swaps themes.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P1
**Effort:** 3
**Role:** theme author

**US-4.9.3** — As a screen-reader user, I want animations to respect `prefers-reduced-motion`, and I want the animation page to say so, so that I trust the system won't ignore my OS setting.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Page states the reduced-motion behavior of shipped keyframes.
- [ ] Demo tiles stop or simplify when `prefers-reduced-motion: reduce` is set.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P1
**Effort:** 1
**Role:** screen-reader user

---

### Feature 4.10: Accessibility Guide
A `/docs/a11y` page stating clearly what css-is-awesome does for accessibility (focus rings, reduced-motion, semantic-HTML defaults, contrast targets) and what it does not (claims the user still owns — heading hierarchy, ARIA, labels, keyboard flow). Not a replacement for your own audit.

#### User Stories

**US-4.10.1** — As a new user, I want a clear "what the system does for a11y" section, so that I know which defaults I inherit for free.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Section lists focus-ring defaults, reduced-motion support, contrast targets, semantic defaults in shipped components.
- [ ] Content is authoritative — reflects current code, not aspiration.
- [ ] Scannable — has headings, code blocks, and at-a-glance takeaways.

**Priority:** P1
**Effort:** 3
**Role:** new user

**US-4.10.2** — As a screen-reader user, I want a clear "what the system does NOT do" section, so that I can set expectations for sites built on top of it.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Section explicitly states claims the user still owns (heading hierarchy, ARIA labels, keyboard flow, alt text).
- [ ] Content is authoritative — reflects current code, not aspiration.
- [ ] Scannable — has headings, code blocks, and at-a-glance takeaways.

**Priority:** P1
**Effort:** 1
**Role:** screen-reader user

**US-4.10.3** — As a Bootstrap migrant, I want a short a11y checklist I can run against my migrated pages, so that I catch regressions introduced by the swap.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Checklist covers focus visibility, color-only signaling, motion reduction, and form labeling.
- [ ] Scannable — has headings, code blocks, and at-a-glance takeaways.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P1
**Effort:** 1
**Role:** Bootstrap migrant

---

### Feature 4.11: Recipes and Patterns
A `/docs/recipes` page with common compositions built from the system's primitives: login form, dashboard card grid, navbar with dropdown, data table row, empty state, skeleton loader, toast workflow. Each recipe is a complete, paste-ready example with commentary.

#### User Stories

**US-4.11.1** — As a copy-paster, I want complete recipes for login form, dashboard grid, navbar, table row, empty state, skeleton, and toast, so that I can start from a composition rather than from primitives.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] At least seven recipes listed above are present and complete.
- [ ] Every code sample runs as shown if copy-pasted.
- [ ] Live previews re-skin when the theme picker swaps themes.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P0
**Effort:** 7
**Role:** copy-paster

**US-4.11.2** — As a new user, I want each recipe to include short commentary on what's happening, so that I learn the idioms instead of just cargo-culting.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Each recipe has inline or adjacent prose explaining why the markup is shaped the way it is.
- [ ] Scannable — has headings, code blocks, and at-a-glance takeaways.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P0
**Effort:** 3
**Role:** new user

**US-4.11.3** — As an AI assistant, I want recipe entries tagged with the primitives they compose, so that I can suggest a recipe when a user describes a need in plain English.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Each recipe lists the mixins and utility classes it uses.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P1
**Effort:** 1
**Role:** AI assistant

---

### Feature 4.12: FAQ
A `/docs/faq` page answering the questions that come up repeatedly: why mixin-first? why a numbered scale? why not Tailwind? how do I override a token? how do I prevent flash-of-unstyled-content? Short answers, link out to longer explanations where they exist.

#### User Stories

**US-4.12.1** — As a Bootstrap migrant, I want direct answers to the design-choice questions ("why mixin-first", "why numbered scale", "why not Tailwind"), so that I can decide whether to adopt the system.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Each design-choice question has a short direct answer and, where relevant, a link to a longer writeup.
- [ ] Content is authoritative — reflects current code, not aspiration.
- [ ] Scannable — has headings, code blocks, and at-a-glance takeaways.

**Priority:** P2
**Effort:** 1
**Role:** Bootstrap migrant

**US-4.12.2** — As a new user, I want practical how-do-I answers ("override a token", "prevent FOUC", "use with a CSS-in-JS library"), so that I can unblock myself on day-one friction.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Each practical question has a working code snippet alongside the answer.
- [ ] Every code sample runs as shown if copy-pasted.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P2
**Effort:** 3
**Role:** new user

**US-4.12.3** — As an AI assistant, I want FAQ entries with stable anchor IDs per question, so that I can deep-link users to a specific answer.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Every question has a stable anchor ID matching a slug of the question.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P2
**Effort:** 1
**Role:** AI assistant

---

### Feature 4.13: Search (DocSearch / Pagefind)
Add a site-wide search that indexes every docs route and returns relevant hits with a keyboard-driven dropdown UI. Evaluate Algolia DocSearch (hosted, free for OSS docs) vs Pagefind (static, build-time index) and pick one based on deploy target and maintenance cost. The search input lives in the site header and opens a modal on click or `Cmd+K` / `Ctrl+K`.

#### User Stories

**US-4.13.1** — As a search user, I want to press `Cmd+K` (or `Ctrl+K`) anywhere on the site and type a query, so that I can jump to the right page without browsing the nav.

**Acceptance criteria:**
- [ ] `Cmd+K` on macOS and `Ctrl+K` on Windows/Linux open the search modal from any route.
- [ ] Typing a query returns results in under 300ms (measured locally on the built site).
- [ ] Arrow keys navigate results; Enter opens the highlighted result; Escape closes the modal.
- [ ] The modal is keyboard-accessible (focus trapped while open, restored on close).
- [ ] Works on mobile viewports (320px, 375px, 414px) — modal is full-screen on narrow widths.

**Priority:** P1
**Effort:** 7
**Role:** search user

**US-4.13.2** — As a visitor on desktop, I want the search input to be visible in the site header, so that I know the site is searchable without discovering a keyboard shortcut.

**Acceptance criteria:**
- [ ] A search input (or button styled as one) is present in `SiteHeader` on viewports ≥768px.
- [ ] Clicking the input opens the search modal.
- [ ] The placeholder text shows the keyboard shortcut (e.g. "Search docs… ⌘K").
- [ ] No layout shift (CLS) when the header renders.

**Priority:** P1
**Effort:** 1
**Role:** visitor on desktop

**US-4.13.3** — As a system author, I want the search index to rebuild automatically as part of the site build, so that no doc page is ever missing from search.

**Acceptance criteria:**
- [ ] The chosen search provider's index is generated during `npm run build` (Pagefind) or scheduled via DocSearch crawler config.
- [ ] A new page added under any docs route appears in search after the next build with no manual step.
- [ ] The build step documents itself in `package.json` scripts and the site README.
- [ ] A fallback message ("Search unavailable") renders if the index fails to load (search is the documented exception to the "works without JS" rule).

**Priority:** P1
**Effort:** 3
**Role:** system author

---

### Feature 4.14: TOC auto-highlight + scroll-spy
The right-side TOC on every docs page should track the current scroll position and highlight the heading the reader is currently viewing. Implement with `IntersectionObserver`, not scroll listeners. Clicking a TOC entry should smooth-scroll to the heading with the sticky-header offset applied.

#### User Stories

**US-4.14.1** — As a TOC scanner, I want the active section to highlight as I scroll, so that I always know where I am in a long page.

**Acceptance criteria:**
- [ ] A `TableOfContents` component uses `IntersectionObserver` to detect the currently visible heading.
- [ ] The active entry gets a distinct visual state (color + border or background).
- [ ] Highlighting updates within 100ms of the heading entering the viewport.
- [ ] No layout shift (CLS) when the active state changes.
- [ ] Works on every docs route that renders a TOC.

**Priority:** P1
**Effort:** 3
**Role:** TOC scanner

**US-4.14.2** — As a visitor on desktop, I want clicking a TOC entry to smooth-scroll to that heading, so that navigation feels polished.

**Acceptance criteria:**
- [ ] Clicking a TOC entry calls `element.scrollIntoView({ behavior: 'smooth' })` with a header-height offset applied.
- [ ] The URL hash updates (`#heading-slug`) without a hard jump.
- [ ] The target heading is visually positioned below the sticky header after scrolling.
- [ ] Keyboard-accessible (Tab to the entry, Enter activates).

**Priority:** P1
**Effort:** 1
**Role:** visitor on desktop

**US-4.14.3** — As a visitor on mobile, I want the TOC to either collapse or move to a reachable location, so that it doesn't eat my screen.

**Acceptance criteria:**
- [ ] Below 1024px the TOC either hides or collapses into a disclosure triggered by a "On this page" button.
- [ ] The collapsed TOC is keyboard-accessible (Tab, Enter to expand, Escape to close).
- [ ] Works on mobile viewports (320px, 375px, 414px).
- [ ] No layout shift (CLS) when expanding/collapsing.

**Priority:** P1
**Effort:** 1
**Role:** visitor on mobile

---

### Feature 4.15: Prev/next docs navigation
Every docs page gets a footer with "Previous" and "Next" links based on the canonical nav order. Order is defined in a single config (e.g. `src/lib/docs-nav.ts`) that also feeds the sidebar. Links render with the sibling page's title and a short arrow glyph.

#### User Stories

**US-4.15.1** — As a visitor on desktop, I want prev/next links at the bottom of every docs page, so that I can read through the docs in order without going back to the sidebar.

**Acceptance criteria:**
- [ ] Every page under `/docs` renders a `PrevNext` component in its footer.
- [ ] The component reads the current route from `usePathname()` (or equivalent) and resolves the sibling pages from the nav config.
- [ ] The first page shows only "Next"; the last page shows only "Previous".
- [ ] Each link shows the sibling page's title (not just "Next →").
- [ ] Keyboard-accessible (Tab, Enter).
- [ ] Still works when JavaScript is disabled (static links, resolved at build time).

**Priority:** P1
**Effort:** 3
**Role:** visitor on desktop

**US-4.15.2** — As a system author, I want prev/next order to come from the same source as the sidebar, so that the two can never drift.

**Acceptance criteria:**
- [ ] A single `docs-nav.ts` (or `.json`) file exports the ordered list of docs routes.
- [ ] Both the sidebar and `PrevNext` consume this file.
- [ ] Adding a new page to the nav config places it in both the sidebar and the prev/next chain automatically.
- [ ] A unit test (or build-time check) asserts every docs page is referenced in the nav config.

**Priority:** P1
**Effort:** 1
**Role:** system author

**US-4.15.3** — As a visitor on mobile, I want prev/next links to stack vertically and stay tappable, so that they work on a phone.

**Acceptance criteria:**
- [ ] Below 640px prev/next stack into a single column with full-width tap targets (≥44px height).
- [ ] Works on mobile viewports (320px, 375px, 414px).
- [ ] No layout shift (CLS).

**Priority:** P1
**Effort:** 1
**Role:** visitor on mobile

---

### Feature 4.16: Edit on GitHub links
Every docs page ships a small "Edit this page on GitHub" link that opens the source file for that route on `github.com/<owner>/<repo>/edit/<branch>/<path>`. The path is computed from the route at build time so no per-page boilerplate is needed.

#### User Stories

**US-4.16.1** — As a visitor on desktop, I want an "Edit on GitHub" link on every docs page, so that I can fix typos and submit a PR without cloning the repo.

**Acceptance criteria:**
- [ ] Every page under `/docs` renders an "Edit on GitHub" link in a consistent location (e.g. end of content, above prev/next).
- [ ] The link targets `https://github.com/<owner>/<repo>/edit/main/<source-path>` with the correct file path for the current route.
- [ ] Link is keyboard-accessible.
- [ ] Link opens in a new tab with `rel="noopener noreferrer"`.

**Priority:** P1
**Effort:** 1
**Role:** visitor on desktop

**US-4.16.2** — As a system author, I want the source-path resolution to live in one helper, so that adding a new page doesn't require wiring the link manually.

**Acceptance criteria:**
- [ ] A `getEditUrl(pathname)` helper (or equivalent) returns the correct GitHub edit URL for any docs route.
- [ ] The repo owner, name, branch, and base source directory are read from a single config (env var or constants file).
- [ ] Adding a new docs page requires zero manual edit-link wiring.
- [ ] The helper is covered by a unit test (even a trivial one) to lock the URL format.

**Priority:** P1
**Effort:** 1
**Role:** system author

---

### Feature 4.17: OpenGraph / social share metadata
Every route ships a full set of social-share meta tags (`og:title`, `og:description`, `og:image`, `og:url`, `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`). Preview images live at `public/og/<route>.png`; at minimum produce hand-built images for `/`, `/docs`, `/themes`, `/examples`, `/compare`, `/showcase`, `/blog`, `/about`.

#### User Stories

**US-4.17.1** — As a social-share recipient, I want a link to css-is-awesome to render a rich preview card in Twitter, Slack, and Discord, so that I know what I'm clicking.

**Acceptance criteria:**
- [ ] Every route under `src/app/` exports Next.js `metadata` with `openGraph` and `twitter` fields populated.
- [ ] Each route has a preview image at `public/og/<route>.png` sized 1200×630.
- [ ] `og:title`, `og:description`, `og:image`, `og:url`, `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image` are all present in rendered HTML (verified via `curl <url>`).
- [ ] Twitter's Card Validator and a Slack unfurl both render the card correctly for at least `/` and `/docs`.

**Priority:** P1
**Effort:** 3
**Role:** social-share recipient

**US-4.17.2** — As a system author, I want a default OG image that applies when a route doesn't declare its own, so that no page ever ships without a card.

**Acceptance criteria:**
- [ ] `public/og/default.png` exists (1200×630, branded).
- [ ] Routes that don't override `openGraph.images` fall back to the default.
- [ ] The root `layout.tsx` defines `metadata.openGraph.images` with the default.
- [ ] Any new route inherits the default automatically.

**Priority:** P1
**Effort:** 1
**Role:** system author

**US-4.17.3** — As a visitor on desktop, I want the page `<title>` and meta description to match the OG card, so that browser tabs and search snippets stay consistent.

**Acceptance criteria:**
- [ ] Every route's `metadata.title` and `metadata.description` are identical to its `openGraph.title` and `openGraph.description`.
- [ ] A build-time check (or test) asserts parity for every route.
- [ ] No route uses a default placeholder like "Next.js App".

**Priority:** P1
**Effort:** 1
**Role:** visitor on desktop

---

### Feature 4.18: Custom 404 page
Replace the default Next.js 404 with a themed page that matches the rest of the site. The page renders the normal `SiteHeader` and `SiteFooter`, keeps the theme picker working, offers a search input (if search is available), and suggests 3–5 popular destinations. Route: `src/app/not-found.tsx`.

#### User Stories

**US-4.18.1** — As a visitor on desktop, I want a themed 404 page when I hit a broken link, so that I don't feel dropped into a default error screen.

**Acceptance criteria:**
- [ ] `src/app/not-found.tsx` exists and renders a page with `SiteHeader`, a clear "404 — page not found" headline, a short message, 3–5 suggested links, and `SiteFooter`.
- [ ] The theme picker in the header works on the 404 page (switches themes and persists).
- [ ] The page has its own OG metadata (see Feature 4.17).
- [ ] Works on mobile viewports (320px, 375px, 414px).
- [ ] No layout shift (CLS) on load.

**Priority:** P0
**Effort:** 1
**Role:** visitor on desktop

**US-4.18.2** — As a search user, I want a search input on the 404 page, so that I can find what I was looking for without going home first.

**Acceptance criteria:**
- [ ] If search (Feature 4.13) is live, the 404 page renders the search input in the content area (not just the header).
- [ ] Hitting Enter in the input opens the search modal pre-populated with the query.
- [ ] Works on mobile viewports.
- [ ] Keyboard-accessible.

**Priority:** P2
**Effort:** 1
**Role:** search user

**US-4.18.3** — As a screen-reader user, I want the 404 page to announce itself clearly, so that I know a navigation error occurred.

**Acceptance criteria:**
- [ ] The page has a single `<h1>` with the 404 message.
- [ ] The document title is "Page not found — css-is-awesome" (or equivalent).
- [ ] Landmarks (`<header>`, `<main>`, `<footer>`) are present and labeled.
- [ ] Lighthouse a11y score is ≥95 on the 404 page.

**Priority:** P0
**Effort:** 1
**Role:** screen-reader user

---

### Feature 4.19: Favicon variants + PWA manifest
Ship a complete favicon set (`favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `favicon-dark.ico` or SVG variant) and a `manifest.json` that makes the site installable as a PWA (name, short_name, icons, theme_color, background_color, start_url, display).

#### User Stories

**US-4.19.1** — As a visitor on desktop, I want a crisp favicon in my browser tab, so that the site looks finished and I can find the tab quickly.

**Acceptance criteria:**
- [ ] `public/favicon.ico` exists (multi-resolution, includes 16×16 and 32×32 frames).
- [ ] `public/favicon-16x16.png` and `public/favicon-32x32.png` exist.
- [ ] `public/apple-touch-icon.png` exists at 180×180.
- [ ] `src/app/layout.tsx` references all of the above in the `<head>` via Next.js metadata.
- [ ] The favicon renders correctly in Chrome, Safari, and Firefox.

**Priority:** P0
**Effort:** 1
**Role:** visitor on desktop

**US-4.19.2** — As a visitor on mobile, I want to install the site as a PWA and get a proper icon on my home screen, so that it feels like a real app.

**Acceptance criteria:**
- [ ] `public/manifest.json` exists with `name`, `short_name`, `icons` (192×192 and 512×512), `theme_color`, `background_color`, `start_url`, and `display`.
- [ ] Chrome's "Add to Home Screen" prompt offers the site as installable.
- [ ] The installed app opens with the declared `start_url` and `display` mode.
- [ ] The home-screen icon matches the declared 192/512 PNG.

**Priority:** P0
**Effort:** 1
**Role:** visitor on mobile

**US-4.19.3** — As a visitor on desktop with dark-mode OS preference, I want a dark-variant favicon in Safari's pinned-tab / dark-tab rendering, so that the icon stays readable.

**Acceptance criteria:**
- [ ] A `favicon-dark` variant (SVG with `prefers-color-scheme: dark` media block, or a second PNG) is shipped.
- [ ] The `<link>` tags in `layout.tsx` reference the dark variant for dark-mode browsers.
- [ ] Verified in Safari and a dark-mode Chrome profile.

**Priority:** P2
**Effort:** 1
**Role:** visitor on desktop with dark-mode OS preference

---

### Feature 4.20: Copy-to-clipboard on code blocks
Every `<pre>` on the site gets a small button in its top-right corner that copies the raw snippet to the clipboard. On success the button shows a "Copied!" tooltip for ~1.5s then reverts. Implementation wraps rendered `<pre>` blocks at build time (for MDX) or in a shared `CodeBlock` component.

#### User Stories

**US-4.20.1** — As a copy-paste user, I want a copy button on every code block, so that I don't have to triple-click to select the snippet.

**Acceptance criteria:**
- [ ] Every `<pre>` rendered on a docs, examples, or compare page has a visible copy button in the top-right corner.
- [ ] Clicking the button copies the raw snippet text (not the highlighted HTML) to the clipboard.
- [ ] On success the button shows a "Copied!" confirmation for ~1.5s, then reverts.
- [ ] Works on mobile viewports (button is tappable, min 32×32).
- [ ] Keyboard-accessible (Tab, Enter/Space).

**Priority:** P0
**Effort:** 3
**Role:** copy-paste user

**US-4.20.2** — As a screen-reader user, I want the copy button to announce its action and result, so that I know the snippet was copied.

**Acceptance criteria:**
- [ ] The button has an accessible label (e.g. `aria-label="Copy code snippet"`).
- [ ] On success, an `aria-live` region announces "Copied to clipboard" (or equivalent).
- [ ] Focus does not move unexpectedly on click.
- [ ] Lighthouse a11y score ≥95 on any page that renders code blocks.

**Priority:** P0
**Effort:** 1
**Role:** screen-reader user

**US-4.20.3** — As a visitor on a browser without `navigator.clipboard`, I want a graceful fallback, so that the button doesn't appear broken.

**Acceptance criteria:**
- [ ] If `navigator.clipboard` is undefined, the button falls back to `document.execCommand('copy')` or hides entirely.
- [ ] No uncaught exception in the console on unsupported browsers.
- [ ] The underlying `<pre>` remains selectable so manual copy still works.

**Priority:** P2
**Effort:** 1
**Role:** visitor on a browser without `navigator.clipboard`

---

### Feature 4.21: Shiki syntax highlighting
Replace the hand-coded `<span className="tok-*">` highlighting with Shiki, run at build time, so that the rendered HTML already includes the right classes/colors with no runtime JS cost. Support at least `css`, `scss`, `html`, `tsx`, `jsx`, `json`, `sh`. Pick a theme pair (light/dark) that matches the site's default theme tokens.

#### User Stories

**US-4.21.1** — As a visitor on desktop, I want code snippets to have accurate, consistent syntax highlighting, so that samples are easy to read.

**Acceptance criteria:**
- [ ] Shiki is integrated into the MDX / content pipeline at build time.
- [ ] At least 7 languages are supported: `css`, `scss`, `html`, `tsx`, `jsx`, `json`, `sh`.
- [ ] Rendered HTML contains Shiki's tokens as `<span>`s with inline styles or class names — no runtime JS required.
- [ ] All existing hand-coded `tok-*` spans in the site are removed.
- [ ] Still works when JavaScript is disabled.

**Priority:** P1
**Effort:** 3
**Role:** visitor on desktop

**US-4.21.2** — As a system author, I want Shiki's theme to match the site's current theme tokens, so that highlighting doesn't clash with the surrounding UI.

**Acceptance criteria:**
- [ ] A light Shiki theme is applied by default and a dark Shiki theme is applied when `data-theme="dark"` (or the equivalent) is active.
- [ ] The highlighting swaps without a page reload when the theme picker changes.
- [ ] Token colors visually harmonize with the site's primary/secondary tokens (spot-check against each in-repo theme).
- [ ] No FOUC on initial load.

**Priority:** P1
**Effort:** 1
**Role:** system author

**US-4.21.3** — As a system author, I want the Shiki build step to fail loudly on an unknown language, so that a typo'd code fence doesn't ship as plain text.

**Acceptance criteria:**
- [ ] Using an unregistered language in a code fence fails the build (or logs a warning visible in CI).
- [ ] The error message names the offending file and fence.
- [ ] Adding a new language requires one documented edit in the Shiki config.

**Priority:** P2
**Effort:** 1
**Role:** system author

---

### Feature 4.22: Mobile nav (hamburger + drawer)
`SiteHeader` is sticky on desktop. Below 768px it should collapse into a hamburger button that opens a full-height drawer containing the full nav + theme picker. Drawer slides in, focus is trapped, Escape closes, scroll on the underlying page is locked while open.

#### User Stories

**US-4.22.1** — As a visitor on mobile, I want a hamburger button that opens the full nav in a drawer, so that I can navigate the site on a phone.

**Acceptance criteria:**
- [ ] Below 768px the desktop nav is replaced by a hamburger button in the header.
- [ ] Tapping the hamburger opens a drawer from the right (or left) containing every top-level nav link + the theme picker.
- [ ] Tapping outside the drawer, tapping a nav link, or tapping a close button closes it.
- [ ] Body scroll is locked while the drawer is open.
- [ ] Works on mobile viewports (320px, 375px, 414px).

**Priority:** P0
**Effort:** 3
**Role:** visitor on mobile

**US-4.22.2** — As a keyboard user, I want to open and close the mobile drawer with the keyboard, so that I can navigate without a touchscreen.

**Acceptance criteria:**
- [ ] Tab reaches the hamburger button; Enter/Space opens the drawer.
- [ ] Focus moves into the drawer on open and is trapped inside until close.
- [ ] Escape closes the drawer and returns focus to the hamburger button.
- [ ] All nav links inside the drawer are reachable via Tab.
- [ ] Lighthouse a11y score ≥95 on mobile viewports.

**Priority:** P0
**Effort:** 1
**Role:** keyboard user

**US-4.22.3** — As a screen-reader user, I want the hamburger button and drawer to be announced correctly, so that I know the nav is there and how to use it.

**Acceptance criteria:**
- [ ] The hamburger has `aria-label="Open navigation"` (or toggles between open/close labels) and `aria-expanded` reflecting state.
- [ ] The drawer is a `<dialog>` or has `role="dialog"` with `aria-modal="true"` and a labeled heading.
- [ ] The rest of the page is inert (`aria-hidden` or `inert`) while the drawer is open.
- [ ] Verified with VoiceOver on iOS and TalkBack on Android at least once.

**Priority:** P0
**Effort:** 1
**Role:** screen-reader user

---

### Feature 4.23: Skip-to-content + keyboard polish
Every page ships a "Skip to content" link as the first focusable element. When focused (Tab on page load) it becomes visible and, when activated, moves focus to the `<main>` landmark. Also audit focus-visible outlines, tab order, and ensure the theme picker, search, and drawer all behave under keyboard-only operation.

#### User Stories

**US-4.23.1** — As a keyboard user, I want a "Skip to content" link as the first focusable element, so that I can bypass the nav on every page.

**Acceptance criteria:**
- [ ] A `<a href="#main">Skip to content</a>` (or equivalent) is the first focusable element on every page.
- [ ] The link is visually hidden by default and becomes visible when focused.
- [ ] Activating the link moves focus to the `<main>` landmark and scrolls it into view.
- [ ] Works on every route, including the 404 page.
- [ ] Still works when JavaScript is disabled.

**Priority:** P0
**Effort:** 1
**Role:** keyboard user

**US-4.23.2** — As a keyboard user, I want every interactive element to have a visible focus outline, so that I always know where I am.

**Acceptance criteria:**
- [ ] Every link, button, input, and custom interactive element shows a visible `:focus-visible` outline.
- [ ] The outline color meets 3:1 contrast against adjacent colors (per WCAG 2.4.11).
- [ ] No rule in global CSS sets `outline: none` without a replacement style.
- [ ] Lighthouse a11y score ≥95 on a sampled page.

**Priority:** P0
**Effort:** 1
**Role:** keyboard user

**US-4.23.3** — As a screen-reader user, I want landmark regions on every page, so that I can jump between sections.

**Acceptance criteria:**
- [ ] Every page has `<header>`, `<main>`, and `<footer>` landmarks.
- [ ] Docs pages also have a `<nav aria-label="Table of contents">` for the TOC and a `<nav aria-label="Primary">` for the sidebar (when present).
- [ ] No page has more than one `<h1>`.
- [ ] Verified with a screen reader (VoiceOver or NVDA) on at least `/`, `/docs`, and the 404 page.

**Priority:** P0
**Effort:** 1
**Role:** screen-reader user

---

### Feature 4.24: Smooth scroll + anchor offset
Clicking any internal link that targets a fragment (e.g. `/docs/buttons#variants`) should smooth-scroll to the target heading with the sticky-header height offset applied, so the heading lands below the header rather than under it. Apply via `scroll-margin-top` on headings plus `scroll-behavior: smooth` on the root, with a JS fallback only where needed.

#### User Stories

**US-4.24.1** — As a visitor on desktop, I want fragment links to smooth-scroll with the header offset baked in, so that clicking `#variants` doesn't bury the heading under the sticky nav.

**Acceptance criteria:**
- [ ] `html { scroll-behavior: smooth; }` is set (respecting `prefers-reduced-motion`).
- [ ] Every heading that serves as an anchor target has `scroll-margin-top` equal to the sticky-header height plus a small buffer.
- [ ] Clicking a TOC entry, a nav-menu anchor, or pasting a `#`-URL lands the heading visibly below the header.
- [ ] Works on every route that has headings.

**Priority:** P2
**Effort:** 1
**Role:** visitor on desktop

**US-4.24.2** — As a visitor with `prefers-reduced-motion`, I want smooth scrolling to be suppressed, so that my accessibility preference is respected.

**Acceptance criteria:**
- [ ] `@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }` is applied.
- [ ] Fragment-link clicks jump instantly (no smooth animation) when the preference is on.
- [ ] Verified by toggling "Reduce motion" in OS settings.

**Priority:** P2
**Effort:** 1
**Role:** visitor with `prefers-reduced-motion`

**US-4.24.3** — As a system author, I want a single CSS variable (e.g. `--header-height`) to drive both the sticky header height and the anchor offset, so that the two can never drift.

**Acceptance criteria:**
- [ ] `--header-height` is defined once on `:root` (or a close ancestor).
- [ ] The sticky header consumes it for its own height/padding.
- [ ] Headings' `scroll-margin-top` reads from the same variable.
- [ ] Changing the variable updates both simultaneously.

**Priority:** P2
**Effort:** 1
**Role:** system author

---

### Feature 4.25: Launch-mode gate (coming-soon + announcement overlay)
A runtime-toggleable mode that lets the deployed site switch between "under construction / coming soon" and the normal docs experience without a rebuild. Reused later as an announcement / update banner for release days and incident notices. The toggle lives in `public/flags.json` so the host can edit a single file to flip states.

#### User Stories

**US-4.25.1** — As a maintainer, I want to flip the site into "coming soon" mode by editing a single JSON file on the host, so that I can protect the docs experience while it's incomplete without rebuilding the site.

**Acceptance criteria:**
- [ ] `public/flags.json` exists with a `comingSoon: boolean` field and is served at `/flags.json`.
- [ ] On every page, a small client hook fetches `/flags.json` on mount (with a short cache).
- [ ] When `comingSoon: true`, the visible page content is replaced by a full-page overlay: logo, short "we're building this" copy, a visible theme picker (so the coming-soon page itself demonstrates the system), and optional email-signup stub.
- [ ] When `comingSoon: false`, the overlay does not render and the docs site is normal.
- [ ] Flipping `flags.json` on the host shows the change within one hard reload; no rebuild required.

**Priority:** P1
**Effort:** 3
**Role:** maintainer

**US-4.25.2** — As a visitor hitting the site during coming-soon mode, I want the theme picker to still work on the overlay, so that the "under construction" page itself proves the system is alive.

**Acceptance criteria:**
- [ ] Theme picker renders inside the coming-soon overlay.
- [ ] Clicking a theme re-skins the overlay immediately.
- [ ] No layout shift, no hydration warning.
- [ ] Basic copy + branding still visible on every shipped theme (passes eyeball check on Sketchbook / Graphite / Glass / Terminal).

**Priority:** P1
**Effort:** 1
**Role:** visitor

**US-4.25.3** — As a maintainer, I want to reuse the same flag mechanism for non-blocking announcements, so that release days can surface a banner without shipping a new build.

**Acceptance criteria:**
- [ ] `flags.json` supports an `announcement` object: `{ active: boolean, message: string, href?: string, status?: "info" | "success" | "warning" }`.
- [ ] When `announcement.active: true` AND `comingSoon: false`, a dismissible banner renders at the top of every route.
- [ ] Banner uses `<Alert>` component visuals for consistency.
- [ ] Dismiss persists in `sessionStorage` for that message id so it doesn't nag on every page change.

**Priority:** P2
**Effort:** 3
**Role:** maintainer

**US-4.25.4** — As a maintainer, I want the coming-soon page to be SEO-friendly, so that the site isn't indexed as empty while it's gated.

**Acceptance criteria:**
- [ ] When `comingSoon: true`, overlay renders `<meta name="robots" content="noindex, nofollow">` via `<Head>`.
- [ ] When flag flips back, the meta tag disappears and the site becomes indexable again.
- [ ] A one-line README section explains the flag file and the robots behavior.

**Priority:** P2
**Effort:** 1
**Role:** maintainer

---

### Feature 4.26: `/compare` page refresh
The `/compare` route already ships a feature table comparing css-is-awesome to Bootstrap and Tailwind, but it stops at marketing copy and a verdict grid. This feature refreshes the page to carry the differentiator story end-to-end: the three-tier authoring model (Tier 1 utilities, Tier 2 mixins, Tier 3 component overrides), the one-file theme-swap model, the mixin-router pattern (`$theme-components` map), the contract validator pattern, the animation system, and the `cia-` namespace policy. Most importantly it lands a hard-numbers bundle-size table — cia core ~2 KB gzipped vs Bootstrap ~25 KB vs Tailwind compiled — so the differentiator argument runs on data, not adjectives. The existing `src/app/compare/page.tsx` is the surface to extend; this is a refresh, not a rebuild.

#### User Stories

**US-4.26.1** — As a Bootstrap migrant evaluating alternatives, I want a hard-numbers bundle-size table on `/compare`, so that I can justify the swap with measured byte counts instead of marketing claims.

**Acceptance criteria:**
- [ ] `/compare` renders a dedicated bundle-size section with measured numbers for cia core gzipped, cia full gzipped, Bootstrap CSS gzipped, Bootstrap JS gzipped, and Tailwind compiled (typical app) gzipped.
- [ ] Each number cites its measurement method (e.g. "minified + gzipped, measured against `dist/cia.min.css` at vX.Y.Z").
- [ ] Numbers are sourced from a single config or generated artifact — not free-typed strings drifting from reality.
- [ ] Content is authoritative — reflects current code, not aspiration.
- [ ] Scannable — the table is the focal element of the section.

**Priority:** P0
**Effort:** 3
**Role:** Bootstrap migrant evaluating alternatives

**US-4.26.2** — As a new user reading `/compare`, I want the page to explain the three-tier authoring model, the mixin-router, the contract validator, the animation system, and the `cia-` namespace policy, so that I understand the differentiators before I see the verdict grid.

**Acceptance criteria:**
- [ ] Page renders a "What makes cia different" section covering: three-tier authoring (utilities / mixins / component overrides), one-file theme-swap, mixin-router (`$theme-components`), contract validator, animation system, and `cia-` namespace.
- [ ] Each differentiator has a one-line claim plus a tiny code or markup example showing the pattern.
- [ ] Live previews re-skin when the theme picker swaps themes.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P0
**Effort:** 3
**Role:** new user

**US-4.26.3** — As an AI assistant generating "should I use cia" answers, I want the `/compare` differentiators to have stable anchor IDs, so that I can deep-link a user to a specific argument.

**Acceptance criteria:**
- [ ] Every differentiator section heading on `/compare` has a stable `#anchor` ID matching a slug of the heading.
- [ ] The bundle-size table has a stable `#bundle-size` (or equivalent) anchor.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P1
**Effort:** 1
**Role:** AI assistant

---

### Feature 4.27: `/showcase` page (real pages, theme-swappable)
A new top-level route at `/showcase` that hosts full, real-looking pages built entirely from the system: a marketing landing page, a blog post with hero + body + author card, a dashboard with sidebar + cards + table, and a 404. Every page is theme-swappable in one click via the existing `data-theme` attribute model — the same picker used elsewhere on the site re-skins all four showcase pages without a reload. This is the "show, don't tell" piece: nothing on the site today demonstrates the swap on real chrome at full page scale. It also dogfoods the system end-to-end and surfaces gaps faster than any unit test.

#### User Stories

**US-4.27.1** — As a new user evaluating cia, I want a `/showcase` index that lets me jump into a marketing landing, a blog post, a dashboard, and a 404 — all built with cia, all theme-swappable — so that I can see what the system actually produces at full page scale.

**Acceptance criteria:**
- [ ] `/showcase` route exists with an index that links to four sub-routes: `/showcase/landing`, `/showcase/blog`, `/showcase/dashboard`, `/showcase/404`.
- [ ] Each sub-route renders a complete, real-looking page — not a fragment, not a card grid, but full chrome (header/hero/body/footer or equivalent).
- [ ] Markup uses cia mixins, utilities, and component primitives — no per-page bespoke CSS that bypasses the system.
- [ ] Every code sample (if shown inline) runs as shown if copy-pasted.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P0
**Effort:** 7
**Role:** new user

**US-4.27.2** — As a visitor on `/showcase/*`, I want every page to re-skin in one click via the same theme picker used elsewhere, so that I can feel the theme-swap claim instead of just reading it.

**Acceptance criteria:**
- [ ] Every `/showcase/*` page renders the standard theme picker (`SiteHeader` or equivalent).
- [ ] Picking a theme re-skins the entire page through `data-theme` — including hero, body, cards, tables, buttons, badges, table chrome.
- [ ] No layout shift (CLS) or hydration warning on theme swap.
- [ ] Live previews re-skin across every shipped theme (passes eyeball check on each in-repo theme).

**Priority:** P0
**Effort:** 3
**Role:** visitor

**US-4.27.3** — As a system author, I want the showcase pages to dogfood the public mixin and utility surface, so that gaps and rough edges show up in the showcase before they show up in user code.

**Acceptance criteria:**
- [ ] Every showcase page is built only from public mixins, utilities, and shipped React/HTML components — no private internal-only helpers.
- [ ] A short README or page-level comment in each showcase route lists the primitives composed.
- [ ] Adding a new shipped component or mixin family is followed by a showcase update issue (linked from this feature in the backlog).
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P1
**Effort:** 3
**Role:** system author

**US-4.27.4** — As a screen-reader user, I want each showcase page to have proper landmarks, heading hierarchy, and labeled regions, so that the showcase models accessible defaults rather than visual-only chrome.

**Acceptance criteria:**
- [ ] Every showcase page has `<header>`, `<main>`, and `<footer>` landmarks; no more than one `<h1>`.
- [ ] Dashboard showcase labels its sidebar `<nav>` and content `<main>` regions.
- [ ] Lighthouse a11y score ≥95 on every showcase route.
- [ ] Verified with VoiceOver or NVDA on at least the landing and dashboard routes.

**Priority:** P1
**Effort:** 1
**Role:** screen-reader user

---

### Feature 4.28: Bootstrap migration wedge (drop-in alongside)
A new docs page (under `/docs/migration/bootstrap-wedge` or extending Feature 4.6) that shows how to drop css-is-awesome into an existing Bootstrap project without ripping Bootstrap out first. Three pieces: (1) a namespace-collision walkthrough proving that the `cia-*` prefix means classes can coexist with Bootstrap's `btn`, `card`, `row`, `col`, etc.; (2) a 20-line migration sample showing a real Bootstrap component being progressively replaced by Tier 2 cia mixins; (3) a side-by-side button comparison showing equivalent Bootstrap markup vs cia Tier 2 code, line by line, so the reader can see the swap concretely. Distinct from Feature 4.6 — that feature compares patterns; this feature shows incremental adoption inside a live Bootstrap codebase.

#### User Stories

**US-4.28.1** — As a Bootstrap migrant who can't do a full rewrite, I want a "drop cia in alongside Bootstrap" guide proving the namespaces don't collide, so that I can adopt incrementally.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar (under migration).
- [ ] Section explicitly states the `cia-` prefix policy and walks through importing both stylesheets in the same page without conflicts.
- [ ] A working example shows a Bootstrap component and a cia component on the same page, both rendering correctly.
- [ ] Every code sample runs as shown if copy-pasted.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P1
**Effort:** 3
**Role:** Bootstrap migrant

**US-4.28.2** — As a Bootstrap migrant, I want a roughly 20-line migration sample showing a Bootstrap component being progressively replaced by cia Tier 2 mixins, so that I can see what an incremental migration commit actually looks like.

**Acceptance criteria:**
- [ ] Page contains a "before / step / after" code progression of about 20 lines total.
- [ ] Each step is a small, reviewable diff — not a wholesale rewrite.
- [ ] Final state uses Tier 2 cia mixins (e.g. `@include btn-base`, `@include card-base`).
- [ ] Every code sample runs as shown if copy-pasted.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P1
**Effort:** 3
**Role:** Bootstrap migrant

**US-4.28.3** — As a Bootstrap migrant, I want a side-by-side button comparison (Bootstrap markup vs Tier 2 cia code), so that I can map a single concrete pattern in one glance.

**Acceptance criteria:**
- [ ] Page has a labeled side-by-side block showing Bootstrap button markup and equivalent cia Tier 2 code.
- [ ] Adjacent prose calls out the differences (token-driven sizing, semantic mixins, no JS dependency).
- [ ] Every code sample runs as shown if copy-pasted.
- [ ] Live preview re-skins when the theme picker swaps themes.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P1
**Effort:** 1
**Role:** Bootstrap migrant

---

### Feature 4.29: Tailwind→Awesome migration CLI (post-1.0)
A small command-line tool that parses Tailwind class strings (e.g. `flex items-center justify-between p-4 gap-2`) and suggests an equivalent semantic cia mixin (e.g. `@include hstack-between` with a spacing token). The CLI is the wedge for migrating from the dominant incumbent: it lowers the activation cost for Tailwind users curious about cia from "rewrite my templates by hand" to "pipe my classNames through one command and review the diff." Recommended location: a separate `packages/migrate-from-tailwind/` workspace (or `scripts/migrate-from-tailwind/` if monorepo isn't in place yet) so it can ship as its own npm package later without dragging the whole repo with it. Companion docs page lives under `/docs/migration/tailwind` or a new `/migrate` route. Post-1.0; this is wedge work, not launch-blocking.

#### User Stories

**US-4.29.1** — As a Tailwind user evaluating cia, I want a CLI that takes a Tailwind class string and prints an equivalent cia semantic mixin, so that I can see what my templates would look like without rewriting them by hand.

**Acceptance criteria:**
- [ ] A CLI binary (e.g. `npx @css-is-awesome/migrate-from-tailwind`) is published or runnable from the repo.
- [ ] Input: a Tailwind class string (via argv, stdin, or a file path); Output: a suggested cia mixin call plus any residual utility classes that didn't map cleanly.
- [ ] At least the layout primitives (`flex`, `items-*`, `justify-*`, `gap-*`, `p-*`, `m-*`, `text-*`, `bg-*`, `rounded-*`) are mapped.
- [ ] Unmapped classes are passed through with a "no equivalent found" comment so the user can review and decide.
- [ ] CLI exits 0 on success, non-zero on parse error, with a clear error message.

**Priority:** P2
**Effort:** 9
**Role:** Tailwind user evaluating cia

**US-4.29.2** — As a system author, I want the CLI to live in its own workspace package so it can be released independently, so that the migration tool can iterate without bumping the main library version.

**Acceptance criteria:**
- [ ] CLI source lives under `packages/migrate-from-tailwind/` (preferred) or `scripts/migrate-from-tailwind/` if the monorepo split isn't in place yet — the AC documents the chosen location.
- [ ] The package has its own `package.json` with a `bin` entry and its own version.
- [ ] The package builds and runs without any dependency on the main site or React app.
- [ ] A short README in the package explains scope, supported classes, and known gaps.

**Priority:** P2
**Effort:** 3
**Role:** system author

**US-4.29.3** — As a Tailwind migrant, I want a companion docs page explaining the CLI, the mapping table, and the known gaps, so that I trust the output before I let it touch my templates.

**Acceptance criteria:**
- [ ] A `/docs/migration/tailwind` (or `/migrate`) page exists, linked from the `/docs` migration section.
- [ ] Page documents installation, CLI usage, the Tailwind→cia mapping table, and explicit known gaps (arbitrary values, plugins, dark: variants).
- [ ] Every code sample runs as shown if copy-pasted.
- [ ] Live previews (where applicable) re-skin when the theme picker swaps themes.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P2
**Effort:** 3
**Role:** Tailwind migrant

---

### Feature 4.30: `/components` — copy-paste HTML reference page
A new top-level docs-site route (working name `/components`; final slug TBD) that sits between `/docs` (formal token tables and mixin API reference) and `/showcase` (full aspirational pages). It is reference-by-demonstration: every shipped component appears as **pure HTML + cia classes/mixins**, copy-paste ready, with a live preview, a "Copy HTML" button, and per-example metadata (which mixin generates this variant, which Tier 1 utility-class equivalents work, supported props/states). The page is a docs-site Next.js route only — the system itself remains pure styling, no React, no JavaScript components shipped from css-is-awesome. Modeled structurally on the Prism sandbox at `K:/Repo/ui-ux-builder/sandboxes/prism-theme/index.html` (sticky top-bar / left sidebar nav / scroll-spied content), it covers the same component sections — Foundations (tokens grid), Buttons, Badges, Inputs, Checkboxes/Radios/Switches, Alerts, Cards, Tables, Tabs, Avatars, Progress + Skeleton, Popover/Dialog — re-expressed in cia contract slots (`--paper`, `--ink`, `--ai`, etc.) instead of Prism's local tokens. Theme-swappable through the standard `data-theme` attribute, so a reader can toggle Prism Light, Prism Dark, Sketchbook, Press, etc. while reading. A future cross-link to Gremlin UI's React equivalent for each component lands in a follow-up release once Gremlin UI ships its first version — not in v1, no "coming soon" placeholders.

#### User Stories

**US-4.30.1** — As a docs-site dev / system author, I want a `/components` route to exist with the standard site chrome and a left-side section nav, so that there is a single home for copy-paste HTML reference content separate from `/docs` (API) and `/showcase` (full pages).

**Acceptance criteria:**
- [ ] Route renders at the chosen slug (resolves the `/components` vs `/patterns` vs `/reference` open question) and is linked from the top nav.
- [ ] Page has a sticky section-nav sidebar (scroll-spied) listing every component section, modeled on the Prism sandbox layout.
- [ ] The standard theme picker is wired in; switching themes re-skins every example through `data-theme` with no layout shift or hydration warning.
- [ ] Page is deployed on the canonical site host and reachable from the production URL.
- [ ] Content is authoritative — reflects current shipped mixins/utilities, not aspiration.

**Priority:** P0
**Effort:** 5
**Role:** docs-site dev

**US-4.30.2** — As a Tier 1 consumer / new user with no SCSS knowledge, I want to land on `/components`, find the component I need, and copy a snippet of HTML that renders correctly with cia loaded, so that I can ship a button or card without learning the mixin layer.

**Acceptance criteria:**
- [ ] Every example shows a complete, runnable HTML fragment using only `cia-*` utility classes (no `@include`, no SCSS).
- [ ] Pasting the snippet into a page that loads cia core renders the example identically to the live preview shown on the docs page.
- [ ] Each section has a one-line "what this is for" lede before the examples.
- [ ] No example assumes a build step; the Tier 1 form runs against the CDN drop-in.

**Priority:** P0
**Effort:** 1
**Role:** Tier 1 consumer

**US-4.30.3** — As a Tier 2 consumer with a Sass build, I want each example to show BOTH the Tier 1 utility-class form AND the equivalent Tier 2 mixin form side by side, so that I can pick the authoring path that fits my project without hunting through `/docs` separately.

**Acceptance criteria:**
- [ ] Every example renders two labeled tabs (or side-by-side panes): "Utilities (Tier 1)" and "Mixins (Tier 2)".
- [ ] The two forms produce visually identical output, verified by an eyeball check on the live preview when each tab is selected.
- [ ] Each tab has its own "Copy" button targeting only that tab's code.
- [ ] When a component has no Tier 1 utility-class equivalent, the page states that explicitly instead of faking one.

**Priority:** P0
**Effort:** 3
**Role:** Tier 2 consumer

**US-4.30.4** — As a docs-site dev, I want every component shipped under `scss/components/` (buttons, forms, feedback, overlay, navigation, data) to have at least one example on the page, so that the page is a complete reference instead of a curated subset.

**Acceptance criteria:**
- [ ] Page covers, at minimum: Foundations (tokens grid), Buttons (variants / sizes / icons), Badges, Inputs (text / search / disabled / error), Checkboxes / Radios / Switches, Alerts (info / success / warning / danger), Cards (basic / with header-footer / with media), Tables (basic / striped / sortable header chrome), Tabs (segmented / underline nav), Avatars (sizes / fallback / group), Progress + Skeleton, Popover / Dialog.
- [ ] A coverage check (script or checklist) lists every directory under `scss/components/` and confirms each has at least one example on the page.
- [ ] Adding a new component family in `scss/components/` is followed by a `/components` update issue (linked from this feature in the backlog).
- [ ] Content is authoritative — reflects current shipped components, not aspiration.

**Priority:** P0
**Effort:** 7
**Role:** docs-site dev

**US-4.30.5** — As a consumer scanning the page, I want every example to carry consistent metadata — mixin name, Tier 1 utility-class equivalents, and the variant/state list — so that I can map each demo back to the shipping API in one glance.

**Acceptance criteria:**
- [ ] Every example block renders a metadata strip with: `mixin:` name, `utilities:` comma-separated `cia-*` classes (or "—" if none), and `variants:` short list (e.g. "primary, secondary, ghost, danger").
- [ ] Metadata is sourced from a single config or generated artifact — not free-typed strings drifting from reality.
- [ ] Metadata strip layout is identical across all sections so the eye can lock onto it.
- [ ] Hovering or clicking a mixin name links to its entry on the formal `/docs` mixin reference (Feature 4.4).

**Priority:** P0
**Effort:** 3
**Role:** consumer

**US-4.30.6** — As any consumer, I want each example to have a one-click "Copy HTML" button that grabs only the markup (not the surrounding chrome, not the metadata, not the preview wrapper), so that what lands in my clipboard is exactly what I paste into my project.

**Acceptance criteria:**
- [ ] Every code block has a "Copy HTML" affordance reachable by mouse and keyboard.
- [ ] The copied payload is the example markup verbatim — no example-card wrapper divs, no preview-only attributes, no docs-site framing.
- [ ] Copy succeeds across modern Chromium / Firefox / Safari and falls back gracefully when the Clipboard API is unavailable.
- [ ] A short toast or visual confirmation acknowledges the copy without breaking layout.

**Priority:** P0
**Effort:** 1
**Role:** consumer

**US-4.30.7** — As a consumer who also uses (or evaluates) Gremlin UI, I want each component example on `/components` to link to the matching Gremlin UI React component, so that I can move from "here is the markup" to "here is the React import" without a second search. *(Deferred: ships in a follow-up release after Gremlin UI publishes its first version. No "coming soon" placeholders in v1.)*

**Acceptance criteria:**
- [ ] Once Gremlin UI publishes its first release, every example carries a "Gremlin UI →" link pointing at the matching React component (e.g. `@gremlin/ui/Button`).
- [ ] Links are added by PR after Gremlin UI v0.1+ ships; until then, no badge, link, or placeholder appears on the page.
- [ ] Cross-link metadata is sourced from the same config that drives mixin/utility metadata (US-4.30.5) so it stays in sync.
- [ ] Content is authoritative — reflects current Gremlin UI exports, not aspiration.

**Priority:** P2
**Effort:** 1
**Role:** consumer

**US-4.30.8** — As an accessibility reviewer, I want every example on `/components` to be keyboard-navigable, focus-ring visible, and screen-reader-friendly out of the box, so that the page models accessible defaults rather than visual-only chrome.

**Acceptance criteria:**
- [ ] Every interactive example (buttons, inputs, choices, tabs, popover, dialog) is reachable and operable by keyboard alone.
- [ ] Focus rings are visible on every interactive element across every shipped theme.
- [ ] Examples use semantic HTML (`<button>`, `<label>`, `<input>`, `<table>`, `<nav>`, etc.) and ARIA only where semantics fall short.
- [ ] An automated `axe` (or equivalent) lint runs on the route in CI and reports zero serious/critical violations.
- [ ] Lighthouse a11y score ≥95 on the route.

**Priority:** P0
**Effort:** 3
**Role:** accessibility reviewer

#### Open questions
- **Route name** — `/components` vs `/patterns` vs `/reference`. Recommend `/components` as the most discoverable; "patterns" reads as compound layouts (already covered by `/showcase`) and "reference" overlaps with `/docs`.
- **Ship `examples/` folder in the npm package?** A parallel directory of standalone HTML files for AI agents and offline use. Recommend **no for v0.7**; revisit once the docs page is stable and there is real demand from MCP / AI-assistant integrations (Epic 6).
- **Gremlin UI cross-link timing** — confirmed deferred. Badges and links go live with Gremlin UI's first release; v1 of `/components` ships with no Gremlin UI references at all (no placeholders, no "coming soon").

---

## Dependencies
- Blocked by: Epic 1 (Library Foundations — token contract and mixin API must be stable before they can be documented); Epic 2 (Themes & Icons — theme and icon authoring mechanics must be locked before their guides can be written); Epic 3 (React Component Library — component API must be locked before migration and recipes document component usage).
- Blocks: real 1.0 launch — without real docs and a polished site shell, no one learns or adopts the system. Also blocks perceived polish for launch announcements (OG cards, favicons, PWA manifest, themed 404, mobile drawer).

## Priority
P0 (blocker for 1.0): Features 4.1 Getting Started, 4.2 Install, 4.3 Tokens, 4.4 Mixins, 4.5 Utilities, 4.11 Recipes, 4.18 Custom 404, 4.19 Favicon + PWA, 4.20 Copy-to-clipboard, 4.22 Mobile nav, 4.23 Skip-to-content + keyboard polish, 4.25 Launch-mode gate, 4.26 `/compare` refresh, 4.27 `/showcase` page, 4.30 `/components` copy-paste reference.
P1 (wanted for 1.0): Features 4.6 Migration, 4.7 Theme Authoring, 4.8 Icon Authoring, 4.9 Animation, 4.10 Accessibility, 4.13 Search, 4.14 TOC auto-highlight, 4.15 Prev/next, 4.16 Edit on GitHub, 4.17 OpenGraph, 4.21 Shiki syntax highlighting, 4.28 Bootstrap migration wedge.
P2 (post-1.0): Feature 4.12 FAQ expansion, Feature 4.24 Smooth scroll + anchor offset, Feature 4.29 Tailwind→Awesome migration CLI, and any error-boundary / loading-state polish deferred out of the P0/P1 set.
