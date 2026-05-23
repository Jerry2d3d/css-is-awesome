# cia Blog — Architecture & Backlog

> **Status:** PLAN, not shipped. Source of truth for the `/blog` rebuild that retires the seven `href="#"` fiction posts currently at `src/app/blog/page.tsx`.
> **Audience for this file:** Jerry + future contributors writing or maintaining the blog.
> **Voice anchor:** the blog is the long-form companion to the docs. Docs say WHAT cia does. Blog says WHY it does it that way — honest decision-led storytelling, no marketing fluff.

---

## v2 update — 2026-05-23

v2 expansion of the original (~3,950 words). v1 decisions all carry forward. v2 adds:

- **Post backlog 16 → 26** — adds 2017 origin slot, six pivot-narrative posts, four epic-spotlight posts, one landscape post, one research highlight.
- **Required `citations` frontmatter field** on every post — external links + internal memory/`.agent/` files. v1 posts backfilled.
- **New tag `origin`** for history/pivot DNA (15 → 16 tags).
- **"How we cite" subsection** in Voice + tone — explicit citation policy.
- **/blog migration reaffirmed** — kill all placeholders; v1.0 catalog can render zero posts with a "first posts land with v1.0" hero. No "coming soon" stubs.
- **New section: Open research threads** — 7 data-gated future posts.
- **Sequence updated** — origin + pivot posts slotted into first-7.

Categories, post format, URL convention, voice, engineering plan unchanged. Two engineering tweaks inline: `citations` required in type-safe frontmatter; `<Citations>` block rendered at post foot.

---

## 1. Information architecture

### Categories (5)

Locked at five. Adding a sixth requires real volume to justify.

| Category | What lives here | First-month volume |
|---|---|---|
| **Decisions** | "We tried X, here's why we moved to Y." Architectural pivots, killed features, principle calls. Most of the v1.0 launch arc lives here. | High (7-9 posts) |
| **Architecture** | Deep dives into *how* a shipped piece works. Mixin-first internals, light-dark() pairing, MCP server design, contract validator. | Medium (4-5 posts) |
| **Recipes** | Long-form tutorials. One pattern, end-to-end, framework-agnostic. Paired with `/docs/recipes/<slug>` pages. | Medium (3-4 posts) |
| **Release notes** | Narrative companion to CHANGELOG entries that deserve more than a bullet (v0.8 mixin-first reframe, v1.0 launch, v1.1 install wizard). | Low (1 per minor) |
| **Field notes** | Behind-the-scenes: panel reviews, Gemini critiques, user-power-principle kills, origin story, landscape scans. Process diary. | Low-medium (3-4 in v1.0 window) |

### Tag system (16 tags)

Tags compose freely; aim for 2-4 per post.

- **By principle:** `mixin-first`, `user-power`, `zero-js`, `a11y`
- **By feature surface:** `themes`, `recipes`, `mcp`, `tokens`, `mixins`, `components`, `light-dark`
- **By audience:** `for-ai-devs`, `for-migrators`, `for-theme-authors`
- **By lifecycle:** `v1.0`, `pre-v1.0`, `post-v1.0`, `breaking`
- **NEW — by narrative type:** `origin` (history, backstory, pivot retrospectives)

### Post format conventions

**Frontmatter spec (every post):**
```yaml
---
title: "Why cia killed @layer and uses :where() instead"
slug: why-cia-killed-at-layer
category: decisions
tags: [user-power, mixin-first, zero-js, pre-v1.0]
audience: [consumer, theme-author]
length: medium      # short ~600 / medium ~1500 / long ~3000
priority: P0
publishDate: 2026-06-15
updatedDate: 2026-06-15
author: jerry
excerpt: "All four panel agents recommended @layer twice. Then one question flipped the vote. Here's what changed."
canonical: https://cssisawesome.dev/blog/why-cia-killed-at-layer
citations:                          # NEW in v2 — required when post makes factual claims
  external:
    - "https://mui.com/material-ui/customization/css-layers/"
  internal:
    - "memory/feedback_no_at_layer.md"
    - ".agent/decisions/decided/04-at-layer-decision.md"
---
```

**Heading hierarchy:** H1 is the post title (rendered from frontmatter, not in body). Body starts at H2. Max depth H4. No H5/H6.

**Code-block standards:**
- Triple-backtick with explicit language (`scss`, `html`, `css`, `bash`, `tsx`, never bare).
- Show the *consumer* call surface, not cia internals, unless the post is an Architecture deep-dive.
- Diff blocks (`diff` language) for migration / before-after.
- Every code block has a one-line caption above explaining what file/context it belongs to.

**Length targets:**
- **Short (~600 words)** — release notes, field notes, single-decision posts.
- **Medium (~1500 words)** — most Decisions and Architecture posts.
- **Long (~3000 words)** — Recipes (with full walkthrough), meta-principle posts, the origin story, the landscape scan.

### URL convention

`/blog/<slug>` — flat. No category in the URL.

Tag and category navigation lives on `/blog/tag/<tag>` and `/blog/category/<category>` index pages. Decoupling URLs from categories means we can recategorize without breaking links. Slugs are kebab-case, no dates.

### Per-post required metadata

Title, slug, category, tags (≥2), audience (≥1), length, priority, publishDate, updatedDate, author, excerpt (≤180 chars), **citations** (object with `external: string[]` and/or `internal: string[]`; either may be empty for posts with no factual claims but the key must exist). Optional: `canonical` (for cross-posts), `coverImage`, `relatedPosts: [slug, slug]`.

---

## 2. Initial post backlog (26 posts)

