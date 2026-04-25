# Component philosophy — Round 2 review

Six agents (Claude × 3 + Gemini × 3) evaluated **Jerry's bare-tag styling vision**:
> "Drop the CSS file + a theme file → write `<button>` → get a styled button. No classes required."

---

## The headline finding

**5 of 6 agents flagged third-party React component hijack as the dealbreaker** for unscoped global bare-tag styling. The one positive vote (Gemini webdesign) qualified it heavily ("ship as a Base Layer opt-in"). Even the most negative dissent (Gemini dev: "hostile takeover of the global namespace") proposes a scoped fallback (`.cia-scope`).

So nobody recommended "ship `button { @include btn-base }` globally with no scoping." Every agent landed somewhere on the spectrum of "scope it" → "kill it."

## Concrete failure modes the agents named

This is the strongest evidence — these aren't theoretical:

| Failure | Where it bites |
|---|---|
| **Radix / Headless UI / Ark** | Their close icons / dropdown triggers are real `<button>`s. Get our padding/border/focus-ring/background. Visible breakage day one. |
| **react-select / react-datepicker / cmdk** | Same — bare `<button>` everywhere internally. A datepicker calendar grid has 30+ buttons. All become giant blue pills. |
| **Form libraries (Formik, React Hook Form, MUI)** | Wrap a hidden native input. Bare-tag `padding` on the inner shifts the outer chrome by a pixel. |
| **`<input type="checkbox">` / `radio` / `range`** | If `input { padding: m.space(1) }` ships, checkboxes look hilarious. Need attribute-narrowed selectors, which means it's not a one-liner. |
| **Stripe / HubSpot / Mailchimp embeds** | Sometimes iframe (safe), sometimes don't (hijack). Unpredictable. |
| **WordPress / Drupal / Contentful raw HTML** | Their pre-classed buttons (`<button class="wp-block-button__link">`) collide with our bare-tag rules at the same specificity. Last-loaded wins → load order becomes a contract. |
| **Bare `<a>`** | Lights up every nav link, breadcrumb, footer link, skip-link. Override war is unwinnable. |
| **CSS Modules vs. bare-tag specificity** | `button { … }` is `0,0,1`; `.Button_default__hash` is `0,1,0`. Module wins — but only if the global bare-tag CSS is loaded first. In Next 15 static export, head ordering is non-obvious and non-deterministic across versions. |

## Where bare-tag GENUINELY wins (all agents agree)

Editorial / content sites: CMS body fields, MDX, markdown blog posts, README/landing pages, internal admin panels — anywhere an author throws raw `<table>`, `<button>`, `<blockquote>` into HTML and today our system does **nothing** for it. This is the "Pico stars are made of this" segment, and it's real.

---

## What the agents recommend (synthesis)

The proposals converge on a tightly-scoped bare-tag layer rather than a global one. Three flavors:

### Flavor A — `@layer base` + `:where()` (Claude webdesign, Claude frontend, Gemini frontend)

```css
@layer reset, base, components, utilities, overrides;

@layer base {
  :where(button)       { /* @include btn-base */ }
  :where(input)        { /* @include input-base */ }
  :where(table)        { /* @include table-base */ }
  /* etc. */
}
```

`:where(...)` collapses specificity to `0,0,0`. Cascade layers make order enforceable rather than head-position-dependent. Consumer overrides (a single `.foo button` selector) win trivially. CSS Module classes win trivially. Third-party libs that set their own styles win trivially. **This is the version that genuinely ships.**

### Flavor B — `.cia-prose` opt-in wrapper (Claude dev, Gemini webdesign)

```html
<article class="cia-prose">
  <button>This gets styled</button>
  <p>This too — paragraph margins, etc.</p>
</article>
```

Bare-tag styles only apply inside the wrapper. Editorial / Markdown contexts opt in; the rest of the page is untouched. No third-party DOM hijack. Costs a wrapper class for the use case that wants it. Closest to "MDX renders pretty, the rest of the app is on its own."

### Flavor C — kill bare-tag entirely (Gemini dev)

Keep CSS Modules + mixins. Don't add a fourth path. "A library should be a guest in the consumer's codebase, not the landlord."

---

## Q2 — Top items to keep from the imported doc

Tallied across all 6 R2 lists. Items that appeared on **every** list or **5 of 6** are essentially unanimous:

### Universal keepers (ship these — broad agreement)

1. **Logical properties (`margin-block` / `padding-inline`)** — Every agent ranked it high. Free RTL/TTB, no LTR change. Stylelint `csstools/use-logical: always`. **#1 unanimously**.
2. **`!important` ban** — Already true by accident. Codify with stylelint `declaration-no-important`. Free.
3. **Native interactive elements + a11y** — Already our practice. Lock with `eslint-plugin-jsx-a11y`.
4. **Pseudo-elements over decorative DOM** — Already idiomatic in our SCSS. Codify because bare-tag styling makes wrapper-divs more dangerous.
5. **TS `type` for props / `interface` for data, co-located `*.types.ts`** — Pure stylistic win. Adoptable per-component.
6. **`handle*` event-handler prefix** — Cosmetic but cheap. Codify across React layer.
7. **Class joining via array `.join(' ')`** — Already what `Button.tsx` does. Codify, ban template-string concatenation.

