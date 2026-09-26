---
title: Seven changes, and two of them were bugs I had shipped
slug: seven-changes-two-were-bugs
category: engineering
tags: css, anchor-positioning, accessibility, transitions, grid, api-design
audience: cia consumers, front-end developers
excerpt: A research handoff proposed seven changes to cia. All seven claims were true, including two live bugs. Here is what changed, what it does to your CSS, and the one number I refused to copy.
author: Jerry Hansen
publishDate: 2026-09-26
updatedDate: 2026-09-26
---

A research handoff landed proposing seven changes to this system: two bug
fixes and five improvements, each citing a pattern and a file.

I checked every claim against the source before writing any code, because
this month I have found statements about this repository wrong in both
directions, including several of my own. All seven were accurate. That is
unusual enough to be worth saying out loud.

Here is what changed, and more importantly what it does to CSS you have
already written.

## Nothing here breaks your site

Four of the seven cannot change a page that currently works. One changes a
default in a way you will probably like. One is opt-in. One competes with
code you may already have written, and that is the only item that needs your
attention.

I will take them in that order rather than the order they arrived in.

## The two bugs

**`grid(auto)` overflowed its own container.** The auto-fit branch emitted
`minmax(16rem, 1fr)`. That track refuses to go below 16rem even when the
*container* is narrower, so instead of shrinking, the grid overflowed. It
broke at exactly the widths a breakpoint-free layout exists to survive.

