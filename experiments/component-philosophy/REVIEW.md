# Component philosophy — consolidated review

Six proposals (3 Claude personas + 3 Gemini personas, all 20yr experience) evaluating Jerry's external `imported-instructions.md` against our system. The headline question: **"How do consumers build components without writing per-component SCSS?"**

---

## Strong consensus across all 6 agents

### Reject from the imported doc

1. **"Vanilla CSS only — no SCSS"** — hard reject from every agent. SCSS + the mixin API IS the system. Adopting vanilla CSS would either lose the mixin parameter API + `@error` failure modes, or force every consumer to re-implement them.
2. **"Style module required for every component, even if empty"** — directly contradicts Jerry's note. Every agent rejects this.
3. **"Component root is always `<section>`"** — breaks `Button.tsx` (`<button>`/`<a>`), `DataTable.tsx` (`<table>`), `Modal.tsx` (`<dialog>`). The doc itself carves an exception for dialogs; once you carve exceptions, the rule isn't a rule. Adopt the SPIRIT (semantic root) but reject the literal rule.

### Adopt from the imported doc (low-cost wins)

1. **TypeScript `type` for props / `interface` for data models** — co-located `*.types.ts` file when prop unions get complex. Pure stylistic win, zero runtime cost.
2. **Logical properties** (`margin-block` / `padding-inline` over `margin-top` / `padding-left`) — already partial in our mixins. Cheap stylelint rule (`csstools/use-logical`). Free RTL story.
3. **`!important` ban** — already true in our codebase by accident. Codify with stylelint `declaration-no-important`. Free.
4. **`handle*` event-handler prefix** — partial today (e.g., `Tabs.tsx`'s `handleKey`). Codify across the React layer.
5. **Native interactive elements + label/htmlFor a11y** — already our practice. Lock in lint.
6. **Pseudo-elements over decorative DOM** — already idiomatic in our SCSS.
7. **Class joining via array syntax** — already what `Button.tsx`, `Tabs.tsx`, `DataTable.tsx` do.

---

## Where the agents disagreed

### The big one: ship `.cia-card`, `.cia-btn-primary`, etc. as component utility classes?

| Vote | Agent |
|---|---|
| **Yes** | Claude webdesign, Claude frontend, Gemini webdesign, Gemini frontend, Gemini dev (5 of 6) |
| **No** | Claude dev (1 of 6) |

**Yes camp's argument:** Vanilla HTML consumers (no React, no SCSS) currently get layout/spacing utilities but nothing component-shaped. Ship `dist/css-is-awesome.components.css` as an opt-in bundle at the `./components` export. Consumers drop a `<link>` and write `<button class="cia-btn cia-btn-primary">`. Three concentric tiers serve three consumer profiles cleanly.

**Claude dev's dissent:** It duplicates the React layer (`<Button variant="primary">` already does this). Creates a third override path on top of CSS-var and mixin-recall — three ways to do the same thing. Turns class names into permanent semver-protected API surface — renaming `.cia-btn-primary` becomes a breaking change. Doc the existing three-tier model (utilities + React + mixins) and don't ship a new utility tier.

### Fibonacci spacing convention

| Vote | Agent |
|---|---|
| **Adopt as concept** (maps to our numbered scale; "soft value" framing) | Claude webdesign, Claude frontend, Gemini webdesign, Gemini frontend (4) |
| **Reject as raw values** (token contract is louder) | Claude dev, Gemini dev (2) |

The split is real. Claude dev: `theme-contract.json` IS the source of truth — there is no "approximate, safe to adjust" zone. Every value goes through `space()`, `radius()`, `font-size()`, `m.color()`. Fibonacci is a workaround for codebases without a token contract; we have one. **The Fibonacci-as-soft-value rule is for *consumer* app code, not library code.**

### Where the override path lives

Strong consensus: **CSS variables are the canonical runtime override**, mixin re-call is the SCSS escape hatch. But — **only Claude dev surfaced the missing artifact**: there's no documented list of which CSS variables a consumer can set. Today this is tribal knowledge. Solution: ship `scss/_overrides.scss` (or `component-overrides.json`) as the analogue of `theme-contract.json` for component-level vars (`--btn-padding-x`, `--card-radius`, etc.).

---

## Per-proposal one-line summary

- **Claude webdesign** — Hand-written `scss/_components.scss` with `.cia-<component>` + `.cia-<component>-<variant>` for every public mixin variant. Mental model: every component has the same shape from the outside. Junior dev guesses correctly first try.
- **Claude frontend** — `scss/components-utilities.scss` generates `dist/css-is-awesome.components.css`, exported at `./components` in `package.json`. Three consumer profiles, three paths, one source of truth (the mixins). Plus a separate increment to expose the React layer in `package.json` exports (currently missing).
- **Claude dev** — **Reject** the new utility tier. The three-tier model (utilities + React + mixins) already covers it; the gap is documentation. Add `docs/AUTHORING.md` and `scss/_overrides.scss` (CSS-var contract). No new SCSS source files.
- **Gemini webdesign** — "Class-First, Module-Optional." Drop the `.module.scss` from React components that only `@include` a base mixin; have them apply `cia-button cia-button--primary` directly via the JSX. Style module only for power-users who deviate.
- **Gemini frontend** — Three-profile matrix (Vanilla HTML / React standard / React power-user / React custom). Ship a `system.css` of CSS vars + `component-utilities.css` of component classes. Use Next 15 CSS chunking so unused components don't ship.
- **Gemini dev** — Same `cia-*` component classes as the others. Strict CSS-var-only override — even refuses to support nested-selector overrides. Forces consumers to set `--cia-card-bg` rather than `.card { background: ... }`.

---

## Unresolved philosophical question

**Five agents say add the utility tier. One agent (Claude dev) says don't — it's a contract trap.**

Both arguments are correct in their frames. The difference:
- **Yes camp** weights consumer ergonomics heavily — want every consumer profile (vanilla HTML included) to have a one-line component story.
- **No camp** weights API discipline heavily — three ways to do one thing is the kind of thing that haunts a library for a decade.

The **middle path nobody quite proposed**: ship the component utility bundle, but treat its class names as **semver-protected** from day one (not a casual addition). Enforce via stylelint that mixin output and utility-class output match — both come from the same private mixin under the hood, so renaming touches both atomically. That neutralizes Claude dev's "contract trap" objection.

---

## Manager (Claude) read

The proposals split cleanly into "do something" (5) and "do less" (1). Both are valid. My read:

### What I'd ship now (low-risk, broad consensus)

1. **`stylelint declaration-no-important`** — lock the `!important` ban.
2. **`stylelint csstools/use-logical: always`** — enforce logical properties in our own SCSS. Swap a couple of physical-property utilities to logical (`scss/_utilities.scss`).
3. **Document the three-tier model** in a new `docs/AUTHORING.md` (Claude dev's smallest proposal): tier 1 = `.cia-*` utilities + CSS-var overrides, tier 2 = React components, tier 3 = SCSS `@include` for deviations.
4. **`scss/_overrides.scss` (or `component-overrides.json`)** — list every component-level CSS var consumers can override. The missing half of the token contract.
5. **Optional: `*.types.ts` co-location pattern** for the React components with non-trivial prop unions. Gradual adoption, no big bang.

### The bigger decision (yours, Jerry)

**Do we ship a `dist/css-is-awesome.components.css` utility bundle?**

- **YES → Claude frontend's proposal.** ~30 line new SCSS file, a build script, an export line. Vanilla HTML consumers get a one-line `<button class="cia-btn cia-btn-primary">` story. Cost: utility class names become a stable public API.

- **NO → Claude dev's proposal.** Document the existing three-tier model. Vanilla HTML consumers either use the React layer (one extra dep) or write 3 lines of SCSS. We keep one canonical override path per layer.

The 5-vs-1 split says ship it. Claude dev's caution is real but addressable (see "middle path" above — semver-protect from day one).

### My recommendation

Ship the bundle (option YES) BUT:
1. Treat `.cia-<component>` and `.cia-<component>-<variant>` as semver-stable from v1.0.1 onward.
2. Generate them by hand in `scss/_components.scss` (no build script complexity — Claude webdesign's instinct here is right).
3. Add Claude dev's `docs/AUTHORING.md` so the THREE consumer profiles are explicit, not tribal.
4. Add Claude dev's `_overrides.scss` so CSS-var overrides have a contract.

That gives you Jerry's "no SCSS per component" rule for every consumer profile (vanilla HTML, React-using-our-components, React-on-our-mixins) and keeps a discipline layer underneath.

If you want me to ship that, say go and I'll mint the changes:
- `scss/_components.scss` (new, ~50 lines)
- `scss/_overrides.scss` (new, list of CSS vars)
- `docs/AUTHORING.md` (new, ~60 lines)
- `package.json` (add `./components` export + build script)
- `.stylelintrc` (declaration-no-important + csstools/use-logical)
- `Button.tsx` / `Tag.tsx` / etc. — gradually drop their `.module.scss` files where they only do `@include m.btn(primary)` (refactor to apply `.cia-btn-primary` directly)

Or pick one of the six proposals as-is.
