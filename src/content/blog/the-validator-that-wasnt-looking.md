---
title: The validator that wasn't looking
slug: the-validator-that-wasnt-looking
category: engineering
tags: accessibility, testing, post-mortem, css
audience: front-end developers, design system authors
excerpt: Seven themes scored 0 of 17 contrast pairs and the validator still printed a green check. A post-mortem on 119 silent skips and the parser that caused them.
author: Jerry Hansen
publishDate: 2026-08-17
updatedDate: 2026-08-17
---

The recipe index at `/docs/recipes` puts a complexity chip on every card — `simple`, `medium`, `complex`. Pill shape, mono, `0.75rem`. They looked fine. They were not.

```css
.recipe-chip[data-complexity="simple"]  { color: var(--code-green); }
.recipe-chip[data-complexity="medium"]  { color: var(--code-accent); }
.recipe-chip[data-complexity="complex"] { color: var(--code-blue); }
```

The `--code-*` tokens are the syntax-highlighting palette, tuned to sit on `--code-bg` inside a code block. Used as text on `--paper-sunk` at `0.75rem`, they measure like this:

| chip | token | on `--paper-sunk` | required |
|---|---|---|---|
| simple | `--code-green` | **1.72:1** | 4.5:1 |
| medium | `--code-accent` | **1.49:1** | 4.5:1 |
| complex | `--code-blue` | **1.81:1** | 4.5:1 |

A 1.49:1 ratio is not "a bit low." That is roughly the difference between two shades of the same beige.

That is a normal bug — a token reached for because its name sounded right, and nobody re-measured. What makes it worth writing up is the second bug: the reason it survived.

## The check that was checking nothing

cia ships a theme validator. Since v0.7 it has been **fail-by-default**: contrast failures exit non-zero and stop the build, and you pass `--allow-a11y-fail` to downgrade them while authoring a new theme. Seventeen contract pairs per theme — `--text-primary` on `--paper`, `--error-text` on `--error-subtle`, `--border-focus` on `--paper`, and so on. That guarantee is one of the things cia claims about itself.

Here is what the validator actually printed for the flagship themes:

```
✓ a11y [boilerplate] 0/17 contract pairs >= AA 17 skip
✓ a11y [cupertino]   0/17 contract pairs >= AA 17 skip
✓ a11y [glass]       0/17 contract pairs >= AA 17 skip
✓ a11y [graphite]    0/17 contract pairs >= AA 17 skip
✓ a11y [press]       0/17 contract pairs >= AA 17 skip
✓ a11y [prism]       0/17 contract pairs >= AA 17 skip
✓ a11y [sketchbook]  0/17 contract pairs >= AA 17 skip
```

Seven themes. Zero pairs scored. 119 skips. Green check on every line, exit code 0, CI happy.

Read that top line again. `0/17 contract pairs >= AA` is printed *next to a checkmark*. The formatter branched on `fail > 0`, then on `warn > 0`, and everything else fell into the success branch — where skips were appended as dim grey trivia. Nothing converted "I could not evaluate this" into "this did not pass."

We got it wrong. Not a false negative — a false *success*. The fail-by-default guarantee was not running on the themes it was most advertised for.

## Why it skipped

The themes use `light-dark()`. That is not incidental; it is the theme architecture. One theme is one file, and a colour token carries both schemes in one declaration:

```css
--paper:         light-dark(#F7F3EA, #1A1815);
--success-text:  light-dark(#3F5627, #B8CC8E);
--paper-glass:   light-dark(rgba(255, 255, 255, 0.85), rgba(15, 23, 42, 0.85));
```

The audit handed that raw declaration value to `parseColor()`, which understands hex, `rgb()`, `hsl()`, and named colours. It does not understand `light-dark()`. It threw, the pair became a skip, and the loop moved on.

The fix has two parts. First, a splitter that respects nesting. The existing `tokenizeFnArgs()` splits on every comma — correct for the flat `rgb(15, 23, 42)` lists it was written for, wrong the moment a function contains another function. `light-dark(rgba(15,23,42,.04), #fff)` came out as five arguments instead of two:

```js
function splitTopLevelArgs(inner) {
  const out = [];
  let depth = 0;
  let cur = '';
  for (let i = 0; i < inner.length; i++) {
    const ch = inner.charAt(i);
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}
```