The fix is one call: `minmax(min(16rem, 100%), 1fr)`. Above the minimum the
two are identical, because `min(16rem, 100%)` simply *is* 16rem there. It
can only differ where the old form was already overflowing, which is a
pleasant property for a fix to have. ([before and after](#1-gridauto))

**`button-reset` removed the keyboard focus indicator.** It carried
`&:focus { outline: none; }`. That kills the outline for everyone, including
the keyboard user who has nothing else to tell them where they are.

What makes this one interesting is that cia's own components were fine.
Every internal caller adds `focus-ring` immediately afterwards, and one of
them has a comment reading *"button-reset strips the outline; a keyboard user
must still see focus."* That comment is the tell. When every call site has to
work around a default, the default is wrong — the callers were not being
forgetful, they were paying a tax.

A consumer calling `button-reset` on their own element got no such warning.
It is now scoped to `:focus:not(:focus-visible)`, which changes nothing for
mouse users and gives keyboard users back something they should never have
lost. ([before and after](#2-button-reset))

## Overlays now close, instead of vanishing

Modal, dropdown and tooltip animated open using a keyframe on the open state.
A keyframe on an open state can only describe arriving. The moment the
attribute goes away the element is gone, so all three eased in and then
blinked out. On the modal, the `::backdrop` blinked with it, which is the
more jarring half.

The fix is not new to this codebase. `drawer` has always transitioned
`opacity` and `translate` alongside `display` and `overlay` with
`allow-discrete`, using `@starting-style` for the entry. Two components in
the same library were doing the same job two ways, and the popover one was
right.

```scss
transition:
  opacity 240ms ease,
  transform 240ms ease,
  display 240ms ease allow-discrete,
  overlay 240ms ease allow-discrete;
```

`allow-discrete` is what makes this work. `display` is a discrete property:
it flips instantly and takes any exit animation with it. `allow-discrete`
tells it to wait. `overlay` is in there for the same reason — without it the
element leaves the top layer on the first frame and appears to fall behind
its own page on the way out.

Engines without `allow-discrete` open and close instantly, exactly as they
did before. `prefers-reduced-motion` still switches the whole thing off.
([before and after](#3-overlay-close-animations))

## A dropdown now knows what opened it

This is the item worth reading carefully, because it is the one that can
argue with CSS you already have.

Positioning a popover used to be your job, and the docs said so. You named
the trigger with `anchor-name`, then positioned the menu against it. Two
sides to wire for the most ordinary case there is.

It turns out the wiring is unnecessary. **Any element with `popovertarget`
is automatically the anchor of the popover it targets.** The relationship
already exists in the markup, so the CSS can simply use it:

```scss
position-area: block-end span-inline-end;
position-try-fallbacks: flip-block;
```

No `anchor-name`, nothing to name, nothing to keep in sync. The menu opens
under its trigger and flips above it near the bottom of the screen. The menu
also takes its width from the trigger, so a full-width mobile button gets a
full-width menu without a media query:

```scss
min-inline-size: max(12rem, anchor-size(inline));
```

**If you already position these yourself, read this part.** All of it sits
behind `@supports (anchor-name: --cia)`, so engines without anchor
positioning are untouched. But on engines that support it, cia now has an
opinion where it previously had none, and your rules and ours are both live.

So every value routes through a custom property. Overriding is one
declaration, not a specificity fight:

```css
.my-menu { --cia-anchor-area: block-start span-inline-start; }
```

And the mixins take the area as an argument if you would rather set it once:
`@include cia.dropdown($area: block-start)`. ([before and after](#4-anchor-positioning))

## One `@include` no longer means one gap

`stack()` hardcoded its gap, so a single tighter group inside a stack meant a
second `@include` or a modifier class. It now reads `--stack-gap` with the
argument as the fallback:

```scss
gap: var(--stack-gap, #{space(4)});
```

The library never declares that property anywhere. It is undefined until you
set it, so the computed value is identical to before unless you opt in. The
argument sets the rule; the custom property handles the exception; neither
needs to know about the other. ([before and after](#5-stack-gap))

## The number I refused to copy

The handoff asked for textarea `min-height: 6rem` to become `min-block-size:
3lh`. The unit change is obviously right — `lh` resolves against the
element's own line-height, so a textarea says "three lines" and means it,
and a theme with looser leading gets a taller box automatically instead of a
cramped one at the same pixel height.

The number is a different question. At cia's shipped line-height of 1.5,
`3lh` is 4.5rem against today's 6rem. That would silently shrink every
textarea in every consumer project by a quarter.

It ships as `4lh`, which is the same height as today at the current leading
*and* gains the scaling behaviour. If a shorter default is actually wanted,
it is one character — but that is a design decision, and it should be made
as one rather than smuggled in under a unit change.

`field-sizing: content` is available as `$grow: true`, capped by
`$max-height`. It is Chromium-only at the time of writing, which is exactly
why it is opt-in and why the fixed minimum stays as the floor.
([before and after](#6-textarea))

## Dialogs open without JavaScript

The dialog recipes now lead with the declarative trigger:

```html
<button commandfor="my-dialog" command="show-modal">Open dialog</button>
```

`show-modal` is the declarative equivalent of `.showModal()`, so you keep
the focus trap, Esc handling, `aria-modal` and the backdrop, and write no
script at all. A button that opens a dialog is markup describing markup.

Invoker commands are newer than cia's stated browser floor, so the recipe is
explicit that `.showModal()` remains the fallback — and that you still reach
for the method when something other than a click decides to open it. A
failed save, a route change, a timeout. A command is for *the user pressed
this button*; everything else is still a method call.
([before and after](#7-dialog-triggers))

## What to actually do

Nothing, for most of this. Update and the bugs are gone, the overlays close
properly, and your computed CSS is otherwise unchanged.

The exception is anchor positioning. If you position dropdowns or tooltips
yourself and you are testing in a browser that supports anchors, check them
once. If ours is in your way, one custom property moves it.

Seven claims, seven true. I will take that hit rate.

---

## Every change, before and after

The compiled output, not the source. This is what actually lands in your
stylesheet.

### 1. grid(auto)

```css
/* before — refuses to shrink below 16rem, so it overflows a narrower parent */
grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));

/* after — identical above 16rem, shrinks instead of overflowing below it */
grid-template-columns: repeat(auto-fit, minmax(min(16rem, 100%), 1fr));
```

### 2. button-reset

```css
/* before — removes the focus ring for everyone, keyboard users included */
.btn:focus { outline: none; }

/* after — mouse users unchanged, keyboard users keep an indicator */
.btn:focus:not(:focus-visible) { outline: none; }
```

### 3. Overlay close animations

```css
/* before — describes arriving only; the element is simply gone on close */
.modal[open] {
  animation: cia-modal-open 240ms ease both;
}
@keyframes cia-modal-open {
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

/* after — one declaration, both directions */
.modal {
  opacity: 0;
  transform: scale(0.96) translateY(8px);
  transition:
    opacity 240ms ease,
    transform 240ms ease,
    display 240ms ease allow-discrete,
    overlay 240ms ease allow-discrete;
}
.modal[open] {
  opacity: 1;
  transform: scale(1) translateY(0);
  @starting-style { opacity: 0; transform: scale(0.96) translateY(8px); }
}
```

The `::backdrop` gets the same treatment, which is the half you notice most.

### 4. Anchor positioning

```css
/* before — nothing. You named the trigger and positioned the menu yourself. */

/* after — inside @supports (anchor-name: --cia) */
.menu {
  position: absolute;
  margin: 0;
  inset: auto;
  position-area: var(--cia-anchor-area, block-end span-inline-end);
  position-try-fallbacks: var(--cia-anchor-try, flip-block);
  margin-block-start: var(--cia-anchor-gap, 1px);
  min-inline-size: max(12rem, anchor-size(inline));
}
```

To move it, set one property rather than out-specify the library:

```css
.my-menu { --cia-anchor-area: block-start span-inline-start; }
```

### 5. stack gap

```css
/* before — one gap per @include */
.stack { gap: var(--space-4, 1rem); }

/* after — same computed value; one child can now differ */
.stack { gap: var(--stack-gap, var(--space-4, 1rem)); }
```

```css
.form .tight-group { --stack-gap: 0.25rem; }
```

### 6. textarea

```css
/* before — a pixel height that ignores the theme's leading */
textarea { min-height: 6rem; }

/* after — four line boxes; 6rem at today's line-height of 1.5 */
textarea { min-block-size: 4lh; }
```

Opt in to growing with the content:

```scss
.comment { @include cia.textarea-base($grow: true); }
```

```css
.comment { min-block-size: 4lh; field-sizing: content; max-block-size: 12lh; }
```

### 7. Dialog triggers

```html
<!-- before — the button does nothing without script -->
<button id="open">Open dialog</button>
<dialog data-cia-recipe="dialog">…</dialog>
<script>open.onclick = () => dlg.showModal()</script>

<!-- after — no script at all -->
<button commandfor="my-dialog" command="show-modal">Open dialog</button>
<dialog id="my-dialog" data-cia-recipe="dialog">…</dialog>
```

`.showModal()` is still the right call when app logic opens the dialog, and
still the fallback on engines below the support floor.
