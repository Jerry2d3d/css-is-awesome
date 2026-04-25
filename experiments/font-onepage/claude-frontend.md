# Claude — Front-end developer (20yr)

## API proposal

Two-line consumer SCSS, in a route-segment CSS Module:

```scss
// src/app/special-landing/page.module.scss
@use 'mixins' as m;

@include m.font-face-google('Pacifico', $weights: (400));

.headline {
  @include m.font(reg, 7, $family: ('Pacifico', cursive));
}
```

One mixin loads the font (emits an `@import url(...)` at the top of the
compiled module CSS), one mixin applies it. The applied side reuses the
existing `font($type, $size, $lh, $ls, $family)` mixin — no new
authoring vocabulary for the apply step. The load step is a new mixin
that owns the URL contract.

For React-rendered components on that same page, the same module class
is the handle:

```tsx
import styles from './page.module.scss';
export default function Page() {
  return <h1 className={styles.headline}>Hello</h1>;
}
```

## Implementation

```scss
// scss/_mixins.scss (additions)
@use 'sass:list';
@use 'sass:string';

// Track which Google families have been emitted in this compilation
// unit to keep idempotency at the SCSS layer. Note: this only
// dedupes WITHIN a single compiled file — see "Edge cases" for the
// cross-file story (which is solved by route-segment scoping anyway).
$_google-fonts-loaded: () !default;

// Emit a Google Fonts @import for ONE family. Lives at the top of the
// compiled CSS bundle that imports it. Idempotent within the same
// compilation unit.
@mixin font-face-google(
  $family,
  $weights: (400),
  $italics: false,
  $display: swap
) {
  @if not list.index($_google-fonts-loaded, $family) {
    $_google-fonts-loaded: list.append($_google-fonts-loaded, $family) !global;

    $name: string.unquote(string.replace($family, ' ', '+'));

    // Build the wght axis fragment.
    $wght: '';
    @each $w in $weights { $wght: '#{$wght};#{$w}'; }
    $wght: string.slice($wght, 2); // drop leading ';'

    $axis: if($italics, 'ital,wght@0,#{$wght};1,#{$wght}', 'wght@#{$wght}');

    // The @import MUST appear before any rule. Sass hoists @import
    // emitted from a mixin to the top of the output file, which is
    // exactly what we want.
    @import url('https://fonts.googleapis.com/css2?family=#{$name}:#{$axis}&display=#{$display}');
  }
}

// Self-hosted variant — stretch goal. Author drops a woff2 in /public,
// passes the path. We emit a real @font-face, no network round-trip.
@mixin font-face-local(
  $family,
  $src,                  // '/fonts/pacifico.woff2'
  $weight: 400,
  $style: normal,
  $display: swap
) {
  @font-face {
    font-family: $family;
    src: url($src) format('woff2');
    font-weight: $weight;
    font-style: $style;
    font-display: $display;
  }
}
```

The existing `font()` mixin already accepts `$family` (line 165 of
`_mixins.scss`), so the apply side is free. We are only adding the
*load* primitive.

## Rationale

The brief is a one-off page, so the design pivot is: **make the font's
delivery scope match the font's usage scope.** Don't add it to
`public/theme.css` — that's the global stylesheet linked from the root
layout; every visit to every page would pay the download. Instead, put
the `@import` inside a route-segment CSS Module, where Next 15
fingerprints the file, splits it into its own chunk, and the App
Router only requests it when that route segment is rendered. The
network tab on `/about` will not show Pacifico; the network tab on
`/special-landing` will — exactly the user's intent, achieved by
piggybacking on the framework's existing code-splitting rather than
inventing a new mechanism.

The `@import url(...)` is emitted at compile time, so it lives in the
static export's CSS asset by the time the build runs `next export`.
There's no runtime injection, no `document.fonts.add(...)`, no
hydration boundary to cross. That keeps it compatible with React
Server Components (the module is just CSS) and with the static-export
build pipeline (no API route, no server runtime).

I deliberately did not reuse the theme's existing combined `@import`
URL. That URL is a contract between the six built-in themes; mutating
it for a one-off bloats every consumer's payload and re-introduces the
"global edit for one page" problem the README calls out.

## Edge cases

**Two pages using the same font.** Each page's CSS Module emits its
own `@import` at compile time. Sass-level dedupe (`$_google-fonts-loaded`)
only works within a single compilation unit, so each module gets one
copy of the URL. That's fine — the browser dedupes the actual font
download by URL at the network layer (one HTTP request, served from
cache for the second page). The CSS bytes are duplicated (~120 bytes
per occurrence), which is below any reasonable budget. If we later
care, a project-level partial (e.g. `_fonts.scss`) can centralize the
calls and dedupe at source.

**Self-hosted font file.** Use `font-face-local()`. The `@font-face`
rule emits into the compiled module CSS, scoped to the same route
segment as the `@import` variant. Same network-scoping property: the
`/fonts/pacifico.woff2` file is fetched only when the page that
references it is rendered. (The file itself sits in `/public` and is
always reachable, but no browser fetches it without a CSS rule
pointing at it.)