### Split — Jerry decides

8. **Fibonacci spacing convention** — Gemini ALL 3 ranked it #1–3. Claude ALL 3 explicitly rejected it for library code (we have `theme-contract.json`; "approximate, safe to adjust" contradicts the contract). Useful framing for *consumer* code only.
9. **No same-element nesting (`<div>` in `<div>`, `<p>` in `<p>`)** — 4 of 6 agents kept it. HTML hygiene. Costs nothing.
10. **Element hierarchy (`section → article → div`)** — Gemini frontend ranked it; others accept the SPIRIT (semantic root) but reject the LITERAL rule (root must always be `<section>`).

### Hard rejects — never

- **"Vanilla CSS only — no SCSS"** — kills the mixin API. Hard reject from all 3 Claude agents and most Gemini.
- **"Style module required for every component, even if empty"** — directly contradicts your stated rule.
- **"Component root is always `<section>`"** — breaks `Button.tsx`, `Modal.tsx`, `DataTable.tsx`. Doc itself carves exceptions.
- **"Fully nested selectors / tag-selectors-only"** — works for editorial CSS, fights CSS Modules + the mixin API. Gemini liked it; Claude all 3 rejected it.

---

## Per-agent one-line summary

| Agent | Position | Recommended shipping form |
|---|---|---|
| Claude webdesign | Ship with three guardrails | `:where(...)` wrap + modifier class + `data-variant` mirror + scoped aggressive resets |
| Claude frontend | Ship inside `@layer base` | `@layer reset, base, utilities, overrides` + `:where(...)` + modern-normalize |
| Claude dev | Ship scoped, not global | `.cia-prose` opt-in wrapper, mirror variant names to `btn()` router exactly |
| Gemini webdesign | Ship as a Base Layer opt-in | Separate `theme-base.css` Tier-1 file |
| Gemini frontend | Don't ship "drop the CSS file" | `@layer base, components` + CSS Modules + Fibonacci rules |
| Gemini dev | Kill bare-tag entirely | CSS Modules + mixins, full stop |

---

## Manager (Claude) read

Three observations worth weighing:

**1. The 5-of-6 third-party hijack consensus is load-bearing.** Multiple agents independently named the same libraries (Radix, Headless UI, react-select, react-datepicker, cmdk) and the same failure mode. That's not theoretical — it's the actual reason Pico stays in the editorial niche and Bootstrap moved away from element-targeted resets in v5.

**2. The "drop the CSS file → just works" promise is achievable, but the scope matters.** Two paths achieve it without the hijack:

- **Path A (cascade layers + `:where`):** ship globally but at zero specificity, behind layers. Works EVERYWHERE — including third-party DOM — because their styles win automatically. Closest to your "just write `<button>`" pitch.
- **Path B (`.cia-prose` wrapper):** ship scoped to an explicit opt-in container. Doesn't deliver "no class needed" — author has to wrap their content in `<article class="cia-prose">`. Lower risk but partially defeats the goal.

**Path A is the smarter ship.** It gives you the "write semantic HTML, get a styled site" promise, AND it doesn't fight third-party React libs because their selectors all win on specificity. The cost is the cascade-layer setup (one `@layer` declaration at the top of the bundle) plus `:where()` wrapping (auto via SCSS).

**3. The Q2 keepers are basically free.** Logical properties + `!important` ban + a11y native elements + pseudo-elements + `type`/`interface` + `handle*` + array class join — that's seven low-risk wins I can ship in an afternoon, regardless of which bare-tag flavor (or none) you pick. The Fibonacci convention is the only real philosophical tension; the rest is uncontroversial.

## My recommendation

If you want to ship Jerry's vision: **Path A — `@layer base { :where(button) { @include btn-base } }`** plus modern-normalize ahead of it, plus modifier classes (`<button class="primary">`) AND `data-variant="primary"` mirrors, plus the variant names locked to the existing `btn()` router so they semver-evolve as one.

That gives you:
- Tier 1: drop CSS, write `<button>`, get a button. **The vision.**
- Tier 2: React `<Button variant="primary">` keeps working, CSS Modules win on specificity automatically.
- Tier 3: SCSS `@include btn(primary, $px: 6)` keeps working.

And ship the seven Q2 keepers regardless.

If you want to play it safe: **Path B — `.cia-prose` wrapper** — gets the editorial/CMS win without the third-party-DOM risk. Smaller, safer, slightly less magical.

If you want to do nothing: that's also legitimate. We're at v1.0, the React + mixins + `.cia-*` utility model already works, and the Q2 keepers stand alone.

Tell me which path. No code changes yet — still talking.
