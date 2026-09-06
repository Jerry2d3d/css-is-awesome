---
title: The popover attribute's invisible UA stylesheet
slug: the-popover-attributes-invisible-ua-stylesheet
category: discovery
tags: css, popover, cascade, ua-styles, debugging
audience: front-end developers, design system authors
excerpt: Half of what makes [popover] work is user-agent CSS you can silently destroy with one innocent declaration. Three ways we broke it — a permanently open menu, a menu that refused to be full-width, and the inset trick that un-centers the overlay.
author: Jerry Hansen
publishDate: 2026-09-06
updatedDate: 2026-09-06
---

The `popover` attribute feels like magic: add it to an element, point a button
at it, and you get top-layer rendering, light dismiss, focus handling — no
script. But the magic is only half attribute. The other half is a handful of
user-agent stylesheet rules, roughly:

```css
[popover]:not(:popover-open) {
  display: none;
}

[popover] {
  position: fixed;
  inset: 0;
  width: fit-content;
  height: fit-content;
  margin: auto;
}
```

Those rules are UA-origin, and the cascade has an iron law about origins:
**any author declaration beats any UA declaration**, regardless of
specificity. Normally that law protects you. With popovers it means one
ordinary-looking line in your own stylesheet can delete a piece of the
mechanism — and nothing warns you, because as far as the cascade is concerned
you did it on purpose.

I know because we did it three times.

## Story one: the menu that was always open

Our dropdown mixin laid the menu out as a column:

```scss
.menu {
  display: flex;
  flex-direction: column;
}
```

`display: flex` is author-origin. `[popover]:not(:popover-open)
{ display: none }` is UA-origin. Author wins — so the "closed" state stopped
existing. The menu rendered permanently open, and worse, since the hidden/shown
toggle is what promotes a popover's box, it sat *in flow*, shoving the page
content down like it was 2009. We shipped that.

The guard is to restate the toggle at author origin yourself:

```scss
.menu[popover] {
  display: none;

  &:popover-open {
    display: flex;
    flex-direction: column;
  }
}
```

Rule of thumb: never set `display` on a popover unconditionally. The open
state gets your `flex`/`grid`; the element itself gets an explicit
`display: none` so the closed state survives your own cascade.

## Story two: the full-width menu that hugged its content

We anchored a dropdown to its trigger with CSS anchor positioning — both
inline edges pinned to the trigger's edges, which should make the menu exactly
the trigger's width. It came out the width of its longest item instead,
sitting in the right place but visibly narrower than the control that opened
it.

The culprit is `[popover] { width: fit-content }`. When an element has an
explicit width, the width wins and the second inset edge is ignored — that is
just how absolute positioning resolves over-constraint. So the UA's
`fit-content` silently beat *both* anchored edges. The fix is one line, and
you will not find it by staring at your own code, because the losing rule is
not in your code:

```scss
.menu[popover] {
  width: auto; /* the UA's fit-content otherwise beats both inset edges */
}
```

That line cost an hour. It costs you a paragraph.

## Story three: `inset: unset`, the cheap dropdown trick

The UA rules `position: fixed; inset: 0; margin: auto` are what center a
popover in the viewport — the free modal-ish default. Which means the inverse
is also available: unset them, and the popover renders where it would have
sat in the flow, but still in the top layer.

```scss
.menu[popover] {
  inset: unset;
  margin: 0;
}
```

Position that relative to a wrapper (or better, anchor it) and you have a
dropdown that escapes every `overflow: hidden` ancestor for free. This one is
the same phenomenon as the first two stories, used deliberately: author styles
beating UA styles *is the API*. The line between "broke the popover" and
"built a dropdown" is whether you knew which UA rule you were overriding.

## The lesson

When a platform feature is implemented partly in UA CSS, your stylesheet is
part of its implementation whether you meant it or not. Before styling a
`[popover]`, `<dialog>`, or `<details>`, read the UA rules that make it work —
they're in the HTML spec, or one "expand UA styles" checkbox away in
DevTools — and decide for each one: preserve it, restate it, or override it on
purpose. The failure mode is never an error. It's a menu that is quietly,
permanently open.

---

*We use this in css-is-awesome: `cia.dropdown`, `cia.drawer`, and `cia.sheet`
all carry these guards — the `&[popover] { display: none }` restatement and
the `width: auto` escape — so consumers styling on top of them don't rediscover
each story the way we did. The mixins are in the
[component docs](/docs/components).*