**Conflict with `--font-display`.** Non-issue if the consumer uses the
mixin as written, because the apply side passes `$family` directly and
bypasses tokens entirely. If they instead want to *re-point* the
theme's display token on the page (e.g. `:root { --font-display:
'Pacifico'; }` inside the module), that's a per-route override of a
contract token — legal, but loud, and they should know what they're
doing. The mixin pair makes the easy path safe and doesn't block the
loud path.

**Theme swap mid-page.** The font has nothing to do with `data-theme`,
so a theme swap doesn't disturb it. The `--font-display` token might
change underneath theme-styled headings, but the page's bespoke
`.headline` is hard-coded to Pacifico via the `$family` argument and
ignores the token. This is the correct behavior — the consumer
explicitly opted out of the contract for this one element.

**Is the @import emitted globally or scoped to a route bundle?**
Scoped. Next 15's App Router treats CSS Module imports as a route
segment dependency; webpack splits them into a per-route CSS chunk
keyed by the segment's `layout.tsx`/`page.tsx` import graph. The
`@import url(...)` lives inside that chunk and is requested via the
`<link>` tag the App Router injects when navigating to that route.

**Does the user pay the font download on every page?** No. The CSS
chunk containing the `@import` is only requested when the user lands
on (or client-navigates to) the route segment that imports the
module. On other pages, the chunk is neither loaded nor parsed, so
the browser never sees the Google Fonts URL and never fetches the
font.

**FOUT/FOIT behavior.** The mixin defaults to `&display=swap`, which
is FOUT — fallback renders immediately, Pacifico swaps in when ready.
For a one-off marketing page where the font *is* the design, that may
be wrong; the consumer can pass `$display: block` for a brief FOIT
(up to ~3s blocking, then fallback) or `$display: optional` for "use
it if it's already cached, otherwise don't bother." I picked `swap`
as the default because it's the only option that never causes a
visible blank state, which is the right default for a *system*
mixin even if it's not the right answer for every page.

**On `<link rel="preload">` for a one-off page.** I considered adding
a preload primitive and rejected it. Preload is a "this critical
asset is needed *now*" hint; it makes sense for the body font on
every page (root-layout-level concern), not a one-off page font.
Adding `<link rel="preload">` would require either (a) raw `<head>`
children in `layout.tsx` — which the comment in `layout.tsx:33` says
we explicitly avoid for hydration safety — or (b) `<head>` injection
inside the page component, which Next 15 supports via the metadata
API but not for `rel="preload"` of fonts cleanly. The `&display=swap`
default already absorbs the latency cost. If a consumer's profiling
shows preload would help, they can drop a `<link>` tag in their
page-level metadata; not worth a system primitive.

**On `next/font`.** Out of scope for this experiment. `next/font` is
a Babel/SWC-time codegen that returns a className-bearing object —
gorgeous DX inside React, but it lives in the JS module graph, not
the SCSS module graph, so we can't call it from `@mixin font()`. A
consumer who already uses `next/font` for their global body font can
absolutely use it on this page too; my mixin is for the SCSS-driven
authoring path that this design system is built around. Worth
mentioning in the install docs as the "alternate path for React-only
projects."

## Tradeoffs

**Gave up:** A single-mixin API. The README's option A
(`@include font-family('Pacifico', cursive)` does both load and apply)
is more elegant on the surface, but it conflates two concerns —
*declaring a font exists* and *applying it to an element* — and that
conflation breaks down the moment a page uses the font on two
selectors (do you re-load on the second selector? deduplicate at the
mixin level? confusing). Splitting into `font-face-google()` (load,
called once) and `font(..., $family: ...)` (apply, called per
selector) maps cleanly to how CSS itself thinks about
`@font-face` vs. `font-family`, and it composes with the existing
`font()` mixin without modification.

**Gave up:** Cross-route dedupe. If two routes load Pacifico, the CSS
bytes for the `@import url(...)` line are duplicated across two
chunks. The font *download* is deduped by the browser, so the user
pays nothing extra at the network layer — but if you build the same
font into 50 routes, you've spent ~6KB of CSS bytes total on
duplicate import lines. Acceptable given the scoping benefit on the
common case (the *one-off* page).

**Gave up:** Preload as a default. A one-off page that depends on a
specific font might want LCP-tier prioritization; my default uses
`display=swap` and accepts the FOUT. A consumer who profiles can
upgrade.

**Gained:** True route-scoped delivery. On `/about`, Pacifico is not
in the network tab, not in the parsed CSS, not in `document.fonts`.
That is the actual definition of "one-off" and it falls out of the
framework's existing CSS-Module + App-Router behavior — no custom
runtime, no FOUC script, no hydration boundary, no data-theme
interaction.

**Gained:** Zero changes to `public/theme.css`. The theme contract
(the combined `@import` at line 41, the per-theme `--font-*` tokens)
is untouched. A consumer adding a one-off font cannot accidentally
break a theme swap because the load primitive lives outside the
contract entirely.