> **v2 expansion:** v1 listed 16 posts. v2 adds 10 — one origin story, six pivot narratives, three epic spotlights (where they weren't already covered), one landscape post, and one external-research highlight. v1 posts kept their numbering; v2 additions interleave (17-26).

### P0 — Ship with v1.0 launch (8 posts)

#### 1. "Why cia is a recipes book, not a component library"
- **Category:** Decisions · **Audience:** consumer, migrator, AI dev · **Length:** medium · **Priority:** P0
- **Summary:** The 2026-05-23 architecture lock — why cia ships tokens + mixins + recipes instead of a React kit. The shadcn-graduate problem. "I don't want to keep up with a component library." — Jerry.
- **Outline:**
  - The original plan (Gremlin UI) and why it died ([memory/project_v1_architecture_recipes.md](../memory/project_v1_architecture_recipes.md))
  - Gemini's "state-machine vendor death spiral" critique ([.agent/work/external/gemini-layering-strategic-2026-05-23.md](../.agent/work/external/gemini-layering-strategic-2026-05-23.md))
  - What "recipe" means in cia (markdown + MCP-readable + framework-agnostic), versus the [shadcn ejection model](https://ui.shadcn.com/docs/changelog) where you own copy-pasted source
  - What you get instead: the same component, your stack, no migration treadmill
  - What this means for boiler-project-ai (showcase, not product)
- **Publish:** launch day · **Cross-link:** `/docs/recipes`, `/docs/composition`, README hero
- **Citations:**
  - external: [ui.shadcn.com/docs/changelog](https://ui.shadcn.com/docs/changelog) · [headlessui.com](https://headlessui.com/)
  - internal: `memory/project_v1_architecture_recipes.md` · `.agent/work/external/gemini-layering-strategic-2026-05-23.md` · `.agent/work/external/gemini-add-on-architecture-2026-05-23.md`

#### 2. "Why cia killed @layer and uses :where() instead"
- **Category:** Decisions · **Audience:** consumer, theme-author · **Length:** medium · **Priority:** P0
- **Summary:** Four expert agents recommended `@layer` unanimously, twice. Jerry asked "who is this for?" and the vote flipped. Here's what changed.
- **Outline:**
  - The pitch for `@layer` (panel R1+R2 consensus) ([memory/feedback_no_at_layer.md](../memory/feedback_no_at_layer.md))
  - The "who is this for?" question that broke it (2026-05-16) ([memory/feedback_user_power_principle.md](../memory/feedback_user_power_principle.md))
  - MUI shipping opt-in `@layer` *defensively* against Tailwind v4 — the smoking gun ([mui.com/material-ui/customization/css-layers](https://mui.com/material-ui/customization/css-layers/), [GH #44700](https://github.com/mui/material-ui/issues/44700))
  - 12-system survey: layered-by-default is the minority position in 2026 ([.agent/work/research/layering-scan-2026-05-23.md](../.agent/work/research/layering-scan-2026-05-23.md))
  - The `:where()` answer for the bare-tag recipe — [0,0,0 specificity per MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/:where), consumers always win
  - Composition guarantee unlocked: "cia composes with anything"
- **Publish:** launch day · **Cross-link:** `/docs/composition`, post #4 (user-power principle)
- **Citations:**
  - external: [mui.com/material-ui/customization/css-layers](https://mui.com/material-ui/customization/css-layers/) · [GitHub mui/material-ui#44700](https://github.com/mui/material-ui/issues/44700) · [developer.mozilla.org/Web/CSS/:where](https://developer.mozilla.org/en-US/docs/Web/CSS/:where) · [css.oddbird.net/layers/explainer](https://css.oddbird.net/layers/explainer/) · [miriamsuzanne.com — Eleventy Buckets & Cascade Layers](https://www.miriamsuzanne.com/2024/07/06/buckets-layers/)
  - internal: `memory/feedback_no_at_layer.md` · `memory/feedback_user_power_principle.md` · `.agent/work/research/layering-scan-2026-05-23.md` · `.agent/decisions/decided/04-at-layer-decision.md`

#### 3. "Zero JS in the npm package, period"
- **Category:** Decisions · **Audience:** consumer, migrator · **Length:** short · **Priority:** P0
- **Summary:** The hard rule. What it costs us, what it unlocks for you. SSR, CSP-strict, no-JS environments install cia cleanly. JS-augmented features ship as separate add-on packages.
- **Outline:**
  - The 2026-05-20 incident: `dist/copy-button.mjs` shipped, Jerry caught it, moved to `public/` ([memory/feedback_no_js_in_package.md](../memory/feedback_no_js_in_package.md))
  - The rule: `find node_modules/css-is-awesome -name "*.js"` returns nothing
  - What goes in `public/` (website-only), what goes in `addons/` (separate publish)
  - The Pico precedent — [Pico CSS ships "without dependencies, package managers, external files, or JavaScript"](https://picocss.com/) — proves CSS-only is viable
  - Why optionality wasn't enough — auditors run grep, not reason about intent
  - The marketing line this preserves
- **Publish:** launch day · **Cross-link:** README "Three ways to use it", `/docs/install`
- **Citations:**
  - external: [picocss.com](https://picocss.com/) · [daisyui.com](https://daisyui.com/)
  - internal: `memory/feedback_no_js_in_package.md`

#### 4. "The user-power principle — the question that decides every cia argument"
- **Category:** Decisions · **Audience:** consumer, contributor, theme-author · **Length:** medium · **Priority:** P0
- **Summary:** "Who is this for?" Jerry's framing test. If a feature serves system-author convenience and the user-at-keyboard gains nothing, flip the default. The principle that killed @layer, two-Sass-partial themes, and the versioned migrator.
- **Outline:**
  - 2026-05-16 verbatim: "you're adding a layer not for them — for the system" ([memory/feedback_user_power_principle.md](../memory/feedback_user_power_principle.md))
  - The 15-second pitch test: can you write "this gives YOU more power"?
  - Three features it killed: `@layer` ([memory/feedback_no_at_layer.md](../memory/feedback_no_at_layer.md)), C2 theme partials ([memory/project_theme_architecture_locked.md](../memory/project_theme_architecture_locked.md)), the Gremlin UI plan ([memory/project_v1_architecture_recipes.md](../memory/project_v1_architecture_recipes.md))
  - What survives the test (mixin-first, light-dark(), opt-in utilities)
  - Why "industry-standard" / "best practice" can be the wrong answer
- **Publish:** launch +3 days · **Cross-link:** posts #1, #2, #5
- **Citations:**
  - external: none — this is an internal-principle post
  - internal: `memory/feedback_user_power_principle.md` · `memory/feedback_no_at_layer.md` · `memory/project_theme_architecture_locked.md` · `memory/project_v1_architecture_recipes.md`

#### 5. "Mixin-first beats classes — your selectors, our system"
- **Category:** Architecture · **Audience:** consumer, migrator · **Length:** medium · **Priority:** P0
- **Summary:** cia is the mixin. The class, the tag, the attribute — that's yours. Why this beats both BEM and utility-first for a 2026 design system.
- **Outline:**
  - The hello-world: `.checkout-cta { @include cia.btn(primary); }` vs `<div class="cia-btn cia-btn--primary">` ([memory/feedback_mixin_first_principle.md](../memory/feedback_mixin_first_principle.md))
  - Source LOC ≠ shipped bytes — mixins don't emit until called
  - The same mixin on a class, a bare tag, or an attribute (all three valid)
  - Why this isn't BEM (no `__element--modifier`; the consumer names the selector) ([memory/feedback_no_bem.md](../memory/feedback_no_bem.md))
  - Why this isn't Tailwind ([no class-soup in markup, contra Tailwind v4](https://tailwindcss.com/blog/tailwindcss-v4))
  - The marketing line: "Bring your own selectors. We bring the design system."
- **Publish:** launch day · **Cross-link:** README hero, `/docs/mixins`, post #7 (no BEM)
- **Citations:**
  - external: [tailwindcss.com/blog/tailwindcss-v4](https://tailwindcss.com/blog/tailwindcss-v4)
  - internal: `memory/feedback_mixin_first_principle.md` · `memory/feedback_no_bem.md` · `memory/project_v1_strategic_decisions_locked.md`

#### 17. "Where css-is-awesome came from (2017 → 2026)" — origin story  [NEW IN v2]
- **Category:** Field notes · **Audience:** all · **Length:** long · **Priority:** P0 · **Tags:** `origin`, `pre-v1.0`, `v1.0`
- **Summary:** The nine-year arc from a 2017 personal experiment to the 2026 recipes-book reframe.
- **Outline:**
  - [AWAITING JERRY'S MATERIAL] — 2017 starting point, original problem, what Bootstrap and Tailwind couldn't do for him then
  - [AWAITING JERRY'S MATERIAL] — false starts, project names, what was scrapped, what survived
  - [AWAITING JERRY'S MATERIAL] — the "design system" moment when this stopped being a stylesheet and became a system
  - Mixin-first arrival (2026-05-19) ([memory/feedback_mixin_first_principle.md](../memory/feedback_mixin_first_principle.md))
  - Recipes-book arrival (2026-05-23) ([memory/project_v1_architecture_recipes.md](../memory/project_v1_architecture_recipes.md))
  - What 2017 Jerry would say to 2026 Jerry
- **Publish:** launch day · **Cross-link:** post #1, #12, README about-section
- **Citations:** external: [AWAITING JERRY'S MATERIAL] · internal: `memory/feedback_mixin_first_principle.md` · `memory/project_v1_architecture_recipes.md` · `memory/user_profile.md`
- **Body status:** `[AWAITING JERRY'S MATERIAL]` — do not draft body until Jerry supplies 2017-2025 source material. Frontmatter + outline may ship; body cannot.

#### 18. "Pivot: we said no to Storybook (2026-05-21)"  [NEW IN v2 — companion to v1 #10]
- **Category:** Decisions · **Audience:** consumer, contributor · **Length:** short · **Priority:** P0 · **Tags:** `origin`, `mcp`, `zero-js`, `pre-v1.0`
- **Summary:** Tried it on paper. Docs site + MCP server already cover both human and AI audiences. Duplicate-build cost didn't earn its keep.
- **Outline:**
  - The question: "should we use the MCP server for Storybook?" ([memory/project_no_storybook.md](../memory/project_no_storybook.md))
  - Original: ship Storybook so contributors have a familiar entrypoint
  - Trigger: mixin-first means there's no "component" to story — `@include cia.btn(primary)` on any selector
  - Flip: docs site + MCP server cover the same audience without the second build
  - Saved: ~40 hours of pipeline work + Storybook major-version churn
- **Publish:** launch +3 weeks (P0 in v2 because it pairs with post #9)
- **Citations:** external: [bootstrap docs](https://getbootstrap.com/docs/) · [tailwindcss.com](https://tailwindcss.com/) — both single docs sites, no Storybook · internal: `memory/project_no_storybook.md`

### P1 — First month (10 posts)

#### 6. "One theme = one file — what `light-dark()` collapsed"
- **Category:** Architecture · **Audience:** theme-author, consumer · **Length:** medium · **Priority:** P1
- **Summary:** v0.8 collapsed 14 theme files into 9. Locked 2026-05-18 after the panel voted 3-1 for two-Sass-partials-per-theme and Jerry overrode them.
- **Outline:**
  - The 14-file structure (and why it was a drift trap) ([memory/project_theme_architecture_locked.md](../memory/project_theme_architecture_locked.md))
  - The three shapes inside one file (light-only / both via [`light-dark()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark) / both with non-color asymmetry)
  - The Glass exception (Pattern C, nested `@media` for blur asymmetry)
  - `<link media>` for paired-theme switching — pure HTML, no Sass, no JS
  - Why this beat the panel's editor-codegen-optimized C2 plan
  - The browser receipt: [`light-dark()` is Baseline Newly available since May 13, 2024](https://web-platform-dx.github.io/web-features-explorer/features/light-dark/)
- **Publish:** launch +1 week · **Cross-link:** `/docs/themes`, `/themes` editor, post #15
- **Citations:**
  - external: [MDN — light-dark()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark) · [web.dev — light-dark](https://web.dev/articles/light-dark) · [web-platform-dx Baseline status](https://web-platform-dx.github.io/web-features-explorer/features/light-dark/)
  - internal: `memory/project_theme_architecture_locked.md` · `memory/feedback_user_power_principle.md`

#### 7. "Why no BEM in a 2026 design system"
- **Category:** Decisions · **Audience:** consumer, migrator · **Length:** short · **Priority:** P1
- **Summary:** BEM solved 2014's selector ambiguity problem with naming conventions. cia solves it with mixin-first authoring — the consumer picks the selector, cia has no opinion.
- **Outline:**
  - What BEM does and why it existed
  - What cia ships instead: `.cia-accordion`, `.cia-tab-list` (single-class or composite kebab), no `__` or `--` ([memory/feedback_no_bem.md](../memory/feedback_no_bem.md))
  - The bigger answer: consumers' classes are *theirs*, cia doesn't dictate `.checkout-cta__icon`
  - Modern auto-scoping (CSS Modules, Vue scoped, Svelte) already neutralizes BEM's namespace problem
  - The forbid list — what we grep for before every commit
- **Publish:** launch +1 week · **Cross-link:** post #5
- **Citations:**
  - external: [Time to Stop Using BEM — Fotis Adamakis (Medium)](https://medium.com/) [search-only — author's most-cited piece]
  - internal: `memory/feedback_no_bem.md` · `memory/feedback_mixin_first_principle.md`

#### 8. "A11y fails by default — the validator policy that locks in"
- **Category:** Architecture · **Audience:** theme-author, consumer · **Length:** medium · **Priority:** P1
- **Summary:** Since v0.7 (2026-05-11) the contrast validator fails the build on any WCAG 2.2 AA fail. No flag needed. `--allow-a11y-fail` opts out. `--border-default` is decorative and reports info-only.
- **Outline:**
  - The triage that made this safe to flip (3 buckets, −104 fails) ([memory/project_a11y_policy.md](../memory/project_a11y_policy.md))
  - The decorative classification (`--border-default`, [WCAG 2.2 SC 1.4.11](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html))
  - The 17 audited token pairs per theme
  - How to author a new theme through the gate
  - Why this beats "we recommend AA" — most systems ship FAILs
- **Publish:** launch +2 weeks · **Cross-link:** `/docs/themes/contracts`, `CONTRIBUTING-THEMES.md`
- **Citations:**
  - external: [W3C — Understanding SC 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html)
  - internal: `memory/project_a11y_policy.md` · `memory/project_distinctive_features.md`

#### 9. "The MCP server — why a design system needs one in 2026"
- **Category:** Architecture · **Audience:** AI dev, consumer · **Length:** medium · **Priority:** P1
- **Summary:** Shipped 2026-05-22. 27 tools across 8 resource families. Any MCP-aware client (Claude Code, Cursor, Aider, Gemini) can read tokens, mixins, recipes, themes, validate without grep-walking the source.
- **Outline:**
  - The problem: AI agents reading docs by grep is lossy
  - What MCP is — [Anthropic's open spec for connecting LLMs to data and tools](https://www.anthropic.com/news/model-context-protocol) ([latest spec on modelcontextprotocol.io](https://modelcontextprotocol.io/))
  - What cia's server exposes (themes / mixins / functions / tokens / animations / components / recipes / docs + assemble_prompt)
  - The architecture decision: separate npm package, not core (zero JS rule)
  - Worked example: an agent generates a recipe-based dialog from one MCP call
  - Why this is the AI-second pitch, not AI-first
- **Publish:** launch +2 weeks · **Cross-link:** `/docs/mcp`, `@cia/mcp-server` README, post #1
- **Citations:**
  - external: [anthropic.com/news/model-context-protocol](https://www.anthropic.com/news/model-context-protocol) · [modelcontextprotocol.io](https://modelcontextprotocol.io/) · [github.com/modelcontextprotocol/modelcontextprotocol](https://github.com/modelcontextprotocol/modelcontextprotocol)
  - internal: `memory/project_v1_strategic_decisions_locked.md` (item 15)

#### 19. "EPIC spotlight: the recipes book"  [NEW IN v2 — v1.0 epic 01]
- **Category:** Field notes · **Audience:** consumer, AI dev · **Length:** medium · **Priority:** P1 · **Tags:** `recipes`, `v1.0`, `mcp`, `for-ai-devs`, `origin`
- **Summary:** Why v1.0 chose 5 specific recipes (dialog, combobox, datepicker, data-table, command-palette) and deferred 15 others.
- **Outline:**
  - The shadcn-graduate gap ([memory/project_v1_architecture_recipes.md](../memory/project_v1_architecture_recipes.md))
  - Why these 5? Dialog uses [native `<dialog>` + `.showModal()` for built-in focus trap](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog); combobox / datepicker / data-table / command-palette cover the highest-value patterns missing from raw HTML ([EPIC-01](./epics/v1-0/EPIC-01-recipes-book.md))
  - The 4-framework rule (React + Vue + Svelte + vanilla in every recipe)
  - MCP exposure: `list_recipes`, `get_recipe`, `assemble_prompt({intent:"recipe:dialog"})`
  - Why 15 more recipes are explicitly deferred ([v1.1 EPIC-01](./epics/v1-1/README.md))
- **Publish:** launch +1 week
- **Citations:** external: [MDN dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog) · [web.dev — Popover API Baseline](https://web.dev/blog/popover-baseline) · [css-tricks — There is No Need to Trap Focus on a Dialog Element](https://css-tricks.com/there-is-no-need-to-trap-focus-on-a-dialog-element/) · internal: `roadmap/epics/v1-0/EPIC-01-recipes-book.md` · `memory/project_v1_architecture_recipes.md`

#### 20. "EPIC spotlight: theme editor polish"  [NEW IN v2 — v1.0 epic 02]
- **Category:** Field notes · **Audience:** theme-author, consumer · **Length:** short · **Priority:** P1 · **Tags:** `themes`, `for-theme-authors`, `v1.0`, `a11y`
- **Summary:** Editor ships today, persists to localStorage. v1.0 adds download, URL-share, live contrast validation.
- **Outline:**
  - State today (~1,200 LOC, 123 tokens) ([memory/project_theme_editor_state.md](../memory/project_theme_editor_state.md))
  - Download gap — without `mytheme.scss` / `mytheme.css` the editor is a demo ([EPIC-02](./epics/v1-0/EPIC-02-theme-editor-polish.md))
  - URL-as-share-artifact via [CompressionStream](https://developer.mozilla.org/en-US/docs/Web/API/CompressionStream) where available
  - Live validator — every color edit re-checks all 17 pairs ([W3C 1.4.11](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html))
  - Why this beats Tailwind Play (utility-soup) and Material Theme Builder (colors-only)
- **Publish:** launch +2 weeks
- **Citations:** external: [MDN CompressionStream](https://developer.mozilla.org/en-US/docs/Web/API/CompressionStream) · [W3C 1.4.11](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html) · internal: `roadmap/epics/v1-0/EPIC-02-theme-editor-polish.md` · `memory/project_theme_editor_state.md`

#### 21. "EPIC spotlight: `npx cia migrate`"  [NEW IN v2 — v1.0 epic 03]
- **Category:** Field notes · **Audience:** migrator, AI dev · **Length:** medium · **Priority:** P1 · **Tags:** `for-migrators`, `tokens`, `v1.0`
- **Summary:** "Your brand work comes with you" — convert a Tailwind config or Bootstrap variables file into a cia theme.
- **Outline:**
  - Migration cost is the #1 reason teams don't try a new system ([EPIC-03](./epics/v1-0/EPIC-03-migration-on-ramp.md))
  - Tailwind v3 vs v4 — [v4 moved config from JS to CSS `@theme`](https://tailwindcss.com/blog/tailwindcss-v4); the migrator detects and branches
  - The confidence report (HIGH / MEDIUM / LOW / UNMAPPED)
  - Why CLI in `bin/` doesn't violate "zero JS in npm package" ([memory/feedback_no_js_in_package.md](../memory/feedback_no_js_in_package.md))
  - Marketing line earned: *"Migrating from Tailwind? Talk to your AI."* ([memory/project_v1_strategic_decisions_locked.md](../memory/project_v1_strategic_decisions_locked.md))
- **Publish:** launch +3 weeks
- **Citations:** external: [tailwindcss.com/blog/tailwindcss-v4](https://tailwindcss.com/blog/tailwindcss-v4) · [tailwindcss.com/docs/theme](https://tailwindcss.com/docs/theme) · internal: `roadmap/epics/v1-0/EPIC-03-migration-on-ramp.md` · `memory/feedback_no_js_in_package.md` · `memory/project_v1_strategic_decisions_locked.md`

#### 22. "EPIC spotlight: the playground"  [NEW IN v2 — v1.0 epic 04]
- **Category:** Field notes · **Audience:** consumer, AI dev · **Length:** short · **Priority:** P1 · **Tags:** `mixins`, `themes`, `v1.0`, `recipes`
- **Summary:** dart-sass in the browser, all 9 themes selectable, URL-shareable demos. cia's answer to Tailwind Play.
- **Outline:**
  - Why playground beats README screenshots ([EPIC-04](./epics/v1-0/EPIC-04-playground.md))
  - Browser-side dart-sass (the [`sass` npm package ships browser-compatible builds since 1.50](https://www.npmjs.com/package/sass))
  - Monaco editor + theme picker + URL-share
  - Every `/docs/recipes/<slug>` page links "Try in playground →"
  - Why v1.5 ships the VS Code extension instead of v1.0 ([v1.5 README](./epics/v1-5/README.md))
- **Publish:** launch +4 weeks
- **Citations:** external: [sass npm](https://www.npmjs.com/package/sass) · [Tailwind Play](https://play.tailwindcss.com/) · internal: `roadmap/epics/v1-0/EPIC-04-playground.md` · `roadmap/epics/v1-5/README.md`

#### 23. "Watching the giants — Tailwind, Radix, shadcn, MUI in 2026"  [NEW IN v2]
- **Category:** Field notes · **Audience:** all · **Length:** long · **Priority:** P1 · **Tags:** `origin`, `for-migrators`, `themes`, `v1.0`
- **Summary:** Landscape scan synthesized from the 12-system audit. Where cia fits in 2026.
- **Outline:**
  - [Tailwind CSS v4 (Jan 2025)](https://tailwindcss.com/blog/tailwindcss-v4) — config moved from JS to CSS `@theme`; Lightning CSS engine; up to 5× faster
  - [Radix unified into single `radix-ui` package (Feb 2026)](https://ui.shadcn.com/docs/changelog/2026-02-radix-ui) — collapsed ~30 per-component packages
  - [shadcn added Base UI as a primitive choice (Jan 2026)](https://ui.shadcn.com/docs/changelog/2026-01-base-ui), then [blocks for both (Feb 2026)](https://ui.shadcn.com/docs/changelog/2026-02-blocks), then [`shadcn/cli v4` `--base` flag (Mar 2026)](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4)
  - [MUI v7.1 added opt-in `@layer` defensively against Tailwind v4](https://mui.com/material-ui/customization/css-layers/) ([GH #44700](https://github.com/mui/material-ui/issues/44700))
  - [DTCG spec reached first stable version 2025.10 (Oct 2025)](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/) — cia's Style Dictionary preset shipped on this
  - Where cia sits: zero-JS core + opt-in a11y recipes + mixin-first + framework-agnostic recipes — combination none of the 12 ships
  - The honest read: Tailwind hate is exhausted; the shadcn graduate is the actual audience ([memory/project_v1_architecture_recipes.md](../memory/project_v1_architecture_recipes.md))
- **Publish:** launch +4 weeks
- **Citations:** external: [tailwindcss.com/blog/tailwindcss-v4](https://tailwindcss.com/blog/tailwindcss-v4) · [shadcn Feb 2026 Radix](https://ui.shadcn.com/docs/changelog/2026-02-radix-ui) · [shadcn Jan 2026 Base UI](https://ui.shadcn.com/docs/changelog/2026-01-base-ui) · [shadcn Feb 2026 blocks](https://ui.shadcn.com/docs/changelog/2026-02-blocks) · [shadcn Mar 2026 cli v4](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4) · [mui CSS Layers](https://mui.com/material-ui/customization/css-layers/) · [DTCG 2025.10](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/) · [npmjs.com/package/radix-ui](https://www.npmjs.com/package/radix-ui) · internal: `.agent/work/research/layering-scan-2026-05-23.md` · `memory/project_v1_architecture_recipes.md`

#### 24. "What a 12-system landscape scan taught us"  [NEW IN v2 — research highlight]
- **Category:** Field notes · **Audience:** contributor, consumer · **Length:** medium · **Priority:** P1 · **Tags:** `origin`, `mcp`, `themes`, `v1.0`
- **Summary:** The research artifact behind post #23. 12 design systems × 4 axes. The data shifted three architectural calls.
- **Outline:**
  - Setup (12 systems × 4 axes × dual-search) ([.agent/work/research/layering-scan-2026-05-23.md](../.agent/work/research/layering-scan-2026-05-23.md))
  - 9/12 ship JS in core; only [DaisyUI](https://daisyui.com/) and [Pico](https://picocss.com/) ship zero JS; [shadcn](https://ui.shadcn.com/) ships nothing as a runtime dep
  - a11y is bundled into components in 8/12; only [Adobe React Spectrum](https://react-spectrum.adobe.com/) markets a separate layer
  - Trend is fewer top-level packages, more internal layering — [Radix's Feb 2026 unification](https://www.npmjs.com/package/radix-ui) is the bellwether
  - Three calls the data shifted: keep `@cia/mcp-server` as one extra package; cancel `@cia/a11y` JS-shims; keep cia core single-package
  - cia's combination has no peer in the 12
- **Publish:** launch +5 weeks
- **Citations:** external: [daisyui.com](https://daisyui.com/) · [picocss.com](https://picocss.com/) · [ui.shadcn.com](https://ui.shadcn.com/) · [react-spectrum.adobe.com](https://react-spectrum.adobe.com/) · [npmjs.com/package/radix-ui](https://www.npmjs.com/package/radix-ui) · [headlessui.com](https://headlessui.com/) · [carbondesignsystem.com](https://carbondesignsystem.com/) · [polaris.shopify.com](https://polaris.shopify.com/) · internal: `.agent/work/research/layering-scan-2026-05-23.md` · `.agent/work/external/gemini-layering-strategic-2026-05-23.md`

### P2 — First quarter (5 posts)

#### 10. "Why we said no to Storybook"  [v1 #10 — kept for the longer how-it-played-out arc; #18 is the shorter pivot-narrative twin shipped at launch]
- **Category:** Decisions · **Audience:** consumer, contributor · **Length:** short · **Priority:** P2 (demoted; the launch-day pivot post #18 covers the headline)
- **Summary:** A longer follow-up to post #18 — once cia has shipped for a quarter, revisit whether the call held up. Did any consumer ask for a Storybook integration?
- **Publish:** launch +3 months
- **Citations:** internal: `memory/project_no_storybook.md`

#### 11. "Why 'Tailwind hate' is exhausted as a pitch in 2026"
- **Category:** Decisions · **Audience:** consumer, migrator · **Length:** medium · **Priority:** P2
- **Summary:** Gemini's blunt 2026-05 critique reshaped the positioning. The real audience isn't the Tailwind defector — it's the shadcn graduate who's done migrating component code by hand.
- **Outline:**
  - The original pitch that didn't land ("class-soup is bad")
  - Gemini's read: that argument is settled, move on ([.agent/work/external/gemini-add-on-architecture-2026-05-23.md](../.agent/work/external/gemini-add-on-architecture-2026-05-23.md))
  - The shadcn-graduate problem (40-file edit when the designer wants new density) — confirmed by [shadcn's 2026 changelog cadence](https://ui.shadcn.com/docs/changelog) showing it's adding more primitives, not removing the per-file edit cost
  - cia's actual differentiation: tokens + recipes + zero JS + AI-composable
  - Note: Tailwind Labs reorg claims (Jan 2026 layoffs) treated as unverified ([memory/project_tailwind_labs_2026.md](../memory/project_tailwind_labs_2026.md)); argument doesn't depend on them
- **Publish:** launch +1 month · **Cross-link:** `/compare`, post #1
- **Citations:**
  - external: [ui.shadcn.com/docs/changelog](https://ui.shadcn.com/docs/changelog) · [tailwindcss.com/blog/tailwindcss-v4](https://tailwindcss.com/blog/tailwindcss-v4)
  - internal: `.agent/work/external/gemini-add-on-architecture-2026-05-23.md` · `memory/project_tailwind_labs_2026.md`

#### 12. "From boiler-project-ai to the recipes book — the journey"
- **Category:** Field notes · **Audience:** consumer, contributor · **Length:** long · **Priority:** P2
- **Summary:** The full arc. Started as "build a React kit." Ended as "ship the patterns AI generates from." Five months of architecture letters.
- **Tags:** `origin`, `for-ai-devs`, `recipes`
- **Outline:**
  - The original Gremlin UI plan (Phase 8, RIP) ([memory/project_boilerplate_relationship.md](../memory/project_boilerplate_relationship.md))
  - The pivot conversations (2026-05-19 strategic decisions, 2026-05-23 architecture lock) ([memory/project_v1_strategic_decisions_locked.md](../memory/project_v1_strategic_decisions_locked.md))
  - The user-power principle's role
  - What boiler-project-ai is now (Jerry's showcase, eats cia dogfood)
  - The codegen POC bet ([v1.1 EPIC-04](./epics/v1-1/README.md)) — if it works, framework packs follow
- **Publish:** launch +1 month · **Cross-link:** post #1, post #4, ROADMAP Phase 8
- **Citations:**
  - external: [ui.shadcn.com](https://ui.shadcn.com/)
  - internal: `memory/project_boilerplate_relationship.md` · `memory/project_v1_strategic_decisions_locked.md` · `memory/project_v1_architecture_recipes.md` · `roadmap/epics/v1-1/README.md`

#### 13. "What the v1.1 install wizard won't ask you"
- **Category:** Decisions · **Audience:** consumer, migrator · **Length:** short · **Priority:** P2
- **Summary:** `npx create-cia` is coming in v1.1. Four questions, not forty. The wizard's design constraints explained.
- **Outline:**
  - The two install paths (`npm install css-is-awesome` for existing projects, `npm create cia@latest` for new) ([memory/project_install_wizard.md](../memory/project_install_wizard.md))
  - The four questions: project type, framework, components-or-mixins, theme
  - What it won't ask: build tool, CSS-in-JS mode, dark mode setup (all platform defaults)
  - Gemini's pushback: ["drop the create mindset; meet teams in existing projects"](../.agent/work/external/gemini-add-on-architecture-2026-05-23.md) — why we keep both `init` and `create` paths instead of choosing
  - Why not a Yeoman-style 20-question gauntlet
- **Publish:** launch +6 weeks · **Cross-link:** v1.1 EPIC, post #1
- **Citations:**
  - external: none (process post)
  - internal: `memory/project_install_wizard.md` · `.agent/work/external/gemini-add-on-architecture-2026-05-23.md` · `roadmap/epics/v1-1/EPIC-02-install-wizard.md`

#### 14. "Why light-dark() over data-attribute mode switching"
- **Category:** Architecture · **Audience:** theme-author · **Length:** short · **Priority:** P2
- **Summary:** The browser solved dark mode. cia ships the browser-native answer, not a JS toggle library.
- **Outline:**
  - The 2024 way (`[data-theme="dark"]` + JS toggle + localStorage)
  - The 2026 way (`color-scheme: light dark` + [`light-dark(a, b)` per token](https://web.dev/articles/light-dark))
  - When to still use data-attribute (brand swaps within a mode — Sketchbook stays Sketchbook regardless of OS)
  - The force-mode escape hatch (`.cia-force-light` / `.cia-force-dark` CSS hooks, consumer wires the trigger)
  - Why "force on the consumer" — the JS toggle is consumer turf, not ours
- **Publish:** launch +6 weeks · **Cross-link:** `/docs/themes/pairing`, post #6
- **Citations:**
  - external: [web.dev/articles/light-dark](https://web.dev/articles/light-dark) · [MDN — light-dark()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark)
  - internal: `memory/project_theme_architecture_locked.md`

### Pivot-narrative posts (NEW IN v2 — six headline posts) — P1/P2

#### 25. "Pivot: the Gremlin UI plan → the recipes book"  [NEW IN v2 — flagship pivot]
- **Category:** Decisions · **Audience:** consumer, AI dev · **Length:** long · **Priority:** P1 · **Tags:** `origin`, `recipes`, `for-ai-devs`, `pre-v1.0`
- **Summary:** Five months of "we'll ship `@cia/react` (Gremlin UI)." One Gemini critique. Two days. Total architectural reframe.
- **Outline:**
  - Original direction: cia core + `@cia/react` as the React companion ([memory/project_v1_architecture_recipes.md](../memory/project_v1_architecture_recipes.md))
  - The trigger: Gemini's external critique — *"You are a styling genius, not a state-machine vendor."* ([.agent/work/external/gemini-add-on-architecture-2026-05-23.md](../.agent/work/external/gemini-add-on-architecture-2026-05-23.md))
  - Jerry's exact words: *"I don't want to keep up with a component library."* (2026-05-23)
  - New direction: framework-agnostic recipes + MCP exposure; boiler-project-ai is a showcase, not the product
  - The trade-off honestly: no out-of-the-box `<Modal>` import; you (or your AI) build it from the recipe
  - Date locked: **2026-05-23**
- **Publish:** launch day · **Cross-link:** post #1, #4, #12
- **Citations:** external: [headlessui.com](https://headlessui.com/) · [react-spectrum.adobe.com](https://react-spectrum.adobe.com/) · internal: `memory/project_v1_architecture_recipes.md` · `.agent/work/external/gemini-add-on-architecture-2026-05-23.md` · `.agent/work/external/gemini-layering-strategic-2026-05-23.md` · `memory/feedback_user_power_principle.md`

#### 26. "Pivot: `@layer` → `:where()` for bare-tag specificity"  [NEW IN v2]
- **Category:** Decisions · **Audience:** consumer, theme-author · **Length:** medium · **Priority:** P1 · **Tags:** `origin`, `user-power`, `zero-js`, `pre-v1.0`
- **Summary:** Panel R1+R2 unanimously voted `@layer`. R3 flipped unanimously. The receipts behind the technical pivot that produced the user-power principle.
- **Outline:**
  - Original: layered cia (`cia.reset / tokens / base / components / utilities / overrides`) ([memory/feedback_no_at_layer.md](../memory/feedback_no_at_layer.md))
  - Trigger: Jerry's "who is this for?" question, 2026-05-16 ([memory/feedback_user_power_principle.md](../memory/feedback_user_power_principle.md))
  - Smoking gun: [MUI v7.1 shipped opt-in `@layer` *defensively* because Tailwind v4 broke it](https://mui.com/material-ui/customization/css-layers/) ([GH #44700](https://github.com/mui/material-ui/issues/44700)) — the largest React component library is *defending against* layered systems
  - Data: of 12 surveyed systems, only 3 ship layered by default ([.agent/work/research/layering-scan-2026-05-23.md](../.agent/work/research/layering-scan-2026-05-23.md))
  - [Miriam Suzanne, `@layer` spec co-author](https://www.miriamsuzanne.com/2024/07/06/buckets-layers/), frames it as a consumer-side composition tool, not a library-emission default
  - New direction: [`:where()`, 0,0,0 specificity per MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/:where), consumers always win
  - Date locked: **2026-05-16** ([.agent/decisions/decided/04-at-layer-decision.md](../.agent/decisions/decided/04-at-layer-decision.md))
- **Publish:** launch day · **Cross-link:** post #2, #4
- **Citations:** external: [mui.com — CSS Layers](https://mui.com/material-ui/customization/css-layers/) · [GH mui/material-ui#44700](https://github.com/mui/material-ui/issues/44700) · [MDN :where()](https://developer.mozilla.org/en-US/docs/Web/CSS/:where) · [miriamsuzanne.com](https://www.miriamsuzanne.com/2024/07/06/buckets-layers/) · [css.oddbird.net/layers/explainer](https://css.oddbird.net/layers/explainer/) · internal: `memory/feedback_no_at_layer.md` · `memory/feedback_user_power_principle.md` · `.agent/work/research/layering-scan-2026-05-23.md` · `.agent/decisions/decided/04-at-layer-decision.md`

#### 27. "Pivot: the `@cia/a11y` JS-shim plan → recipes-only"  [NEW IN v2]
- **Category:** Decisions · **Audience:** consumer, a11y · **Length:** medium · **Priority:** P1 · **Tags:** `origin`, `a11y`, `zero-js`, `recipes`
- **Summary:** Plan was a thin `@cia/a11y` JS-shim package (focus-trap, ARIA-syncing, roving tabindex). Gemini killed it. Recipes-only replaced it.
- **Outline:**
  - Original: cia core + `@cia/a11y` as a tiny JS-shim package
  - Gemini's critique: *"You will spend the next 5 years drowning in obscure screen-reader bug reports."* ([.agent/work/external/gemini-layering-strategic-2026-05-23.md](../.agent/work/external/gemini-layering-strategic-2026-05-23.md))
  - The precedent: Headless UI / [Radix](https://www.npmjs.com/package/radix-ui) / React Aria are the state-machine vendors; cia composes, doesn't compete
  - The pivot: `@cia/a11y-recipes` (post-v1.0) is recipes-only with tiny shims *only where unavoidable* ([v1.1 EPIC-03](./epics/v1-1/EPIC-03-cia-a11y-recipes.md))
  - v1.0 carries forward: every recipe ships an a11y checklist; the `<dialog>` recipe uses [native `.showModal()` for built-in focus trap + Esc](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog)
  - Date locked: **2026-05-23**
- **Publish:** launch +1 week
- **Citations:** external: [npmjs.com/package/radix-ui](https://www.npmjs.com/package/radix-ui) · [headlessui.com](https://headlessui.com/) · [react-spectrum.adobe.com](https://react-spectrum.adobe.com/) · [MDN dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog) · [W3C 1.4.11](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html) · internal: `.agent/work/external/gemini-layering-strategic-2026-05-23.md` · `memory/project_v1_architecture_recipes.md` · `roadmap/epics/v1-1/EPIC-03-cia-a11y-recipes.md`

#### 28. "Pivot: 14 theme files → 9 single-file themes via `light-dark()`"  [NEW IN v2]
- **Category:** Decisions · **Audience:** theme-author, consumer · **Length:** medium · **Priority:** P1 · **Tags:** `origin`, `themes`, `user-power`, `light-dark`
- **Summary:** v0.8 collapsed 14 two-file themes into 9 single-file themes. Panel voted 3-1 against. Jerry overrode.
- **Outline:**
  - Original: two Sass partials per theme (`sketchbook-light.scss` + `sketchbook-dark.scss`) ([memory/project_theme_architecture_locked.md](../memory/project_theme_architecture_locked.md))
  - Trigger: panel R5 voted 3-1 *for* the two-file C2 structure on editor-codegen grounds. Jerry rejected the frame.
  - New direction: one file per theme; [`light-dark()` is Baseline Newly available since May 13, 2024](https://web-platform-dx.github.io/web-features-explorer/features/light-dark/) ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark), [web.dev](https://web.dev/articles/light-dark))
  - Three shapes per file (light-only / `light-dark()` / non-color asymmetry)
  - Killed: C2 partials, `m.pair()`, `m.theme(asymmetric, …)`, the Pattern A/B/C docs terminology
  - Date locked: **2026-05-18**
- **Publish:** launch +2 weeks · **Cross-link:** post #6, #14
- **Citations:** external: [MDN light-dark()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark) · [web.dev/articles/light-dark](https://web.dev/articles/light-dark) · [web-platform-dx Baseline](https://web-platform-dx.github.io/web-features-explorer/features/light-dark/) · internal: `memory/project_theme_architecture_locked.md` · `memory/feedback_user_power_principle.md`

#### 29. "Pivot: component library → recipes any framework can codegen from"  [NEW IN v2]
- **Category:** Decisions · **Audience:** consumer, AI dev · **Length:** medium · **Priority:** P2 · **Tags:** `origin`, `recipes`, `for-ai-devs`, `mcp`
- **Summary:** Strategic shape change. cia stops being a component library; framework packs are generated FROM recipes, not wrapped around them.
- **Outline:**
  - Original: maintain `@cia/react`, `@cia/angular`, `@cia/vue`, `@cia/svelte` as hand-written kits
  - Trigger: maintenance-treadmill math — 50 components × 4 frameworks × API drift = permanent tax
  - New direction: `@cia/react` v0.1 in v1.1 is a codegen POC, not hand-maintained ([v1.1 EPIC-04](./epics/v1-1/EPIC-04-framework-pack-react.md))
  - Recipe markdown is the source; framework packs are generated artifacts
  - Matches the AI-second pitch (recipes are LLM-readable; component libraries aren't) and the user-power test (consumers get framework-native source)
- **Publish:** launch +2 months
- **Citations:** external: [ui.shadcn.com](https://ui.shadcn.com/) · internal: `memory/project_v1_architecture_recipes.md` · `roadmap/epics/v1-1/EPIC-04-framework-pack-react.md` · `roadmap/epics/v1-0/post-v1-ideas.md`

#### 30. "Pivot: 'zero JS, no exceptions' → 'zero JS in `files`; tooling in `bin/`'"  [NEW IN v2]
- **Category:** Decisions · **Audience:** consumer, contributor · **Length:** short · **Priority:** P2 · **Tags:** `zero-js`, `mcp`, `origin`
- **Summary:** Rule clarification. After the 2026-05-20 `dist/copy-button.mjs` incident, the rule got precise: npm `files` = zero JS; `bin/` = CLI allowed; VS Code extension ships separately.
- **Outline:**
  - 2026-05-20 incident: shipped `dist/copy-button.mjs` as a "toast variant" enhancement ([memory/feedback_no_js_in_package.md](../memory/feedback_no_js_in_package.md))
  - Jerry caught it; file moved from `dist/` to `public/` (website-only, not shipped)
  - Clarification: `files` = zero JS; `bin/` = CLI (MCP server already lives there); `public/` = docs site assets only
  - Consistent with `npx cia migrate` ([EPIC-03](./epics/v1-0/EPIC-03-migration-on-ramp.md)) and [v1.5 VS Code extension](./epics/v1-5/README.md) (separate marketplace publish, not the npm package)
  - Marketing line preserved: *"Zero JavaScript. Drop one CSS file in your head. Done."*
- **Publish:** launch +2 months
- **Citations:** external: [picocss.com](https://picocss.com/) · [daisyui.com](https://daisyui.com/) · internal: `memory/feedback_no_js_in_package.md` · `roadmap/epics/v1-0/EPIC-03-migration-on-ramp.md` · `roadmap/epics/v1-5/README.md`

### P3 — Later (3 posts)

#### 15. "Recipes beat components in 2026 — the shadcn graduate problem"
- **Category:** Decisions · **Audience:** consumer, migrator, AI dev · **Length:** long · **Priority:** P3
- **Summary:** Long-form companion to post #1 and post #29. Why component libraries created their own treadmill, and why framework-agnostic recipes solve the actual job.
- **Outline:**
  - The shadcn promise (you own the code) vs the shadcn pain (40-file edit on density change) ([shadcn changelog cadence as receipts](https://ui.shadcn.com/docs/changelog))
  - [Headless UI's state-machine surface](https://headlessui.com/) as another tax
  - What a "recipe" is: markdown + tokens + mixins + sample HTML + a11y checklist
  - Why AI generation makes recipes more valuable than ever
  - The trade-off: no out-of-the-box `<Modal>`; you (or your AI) build it
  - The cia bet: tokens move faster than components
- **Publish:** launch +2 months · **Cross-link:** post #1, post #9, post #25
- **Citations:**
  - external: [ui.shadcn.com](https://ui.shadcn.com/) · [headlessui.com](https://headlessui.com/) · [npmjs.com/package/radix-ui](https://www.npmjs.com/package/radix-ui)
  - internal: `memory/project_v1_architecture_recipes.md` · `.agent/work/research/layering-scan-2026-05-23.md`

#### 16. "How the user-power principle reshaped the architecture"
- **Category:** Field notes · **Audience:** contributor, consumer · **Length:** long · **Priority:** P3
- **Summary:** The meta-decision post. What killing @layer taught us about killing two other features. The principle as a repeatable filter.
- **Outline:**
  - The first kill (@layer, 2026-05-16) ([memory/feedback_no_at_layer.md](../memory/feedback_no_at_layer.md))
  - The second (versioned Tailwind migrator → page-only)
  - The third (color-mix-as-default → author-every-value)
  - The framing test as a contributor tool ("can you write a 15-second pitch that says THIS GIVES YOU MORE POWER?")
  - When the principle didn't apply (mixin renames — internal vocabulary, not user-facing)
- **Publish:** launch +3 months · **Cross-link:** post #4, post #2, post #26
- **Citations:**
  - external: none (principle post)
  - internal: `memory/feedback_user_power_principle.md` · `memory/feedback_no_at_layer.md` · `memory/feedback_mixin_first_principle.md`

#### 31. "EPIC spotlight: bug fixes and MCP polish (v1.0 EPIC-05)"  [NEW IN v2]
- **Category:** Release notes · **Audience:** contributor, consumer · **Length:** short · **Priority:** P3
- **Summary:** The unglamorous v1.0 epic. Three latent bugs from Round 8 audit, MCP server test coverage, the new `/docs/composition` page. Why the boring epic is the one that actually ships v1.0.
- **Tags:** `mcp`, `v1.0`, `mixins`
- **Outline:**
  - The Round 8 audit findings ([roadmap/epics/v1-0/EPIC-05-bug-fixes-mcp-polish.md](./epics/v1-0/EPIC-05-bug-fixes-mcp-polish.md))
  - The three fixes (`/docs/mixins` v0.8 naming, `/docs/install` CDN + theme attr, `cia.btn($bg:)` state cascade)
  - MCP server test coverage from zero to ≥80% line coverage
  - `/docs/composition` — Gemini's "build what we didn't" recommendation ([.agent/work/external/gemini-add-on-architecture-2026-05-23.md](../.agent/work/external/gemini-add-on-architecture-2026-05-23.md)) shipped
  - Why "ship audited" beats "ship novel" for a 1.0 stamp
- **Publish:** launch +3 months
- **Citations:**
  - external: none (process post)
  - internal: `roadmap/epics/v1-0/EPIC-05-bug-fixes-mcp-polish.md` · `.agent/work/external/gemini-add-on-architecture-2026-05-23.md`

---

## 3. Sequence — what to write first

First 7 posts to draft, in order, with v2 reasoning.

1. **#5 "Mixin-first beats classes"** — the architectural pitch. README hero in long-form. Without it landing first, every other post has to re-explain cia.
2. **#1 "Why cia is a recipes book"** — the v1.0 narrative. Pairs with the launch announcement; answers "why isn't there a `<Modal>` component?" day one.
3. **#25 "Pivot: Gremlin UI → recipes book"** — NEW IN v2. Expanded pivot retrospective. Third because it's the *story* version of post #1's *decision*.
4. **#17 "Where css-is-awesome came from"** — NEW IN v2. Origin story. Body `[AWAITING JERRY'S MATERIAL]`; slot reserved for launch day. If material misses the deadline, fall back to #4 here.
5. **#4 "The user-power principle"** — the meta-frame. Once published, posts #2, #6, #26, #10 reference it instead of re-deriving.
6. **#2 "Why cia killed @layer"** — the most-asked technical question. Pre-empts "but everyone else uses @layer."
7. **#26 "Pivot: @layer → :where()"** — NEW IN v2. Companion to #2. #2 is *the decision*; #26 is *the room where it happened*.

**#3 (zero JS) and #18 (no Storybook)** land days 2-3 if drafting capacity allows. **#19-22 (epic spotlights)** roll out one per week in the first 4 weeks. **#23-24 (landscape + research)** land in weeks 4-5.

v1 sequence (#5, #1, #4, #2, #3 in the can before launch) still holds — v2 inserts #25 and #17 between #1 and #4.

---

## 4. Migration plan for current /blog (REAFFIRMED — v2)

### Audit of current `src/app/blog/page.tsx`

All seven posts are fiction with `href="#"`. **All are killed.** Disposition unchanged from v1:

| Current post (title) | Disposition | Replacement |
|---|---|---|
| "The Sketchbook theme is a second Zen" | KILL | Sketchbook is a theme, not a topic worth a post. |
| "Five voices, one system" | KILL stale claim; content reborn | Reborn as Post #6 "One theme = one file" + Post #28 "14 → 9 theme files pivot". |
| "Why the accent is indigo (藍), not blue" | KILL | Sketchbook color rationale; not system-wide. |
| "Container queries are finally boring" | KILL | Not on the cia decision arc. |
| "Why the overflow stays" | KEEP IDEA, defer | Meme-respect for `/about`, not the blog. |
| "Planning a CLI and an MCP server" | KILL (was speculation) | Replaced by Post #9 "The MCP server" (shipped product, retrospective). |
| "v0.1.0 — the first real draft" | KILL (never happened) | Replaced by a real v1.0 release-notes post. |

**Net:** all 7 fiction posts removed. Zero are kept as placeholders.

### Post-migration `page.tsx` shape — v2 REAFFIRMS NO STUBS

The catalog page becomes a real index that reads from the file-based posts. Required surface:

- **Hero** — short eyebrow + H1 + one-line intent ("Notes from the margins" works; keep the voice).
- **IF posts are not ready by v1.0 launch day:** the hero copy reads *"First posts land with v1.0 launch on `<date>`. Subscribe to RSS to catch them."* The catalog renders zero post cards. There are NO "coming soon" stub cards with `href="#"` or fake dates. The page proudly shows zero posts rather than fake ones.
- **Feature row (optional)** — newest 1-2 posts pulled out as larger cards with cover image / excerpt.
- **List** — all posts as `Post` components, newest first, with date / category / tags / title / excerpt.
- **Category filter** — sticky tab strip ("All / Decisions / Architecture / Recipes / Release notes / Field notes"). Click filters in place, URL updates to `/blog/category/<name>`.
- **Tag chip strip** — secondary filter, click navigates to `/blog/tag/<tag>`.
- **RSS link** — visible footer link to `/blog/rss.xml`.
- **Search** — DEFERRED to post-launch.
- **Empty state for category filter** — if a category has no posts yet, show *"No posts in this category yet. Check back after v1.<next>."* — NOT "Coming soon."

The page **must NOT** ship with any `href="#"` link. CI gate (lint script) blocks the merge if any blog file or `page.tsx` contains `href="#"` outside an escaped code example.

---

## 5. Voice + tone (REINFORCED in v2)

Five bullets. Print these at the top of every author's draft template.

- **Honest decision-led storytelling.** Lead with the question or the dead end, not the answer. "We tried X" is a stronger opening than "X is wrong."
- **No marketing fluff.** Never write "the best," "the only," "revolutionary," "game-changing." Never write "in today's fast-paced world." Let the artifact speak.
- **Real talk on trade-offs.** Every architectural decision has a cost. Name it. ("@layer would have given us cleaner internal cascade discipline; we gave that up to keep consumer composition simple.")
- **Short paragraphs, plain language, code-led where possible.** A 3-line code block beats a 100-word explanation. Pretend the reader is a smart engineer with 4 minutes.
- **Dates matter.** When a decision is dated, cite the date and the room ("Locked 2026-05-16 after R3 panel flip"). It signals receipts and lets readers locate it in the repo memory.

**Forbidden phrases (find-and-replace before publish):** "best-in-class," "next-generation," "future-proof," "battle-tested," "world-class," "industry-leading," "seamlessly," "leverage" (as a verb), "powerful" (used vaguely), "modern" (used as praise), "elegant," "robust," "killer feature," "delightful." (v2 adds the last four; they showed up in the panel-quote import for post #16.)

**Allowed once per post (use sparingly):** "I tried," "we got it wrong," "this took three iterations," "the panel was wrong."

### How we cite — NEW SUBSECTION IN v2

Three rules:

1. **External-link policy: every factual claim about another project, spec, or version ends with a markdown link to a primary source.** Order of preference: official blog/changelog → official docs/spec → third-party explainer. Tweets and Medium posts last-resort, never alone.
2. **Receipt-link policy: every decision date links to a `memory/` file, `.agent/work/` artifact, or `.agent/decisions/` sheet.** *"Locked 2026-05-16"* without a receipt link is a draft-blocking lint failure.
3. **Quote-attribution policy: quote Jerry with session-date attribution.** Example: *"I don't want to keep up with a component library."* — Jerry, 2026-05-23 session. Quote external parties with role + source file: *"You are a styling genius, not a state-machine vendor."* — Gemini, [`.agent/work/external/gemini-add-on-architecture-2026-05-23.md`](../.agent/work/external/gemini-add-on-architecture-2026-05-23.md).

**Anti-pattern:** unsourced factual claims. *"Tailwind v4 moved config to CSS"* needs the link. *"Most design systems ship JS"* needs the layering-scan citation. If you can't find a source in 5 minutes, soften or cut.

**Unsourced opinion is fine.** Claims about the world need sources; claims about what *we* think don't.

---

## 6. Engineering plan for the /blog implementation

> **Unchanged from v1**, with three v2 additions called out inline. Implementation lives in an epic (suggested home: `roadmap/epics/v1-0/EPIC-06-blog-platform.md` or a v1.1 slip).

### File structure

```
src/content/blog/<slug>.mdx
src/app/blog/{page.tsx, [slug]/page.tsx, category/[category]/page.tsx, tag/[tag]/page.tsx, rss.xml/route.ts}
src/lib/blog.ts        (load + parse posts, type-safe frontmatter)
```

### Build approach

- **MDX + Next.js dynamic routes**, statically generated via `generateStaticParams`.
- **Frontmatter parsed at build** with `gray-matter`; rendered with `next-mdx-remote` or `@next/mdx`.
- **Type-safe `BlogPost` contract** in `src/lib/blog.ts`; lint fails on missing required fields. **v2:** type now includes `citations: { external?: string[]; internal?: string[] }` as a REQUIRED key (empty arrays OK).
- **Compile-time code highlighting** — `shiki` or `rehype-pretty-code` (no client JS).
- **Reading time** from word count; **last-updated** from frontmatter `updatedDate` (not git mtime).
- **v2 Citations rendering:** post template renders a `<Citations>` block at the foot, heading "Sources & receipts," grouping `external` (links open `target=_blank rel=noopener`) and `internal` (chip-style, anchor-only unless a docs URL is configured). Required if either array non-empty.

### Features at launch

Catalog + category + tag pages; post route with metadata; RSS feed at `/blog/rss.xml`; OG / `<meta>` from frontmatter; reading time, byline, last-updated; `relatedPosts` cross-link rendering; **v2: Citations block.**

### Features deferred

Client-side search (Pagefind when post count > 25); comments (explicit kill — use GitHub Discussions); newsletter signup; author pages; series support (use `relatedPosts`).

### CI gates

- Frontmatter validator (all required fields, including `citations`)
- Dead-link checker (no `href="#"` in `src/content/blog/` or `src/app/blog/`)
- Forbidden-phrase grep (Section 5 list — now 14 phrases)
- Slug uniqueness
- **v2: receipt-link presence** — any post body with a date pattern `20\d\d-\d\d-\d\d` must link at least one path under `memory/`, `.agent/`, or a known external domain
- **v2: `citations` key presence** in frontmatter as object (empty arrays allowed)

### Hosting

Static-exported via Next.js (`output: "export"`), same Pages deploy as the rest of the docs site. RSS is a static `.xml`. No backend, no DB.

---

## 7. Open research threads (NEW IN v2)

Future-post candidates that need real-world data first. Not in any backlog; revisit each quarter post-launch.

1. **Post-launch download numbers vs Pico.** Pico is the cited zero-JS CSS-only peer. 90 days post-v1.0, compare weekly npm downloads. Needs: shipped v1.0 + 90-day window.
2. **Real consumer migration time from Tailwind config to cia theme.** Need 5-10 real consumer reports (or one detailed self-report from boiler-project-ai) on time-to-working-theme. Needs: shipped migrator + adoption.
3. **MCP-driven AI consumption telemetry.** Which MCP tools get called most by which clients (Claude Code / Cursor / Aider / Gemini)? Title: "What AI agents actually ask cia for." Needs: opt-in telemetry + 90-day window.
4. **Recipe coverage gap vs shadcn (post-v1.1).** Once v1.1 ships 7 more recipes (12 total), write the honest "what shadcn ships that cia still doesn't" piece. Needs: v1.1 + fresh shadcn changelog scan.
5. **The codegen POC retrospective.** v1.1 EPIC-04 ships `@cia/react` v0.1 as codegen-from-recipes POC. If it works, "we codegenerated a React component library from markdown." If it doesn't, "why we killed `@cia/react`." Needs: POC shipped + 30-day data.
6. **Theme marketplace economics.** v1.3 plans a community marketplace. Pre-ship: research how Tailwind UI / Tailgrids / Tremor / Penpot run theirs. Needs: 2-4hr scan + one operator interview.
7. **Real WCAG audit from a production cia consumer.** "We ran axe / WAVE / WebAIM on a production cia v1.x site." Needs: willing consumer with deployed site + audit budget. Best post in the backlog if it lands.

---

## UNRESOLVED — needs Jerry's call before any post ships

v1 had 7; v2 adds 5 more (8-12).

1. **Author byline name.** "jerry" / "Jerry Hansen" / "@jerry2d3d" / something else?
2. **Launch-day URL.** `cssisawesome.dev` by v1.0, or still GitHub Pages? Affects `canonical` + OG URLs.
3. **Post #11 ("Tailwind hate") — kill or keep?** Tailwind Labs layoff claim unverified per memory. Post stands without it; OK as-is, or kill?
4. **Post #12 (boiler-project-ai journey) — vendor risk?** If boiler is ever monetized as `@jerry2d3d/cia-boiler`, this post becomes its marketing surface.
5. **RSS feed canonical URL.** Confirm none of the launch posts originate on dev.to / Hashnode / personal blog.
6. **MDX-vs-markdown.** Architecture specifies MDX. Drop `<Example>` embeds if Jerry wants markdown-only.
7. **"Field notes" category framing.** Posts #12, #16, #17, #19-24 sit there. Rename if a different tone signal is preferred.
8. **NEW IN v2: Post #17 origin material deadline.** Body is `[AWAITING JERRY'S MATERIAL]`. If source not supplied 2 weeks before launch, slip to P1 (launch +2 weeks). Confirm.
9. **NEW IN v2: Pivot post tone.** Posts #25-30 quote Jerry directly. Confirm OK to quote with session-date attribution; each post will surface specific quotes for sign-off.
10. **NEW IN v2: External-link domain allowlist.** Primary = official project domains + W3C + MDN + web.dev + caniuse + GitHub repos. Secondary (Medium / Smashing / DEV / dev.to) supporting only, never alone. Confirm.
11. **NEW IN v2: Citations block placement.** Default = foot block under "Sources & receipts" (academic / wiki convention; easier to lint). Alternative = inline footnotes. Confirm.
12. **NEW IN v2: "Pivot" as a tag.** v2 uses `origin` for pivot DNA. Confirm: enough, or does `pivot` deserve its own tag for `/blog/tag/pivot` filterability?
