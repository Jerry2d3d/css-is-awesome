# Component philosophy — Round 2: bare-tag styling

## Round 1 → Round 2

Round 1 (already done — see `REVIEW.md` and the `claude-*.md` / `gemini-*.md` files in this folder) framed the question as "ship `.cia-card` / `.cia-btn-primary` utility classes for vanilla-HTML consumers."

Jerry has clarified his actual intent and it's **different** from Round 1's framing.

## Jerry's vision (in his own words, paraphrased)

> "When we make the buttons, we could do `button { @include btn(primary) }` — that would mean every button gets that style. Then you can use vanilla CSS. So if someone downloads the built CSS file, that's it. They download a theme file. They never have to build the code. They make a page where they only have to put a `<button>` and it'll style. Then power users who want to change everything can use the mixins and SCSS."

In one sentence: **"Drop the CSS file + a theme file, write semantic HTML, get a styled site. No classes required."**

This is the **Pico.css / Sakura.css / WaterCSS / MVP.css philosophy** — style every native element by default, almost no classes needed. But ours has the additional power of mixins + tokens + 6 themes underneath.

## Three consumer tiers (Jerry's clarified vision)

1. **Tier 1 — Drop-in author (vanilla HTML, no classes)**
   - Downloads `dist/css-is-awesome.css` + a theme file (e.g. `theme.css`).
   - Writes `<button>Submit</button>`. It's styled.
   - Writes `<input type="text">`. It's styled.
   - Writes `<table>...</table>`. It's styled.
   - Maybe needs **one or two modifier classes or attributes** for variants (`<button class="primary">` or `<button data-variant="primary">`) — but the *default* is bare-tag.

2. **Tier 2 — React consumer (uses our `<Button>` component)**
   - Same as today. `<Button variant="primary">`. Already works.

3. **Tier 3 — Power user (writes SCSS, customizes mixins)**
   - Same as today. `@include btn(primary, $px: 6) { @content }`. Already works.

The big shift is **Tier 1**. Today, vanilla HTML consumers get `.cia-*` utility classes for layout/spacing — but a bare `<button>` in their HTML renders unstyled (browser default).

## The two questions for Round 2

### Q1 — Real talk on the bare-tag approach

Each agent: give honest, opinionated feedback on Jerry's vision. Not theoretical — concrete.

- Does this work in practice for our system?
- What happens to the `.cia-*` utility classes we already ship — do they coexist or get demoted?
- What about variant styling — modifier classes (`<button class="primary">`), attributes (`<button data-variant="primary">`), pseudo-classes, or something else?
- Specificity issues: `button { @include btn-base }` is specificity 0,0,1. Any user override needs to beat that, which is trivial — but we have to think about how it interacts with our React components' CSS Module classes and the user's own custom styles.
- What breaks? Form libraries (Formik etc.) sometimes wrap inputs in a way that bare-tag styling double-applies. Component libraries that assume browser-default styles get hijacked. CMSes that emit raw HTML now get auto-styled — desired, mostly, but worth flagging.
- Is this still **mixin-first**? Or does it tip into "global CSS reset that happens to use mixins underneath"?

### Q2 — Ranked list of what to keep from `imported-instructions.md`

Each agent: produce a **ranked top-N list** of items from the imported instructions doc that are worth keeping for our system. Format:

```
1. <item> — <one-sentence why>
2. <item> — <one-sentence why>
...
```

Aim for ~5–8 items. Top of the list = highest value, no question.

## Output format

```markdown
# <Source> — <Persona> (20yr) — Round 2

## Q1 — Bare-tag approach: real talk
[5–10 lines of opinionated feedback. concrete, not theoretical.]

## Q2 — Top items to keep from the imported doc (ranked)
1. <item> — <why>
2. <item> — <why>
... (5–8 items)

## My recommendation
[2–4 lines. Ship it? With caveats? Don't ship?]
```

## Reference (read first)

- `experiments/component-philosophy/imported-instructions.md` — Jerry's source doc.
- `experiments/component-philosophy/REVIEW.md` — Round 1 consensus.
- `scss/components/_buttons.scss` — current `btn($variant)` mixin.
- `scss/_utilities.scss` — current `.cia-*` utility set (no component utilities).
- `scss/_mixins.scss` — `font-load`, `font()`, etc.

## Files for Round 2

```
experiments/component-philosophy/
├── ROUND-2-README.md          ← this file
├── claude-webdesign-r2.md     ← Round 2 proposal
├── claude-frontend-r2.md
├── claude-dev-r2.md
├── gemini-webdesign-r2.md
├── gemini-frontend-r2.md
└── gemini-dev-r2.md
```

After all 6 land, REVIEW-R2.md consolidates.

## Hard constraint

**No code changes this round.** Talk only. Jerry will pick a path after reading the consolidated review.
