# Epic 4: Documentation Content

## Summary
Replace the placeholder `/docs` page with real, complete, teach-you-the-system content so a visitor can learn css-is-awesome end-to-end without reading the source. This epic covers the prose, reference material, live previews, and code samples that live inside the docs route — getting started, install, token reference, mixin API, utility class reference, Bootstrap migration, theme/icon authoring guides, animation reference, accessibility notes, recipes, and FAQ. Site chrome (search, TOC, navigation, highlighting) belongs to Epic 5; this epic is the content that fills those pages.

## Goals
- Every public mixin exported from `src/styles/_mixins.scss` has a reference entry with signature, parameters, defaults, example, and rendered output.
- Every `.cia-*` utility class has a row in the utility reference table with purpose, example markup, and rendered preview.
- Token pages render live previews (color swatches, spacing bars, type scale, shadows, radii, motion, blur) that re-skin when the theme picker swaps themes.
- Migration guide covers at least 10 common Bootstrap patterns with side-by-side Bootstrap vs cia markup.
- Time-to-first-working-install under 5 minutes: a new user can land on `/docs`, copy a CDN snippet, paste into an HTML file, and see a themed page render.
- All code samples on the docs site run as shown when copy-pasted, verified by a sample-extraction script.
- Theme authoring guide and icon authoring guide each produce a working artifact end-to-end (a new theme file, a new icon) following only the documented steps.

## Out of scope
- Site chrome: search, sidebar TOC, prev/next, breadcrumbs, 404 — see Epic 5.
- Syntax highlighting engine, copy-to-clipboard, OpenGraph previews — see Epic 5.
- Component playground / Storybook iframes — see Epic 7.
- MCP server, JSON token export, AI prompt templates — see Epic 8.
- Blog posts, changelog prose, release notes — handled in Epic 7 and Epic 9.
- CONTRIBUTING / CoC / SECURITY docs — see Epic 9.
- Visual regression tests on doc pages — see Epic 6.

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
**Effort:** S

**US-4.1.2** — As a new user, I want the Getting Started page to show me how to swap themes with one line, so that I see the "theming is the whole point" value prop before I read anything else.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] A "swap the theme" step shows the exact token file change (or `data-theme` attribute, or link-tag swap) that re-skins the page.
- [ ] Live preview re-skins when the theme picker swaps themes.
- [ ] Every code sample runs as shown if copy-pasted.
- [ ] Content is authoritative — reflects current theme-loading mechanics, not aspiration.

**Priority:** P0
**Effort:** S

**US-4.1.3** — As an AI assistant reading the docs to generate user code, I want the Getting Started page to state the minimum viable setup as a labeled, copy-safe block, so that I can emit it verbatim when a user asks "how do I start".

**Acceptance criteria:**
- [ ] Page has a clearly labeled "Minimum setup" section with a single canonical code block.
- [ ] Block is valid HTML/SCSS with no placeholders like `…` or `YOUR_KEY_HERE`.
- [ ] Adjacent prose states what the block does and what prerequisites it assumes (browser, Node version, nothing).
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P0
**Effort:** S

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
**Effort:** S

**US-4.2.2** — As a Bootstrap migrant with a Sass build already configured, I want an npm + SCSS integration guide, so that I can import tokens and mixins into my existing stylesheet.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Section covers `npm install`, the SCSS `@use` / `@forward` entry point, and the expected load order.
- [ ] Every code sample runs as shown if copy-pasted.
- [ ] Scannable — has headings, code blocks, and at-a-glance takeaways.

**Priority:** P0
**Effort:** M

**US-4.2.3** — As a React developer, I want a framework integration section showing how to pull the stylesheet into a Next.js or Vite project, so that my components pick up theme tokens.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Section includes a `layout.tsx` or `_app.tsx` import snippet and a `data-theme` wiring example.
- [ ] Live previews re-skin when the theme picker swaps themes.
- [ ] Content is authoritative — reflects current React wrapper surface.

**Priority:** P0
**Effort:** M

**US-4.2.4** — As a copy-paster, I want a "download a theme file" option so that I can grab a single `.css` or `.scss` file and drop it into my project without any package manager.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] "Download" section links to a prebuilt theme file per shipped theme.
- [ ] Instructions state exactly where to place the file and how to reference it.
- [ ] Every code sample runs as shown if copy-pasted.

**Priority:** P1
**Effort:** S

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
**Effort:** M

**US-4.3.2** — As a theme author, I want a spacing visualizer showing every step of the numbered scale rendered at scale, so that I can see the rhythm my theme will inherit.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Every spacing step renders as a bar or box at its actual size.
- [ ] Each step is labeled with its numbered token name and computed value.
- [ ] Live previews re-skin when the theme picker swaps themes.
- [ ] Scannable — has headings, code blocks, and at-a-glance takeaways.