Second, a resolver that unwraps what `parseColor()` cannot see through. Both `light-dark()` and `var()` can nest inside each other, so it recurses with a depth guard:

```js
function parseColorValue(raw, values, globals, scheme, depth) {
  const d = depth || 0;
  if (d > 8) throw new InvalidColor(raw);
  const s = stripValueComments(raw);

  const ld = /^light-dark\(([\s\S]*)\)$/i.exec(s);
  if (ld) {
    const args = splitTopLevelArgs(ld[1]);
    if (args.length !== 2) throw new InvalidColor(raw);
    return parseColorValue(scheme === 'dark' ? args[1] : args[0], values, globals, scheme, d + 1);
  }
  // …var() branch: follow the reference, or its fallback…
  return parseColor(s);
}
```

## Both schemes, worse row wins

Unwrapping `light-dark()` raises a question the old single-scheme audit never had to answer: *which* colour do you grade?

Grading only the light branch would have been the same bug in a better disguise — `--success-text` could clear 6.95:1 in light mode, be unreadable in dark, and still pass. A token that is two colours wearing one name has to clear the bar as both. So the audit now evaluates every pair twice and keeps the worse result:

```js
for (const pair of AUDIT_PAIRS) {
  const rows = ['light', 'dark'].map(s => evaluatePair(pair, env, s, warnMargin));
  const scored = rows.filter(r => r.status !== 'skip');
  if (scored.length === 0) { out.push(rows[0]); continue; }
  out.push(scored.reduce((worst, r) => (r.ratio < worst.ratio ? r : worst)));
}
```

Fail-by-default means worst case wins. Sketchbook's `--success-text` on `--success-subtle` is 6.95:1 in light and 8.53:1 in dark; the report shows 6.95:1, because that is the number a reader can actually be handed.

## What we found: nothing

After the fix, the validator reports **0 skips** — and all seven previously blind themes came back clean. No failures. A pile of warnings inside the AA buffer, the usual decorative `--border-default` informational rows, and that is it.

Stated plainly: fixing the checker did not find a single new contrast failure. The themes had been hand-audited during the v0.7 triage and they held up.

It was still worth doing, for a reason unrelated to today's bug count. Before the fix, "all themes pass" was a sentence with no evidence behind it for seven of them. After the fix it is a measurement. The value of a check is not the bugs it finds on the day you write it; it is that every future edit gets graded. A new theme, a token tweak, a contributor PR — those are now covered. Before, they would have been waved through with a checkmark.

## The chip fix

The chips got repointed at contract pairs the validator already enforces, instead of a palette nobody audits for this use:

```css
.recipe-chip[data-complexity="simple"]  { color: var(--success-text); background: var(--success-subtle); }
.recipe-chip[data-complexity="medium"]  { color: var(--warning-text); background: var(--warning-subtle); }
.recipe-chip[data-complexity="complex"] { color: var(--info-text);    background: var(--info-subtle); }
```

Measured after the change: simple **6.95:1**, medium **6.14:1**. axe passes on `/docs/recipes`.

The point is not the two numbers. It is that `--success-text` on `--success-subtle` is row 11 of the audit contract. Every theme that lands here now has that pair graded in both schemes before it can merge, so the chips inherit the guarantee instead of re-deriving it.

## The lesson

A skip that reports as a pass is worse than having no check at all.

No check is an honest gap — you know it is there and can decide what to do about it. A green check over 119 unevaluated pairs also spends your attention somewhere else. The whole product of a validator is confidence, and this one was manufacturing it.

If your checker can skip, make skips loud. Print them at the top, not in dim grey at the bottom. Better: count them as failures, and require an explicit allow-list for the ones you have genuinely decided not to grade. cia's audit still refuses to evaluate `oklch()` and friends — that skip is real, and it is now the only kind left. It should have to be argued for, not inferred from silence.

The fix is commit [`34edf0f`](https://github.com/Jerry2d3d/css-is-awesome). The code is in `scripts/theme-a11y.js`, the pairs are in `AUDIT_PAIRS` at the top of that file, and you can run it yourself with `npm run validate-themes`.
