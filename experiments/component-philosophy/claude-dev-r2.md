# Claude — Software developer (20yr) — Round 2

## Q1 — Bare-tag approach: real talk

Bare-tag styling is **a better answer than `.cia-btn-primary` was, but it doesn't dissolve the contract trap — it relocates it**. Honest read:

- **API surface shrinks, doesn't disappear.** The public API becomes `(tag, optional variant class)`. `<button>` is HTML — we cannot rename it, so the *primary* selector is a contract we can never break by accident. That's a real win over Round 1, where `.cia-btn-primary` was a string we owned and therefore could break. But `<button class="primary">` is still our string. Once we ship it, `primary` / `secondary` / `outline` / `ghost` / `info` / `success` / `warning` / `error` / `disabled` are semver-locked. Same nine variants the router in `scss/components/_buttons.scss:67-76` already enumerates — if we mirror them 1:1 (we should), the trap is at least *aligned* with the mixin contract instead of duplicating it.

- **Three override paths, ranked by specificity.** (1) CSS variable override on `:root` (`--btn-padding-x`) — already wired in `_buttons.scss:42-44`, specificity-irrelevant, the canonical path. (2) Re-declaring `button { ... }` in consumer CSS — same `0,0,1` specificity, source-order wins. (3) `@include btn(primary, $px: 6)` against a higher-specificity selector in consumer SCSS. **This is the exact problem I flagged in Round 1**, just with one fewer rung. The mitigating factor: paths (1) and (3) come out of the same mixin source, so a CSS-var rename touches both atomically. Path (2) is just CSS — can't help that, can't hurt it.

- **Reset is now load-bearing, not optional.** Bare-tag styling presumes a known starting state. If we style `button` but the consumer's framework ships its own reset (Next.js doesn't, but any Tailwind preflight or Bootstrap reboot would), our cascade order matters. **We need a Normalize/Modern-Reset block at the top of the bundle, or we promise inconsistent rendering.** This is new infra Round 1 didn't need.

- **Third-party `<button>` collision is the real risk.** Headless UI / Radix / react-select / cmdk all emit bare `<button>`. With Pico/Sakura you accept that — those libraries explicitly target document-style sites. We target *app* developers building React UIs with our `<Button>` component already. Auto-styling every `button` inside a Radix `<Dialog.Close>` or a third-party combobox dismiss button is **not consistency, it's hijacking**. Concrete failure: a Radix `<Popover.Close>` rendered as `<button aria-label="close">×</button>` would now get our `display: inline-flex`, our padding, our focus ring, our background. That breaks visual contracts on libraries we don't own. Mitigation requires either (a) scoping bare-tag rules under a class like `.cia-prose button` (which kills the "no classes" pitch), or (b) a documented escape hatch (`<button class="unstyled">`). Both are concessions.

- **"Mixin-first" claim degrades.** If the public-facing artifact is a bundled CSS file with `button { ... }`, `input { ... }`, `table { ... }` baked in, then for Tier 1 consumers **the mixin is an implementation detail, not the API**. That's fine — that's how Bootstrap works — but call it what it is. We become a "themed CSS bundle that happens to be authored in SCSS." Mixin-first is now Tier 3 only. The MEMORY note that "mixin-first vision" is the system has to flex to accept that Tier 1 is *output*-first.

- **Where it works:** content sites, marketing pages, Markdown-rendered prose, CMS output, internal dashboards a junior is wiring up in plain HTML. **Where it fails:** any consumer mixing our system with third-party React component libraries that emit native elements. That's most of our likely React audience.

- **Net:** bare-tag is the *least bad* of the Tier-1 options, but it costs us a reset, costs us isolation from third-party DOM, and locks `<variant-class>` names into semver from day one. It's not free.

## Q2 — Top items to keep from the imported doc (ranked)

1. **`!important` ban** — Already true in our codebase (zero hits across `scss/_mixins.scss`, `scss/_utilities.scss`, `scss/components/_buttons.scss`). Codify with stylelint `declaration-no-important`. Free, immediate, no design debate.
2. **Logical properties (`margin-block` / `padding-inline`)** — Strict superset of physical. Our `inset-x` / `inset-y` mixins still emit `padding-left/right`. Swap them, get RTL for free, no consumer-visible change.
3. **Native interactive elements + `<label htmlFor>` a11y** — Already our practice (`btn-base` calls `button-reset`, presumes `<button>`). Lock it in lint, never regress. Bare-tag styling makes this even more critical — if you're styling `button` not `.btn`, then a click handler on a `<div>` becomes both unstyled AND inaccessible.
4. **TS `type` for props / `interface` for data models, co-located `*.types.ts`** — Pure stylistic win. Zero runtime cost, zero coupling to the CSS. Adopt at the React layer regardless of what we do with bare-tag.
5. **`handle*` event-handler prefix + arrow-fn default exports** — Codify across `src/components/*`. Already partial (`Tabs.tsx`'s `handleKey`). Free conventions.
6. **Pseudo-elements over decorative DOM** — Already idiomatic in our SCSS. Worth stating explicitly because bare-tag styling tempts you to add wrapper divs to scope rules; resist.
7. **No same-element nesting (`<div>` in `<div>`, `<p>` in `<p>`)** — HTML hygiene. Costs nothing. Bare-tag styling makes nested-`<p>` actively worse because `p { margin-block: ... }` would compound.
8. **Class-name array-join** — Already what `Button.tsx` does. Codify as the one way; ban template-string concatenation in lint.

**Explicitly NOT keeping (same call as Round 1):** "Vanilla CSS only" (kills SCSS), "Style module required for every component, even if empty" (Jerry already vetoed), "Component root is always `<section>`" (wrong by HTML spec for `<button>`/`<dialog>`/`<table>` components), "Fibonacci as 'safe-to-adjust' signal" (`scripts/theme-contract.json` is the source of truth — there is no soft zone, and a glance at the 100+ enumerated tokens says the same).

## My recommendation

**Ship bare-tag, but scoped — not global.** Bundle Tier 1 as `dist/css-is-awesome.prose.css` (or `.bare.css`), with rules under a `.cia-prose` opt-in class on a wrapper. That preserves Jerry's "drop a CSS file, write `<button>`, get a styled button" pitch *inside the wrapper*, while leaving third-party React component DOM untouched. **Lock the variant class names (`primary`, `secondary`, `outline`, `ghost`, `info`, `success`, `warning`, `error`, `disabled`) to mirror the `btn()` router exactly** — one source of variants, two output forms. Add Normalize at the top of that bundle. Document it in `docs/AUTHORING.md` as Tier 1 with the third-party-DOM caveat called out in bold. **Don't ship truly global `button { ... }` — that's a hijack disguised as a feature.**