**Priority:** P0
**Effort:** M

**US-4.3.3** — As a new user, I want a type scale preview rendering each step of the typography scale with live text, so that I can see how headings and body text relate.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Every type-scale step renders with sample text at its actual size, weight, and line-height.
- [ ] Live previews re-skin when the theme picker swaps themes.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P0
**Effort:** M

**US-4.3.4** — As a copy-paster, I want shadow, radius, motion, and blur galleries, so that I can see every tier side-by-side and pick one.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Shadow, radius, motion (duration + ease), and blur/glow each have a gallery grid.
- [ ] Each tile is labeled with its token name and renders the effect live.
- [ ] Live previews re-skin when the theme picker swaps themes.
- [ ] Every code sample runs as shown if copy-pasted.

**Priority:** P0
**Effort:** M

**US-4.3.5** — As an AI assistant, I want the token page headings to include stable token-name anchors, so that I can deep-link users to a specific token.

**Acceptance criteria:**
- [ ] Every token entry has a stable `#token-name` anchor.
- [ ] Anchors match the exact SCSS/CSS variable name.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P1
**Effort:** S

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
**Effort:** L

**US-4.4.2** — As a new user, I want each mixin entry to include an example call and the compiled CSS output, so that I know what my code will produce.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Every mixin has a "Usage" code block and an "Output" code block.
- [ ] Every code sample runs as shown if copy-pasted.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P0
**Effort:** L

**US-4.4.3** — As an AI assistant, I want mixins grouped into named families with stable anchor IDs, so that I can reference them consistently when generating user code.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Mixins are grouped into primitives, typography, layout, components, feedback, icons.
- [ ] Every mixin and group heading has a stable anchor ID.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P0
**Effort:** M

**US-4.4.4** — As a theme author, I want a "component mixin contract" note on each component mixin, so that I know which tokens it reads and which a theme must define.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Each component mixin lists the tokens it consumes.
- [ ] Content is authoritative — reflects current code, not aspiration.
- [ ] Scannable — has headings, code blocks, and at-a-glance takeaways.

**Priority:** P1
**Effort:** M

---

### Feature 4.5: Utility Class Reference
A searchable table at `/docs/utilities` listing every `.cia-*` class with purpose, example markup, and rendered preview. Grouped by family: spacing, typography, display, position, flex, grid, border/radius, shadow, color, responsive, animation. Site-level search hookup is Epic 5; this epic provides the underlying table and metadata.

#### User Stories

**US-4.5.1** — As a copy-paster, I want a single utility reference page listing every `.cia-*` class with a purpose and example, so that I can use the site as a cheatsheet.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Every `.cia-*` class has a row with class name, purpose, and example markup.
- [ ] Every code sample runs as shown if copy-pasted.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P0
**Effort:** L

**US-4.5.2** — As a new user, I want utility classes grouped by family, so that I can find the spacing utilities without scanning the whole table.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Classes are grouped into spacing, typography, display, position, flex, grid, border/radius, shadow, color, responsive, animation.
- [ ] Each group heading has a stable anchor ID.
- [ ] Scannable — has headings, code blocks, and at-a-glance takeaways.

**Priority:** P0
**Effort:** M

**US-4.5.3** — As a Bootstrap migrant, I want each utility row to render a live preview of the effect, so that I can confirm the class does what its name implies.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Every utility row has a rendered preview cell.
- [ ] Live previews re-skin when the theme picker swaps themes.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P0
**Effort:** M

**US-4.5.4** — As an AI assistant, I want the utility table exposed as a machine-readable data source, so that I can enumerate valid classes without scraping HTML.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] A JSON or similar structured file is linked from the page listing every class with name, family, purpose.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P1
**Effort:** S

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
**Effort:** L

**US-4.6.2** — As a Bootstrap migrant, I want a "conceptual differences" intro explaining the mixin-first, theme-token model vs Bootstrap's utility-and-override model, so that I understand why some patterns don't map 1:1.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Intro section explains tokens, mixins, and theme swapping in three paragraphs or fewer.
- [ ] Scannable — has headings, code blocks, and at-a-glance takeaways.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P1
**Effort:** M

**US-4.6.3** — As a Bootstrap migrant, I want a "gotchas" list — things I'll trip over on day one, so that I don't assume the system behaves like Bootstrap where it doesn't.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Gotchas section covers grid differences, utility naming, form default behavior, modal z-index.
- [ ] Scannable — has headings, code blocks, and at-a-glance takeaways.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P1
**Effort:** M

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
**Effort:** L

**US-4.7.2** — As a theme author, I want guidance on palette selection and font pairing, so that my theme feels coherent rather than a random list of colors.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Section covers contrast targets, tonal step guidance, and recommended font-pair patterns.
- [ ] Live previews re-skin when the theme picker swaps themes.
- [ ] Scannable — has headings, code blocks, and at-a-glance takeaways.

**Priority:** P1
**Effort:** M

**US-4.7.3** — As a theme author, I want instructions for running the theme validator and submitting to the repo, so that I know when my theme is done.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Section covers the validator command, expected pass output, and the PR submission flow.
- [ ] Every code sample runs as shown if copy-pasted.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P1
**Effort:** M

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
**Effort:** S

**US-4.8.2** — As an icon author, I want guidance on size and color control, and on mask vs background, so that I pick the right rendering technique for my use case.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Section compares `svg`, `svg-bg`, and `svg-text` with use cases and trade-offs.
- [ ] Every code sample runs as shown if copy-pasted.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P1
**Effort:** M

**US-4.8.3** — As an icon author, I want guidance on multi-color icons, so that I know the system's limits before I try to use a full-color illustration.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Section states which mixins support multi-color SVGs and which flatten to a single `currentColor`.
- [ ] Scannable — has headings, code blocks, and at-a-glance takeaways.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P1
**Effort:** S

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
**Effort:** M

**US-4.9.2** — As a theme author, I want the animation grid to show the same keyframe across every shipped theme, so that I can feel the difference theme motion tokens make.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Grid has rows per keyframe and columns per theme (or equivalent).
- [ ] Live previews re-skin when the theme picker swaps themes.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P1
**Effort:** M

**US-4.9.3** — As a screen-reader user, I want animations to respect `prefers-reduced-motion`, and I want the animation page to say so, so that I trust the system won't ignore my OS setting.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Page states the reduced-motion behavior of shipped keyframes.
- [ ] Demo tiles stop or simplify when `prefers-reduced-motion: reduce` is set.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P1
**Effort:** S

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
**Effort:** M

**US-4.10.2** — As a screen-reader user, I want a clear "what the system does NOT do" section, so that I can set expectations for sites built on top of it.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Section explicitly states claims the user still owns (heading hierarchy, ARIA labels, keyboard flow, alt text).
- [ ] Content is authoritative — reflects current code, not aspiration.
- [ ] Scannable — has headings, code blocks, and at-a-glance takeaways.

**Priority:** P1
**Effort:** S

**US-4.10.3** — As a Bootstrap migrant, I want a short a11y checklist I can run against my migrated pages, so that I catch regressions introduced by the swap.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Checklist covers focus visibility, color-only signaling, motion reduction, and form labeling.
- [ ] Scannable — has headings, code blocks, and at-a-glance takeaways.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P1
**Effort:** S

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
**Effort:** L

**US-4.11.2** — As a new user, I want each recipe to include short commentary on what's happening, so that I learn the idioms instead of just cargo-culting.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Each recipe has inline or adjacent prose explaining why the markup is shaped the way it is.
- [ ] Scannable — has headings, code blocks, and at-a-glance takeaways.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P0
**Effort:** M

**US-4.11.3** — As an AI assistant, I want recipe entries tagged with the primitives they compose, so that I can suggest a recipe when a user describes a need in plain English.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Each recipe lists the mixins and utility classes it uses.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P1
**Effort:** S

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
**Effort:** S

**US-4.12.2** — As a new user, I want practical how-do-I answers ("override a token", "prevent FOUC", "use with a CSS-in-JS library"), so that I can unblock myself on day-one friction.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Each practical question has a working code snippet alongside the answer.
- [ ] Every code sample runs as shown if copy-pasted.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P2
**Effort:** M

**US-4.12.3** — As an AI assistant, I want FAQ entries with stable anchor IDs per question, so that I can deep-link users to a specific answer.

**Acceptance criteria:**
- [ ] Page loads and is linked from the `/docs` nav or sidebar.
- [ ] Every question has a stable anchor ID matching a slug of the question.
- [ ] Content is authoritative — reflects current code, not aspiration.

**Priority:** P2
**Effort:** S

---

## Dependencies
- Blocked by: Epic 1 (Library Foundations — token contract and mixin API must be stable before they can be documented); Epic 2 (Themes & Icons — theme and icon authoring mechanics must be locked before their guides can be written); Epic 3 (React Component Library — component API must be locked before migration and recipes document component usage).
- Blocks: real 1.0 launch — without real docs, no one learns the system. Blocks Epic 5 (Site UX) from being useful — search, TOC, and highlighting have nothing to act on until this content exists.

## Priority
P0 (blocker for 1.0): Features 4.1 Getting Started, 4.2 Install, 4.3 Tokens, 4.4 Mixins, 4.5 Utilities, 4.11 Recipes.
P1 (wanted for 1.0): Features 4.6 Migration, 4.7 Theme Authoring, 4.8 Icon Authoring, 4.9 Animation, 4.10 Accessibility.
P2 (post-1.0): Feature 4.12 FAQ expansion.
