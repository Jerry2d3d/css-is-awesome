import type { Metadata } from "next";
import Link from "next/link";
import Example from "@/components/Example";

export const metadata: Metadata = {
  title: "Mobile — css-is-awesome",
  description:
    "The cia mobile playbook: two zero-JS layouts (app layout with a bottom dock + sheets, flex layout with a fluid grid shell + hamburger drawer), named grid areas, anchored dropdowns, breakpoint helpers, and the practical lessons — tap targets, safe areas, table restacking.",
};

export default function DocsMobilePage() {
  return (
    <>
      <h1>Mobile — the playbook</h1>
      <p className="lead">
        cia ships two mobile layouts, and both are pure CSS —{" "}
        <strong>CSS Grid for structure, the native Popover API for
        interaction, zero JavaScript</strong>. The{" "}
        <strong>app layout</strong> is for tool-like pages: a fixed bottom
        dock in thumb reach whose slots open slide-up sheets — the cia docs
        site itself runs this on phones. The <strong>flex layout</strong> is
        one fluid page shell that moves with the shape and size of the
        screen: Nav / Main / Footer as named grid areas, with a hamburger
        and drawer below the breakpoint. Pick one per page; this playbook
        covers both, plus the doctrine and lessons behind them.
      </p>

      <h2 id="doctrine">The doctrine: Grid is the skeleton, Flex is the quick moves</h2>
      <p>
        Three levels, strictly:
      </p>
      <ol>
        <li>
          <strong>The page shell is CSS Grid with landmark-named areas</strong> —
          the body&apos;s areas <em>are</em> the document&apos;s landmarks
          (<code>nav</code>, <code>main</code>, <code>footer</code>), so the
          area map reads like the page and screen readers get the structure
          for free.
        </li>
        <li>
          <strong>The doctrine scales inward</strong> — any control-dense
          region (a docs article, a selections rail, a dashboard) gets its own
          named-area grid, and that grid&apos;s <code>gap</code> is the
          region&apos;s entire vertical rhythm. No child carries rhythm
          margins.
        </li>
        <li>
          <strong>Flex lives at the leaves</strong> — simple rows you flip
          with one command
          (<code>{"@include cia.flex($direction: column)"}</code>). Flex
          arranges the contents of a slot the grid gave it; it never builds
          the page.
        </li>
      </ol>
      <p>
        And the mobile consequence:{" "}
        <strong>mobile is a different area map, not margin overrides.</strong>{" "}
        You declare where every region sits at each width — the browser does
        the rest. <code>cia.page-layout()</code> gives you the full-viewport
        shell with one include:
      </p>
      <Example>
        <Example.Code>{`@use 'css-is-awesome/api' as cia;

// Preset shells: default | sidebar-left | sidebar-right | holy-grail
body            { @include cia.page-layout(sidebar-left); }
body > header   { @include cia.page-header; }
body > aside    { @include cia.page-sidebar; }
body > main     { @include cia.page-main; }
body > footer   { @include cia.page-footer; }`}</Example.Code>
      </Example>
      <p>
        Every preset is a viewport-height grid (<code>100dvh</code>, sticky
        footer for free) and <strong>multi-column presets auto-flatten to a
        single column below the collapse breakpoint</strong> (<code>md</code>{" "}
        by default; pass <code>$collapse-at</code> to change it). On a phone,{" "}
        <code>sidebar-left</code> becomes header → sidebar → main → footer
        stacked — no extra code.
      </p>
      <p>
        When the presets don&apos;t fit, build the map from your own region
        names with <code>cia.layout()</code> and place children with{" "}
        <code>cia.area()</code>:
      </p>
      <Example>
        <Example.Code>{`// A docs page: sidebar | content | toc on desktop
.docs-shell {
  @include cia.layout((sidebar content toc), $tracks: 16rem 1fr 12rem);

  // A different area map on mobile — content first, toc gone
  @include cia.media-down(md) {
    grid-template-columns: 1fr;
    grid-template-areas: "content" "sidebar";
  }
}

.docs-sidebar { @include cia.area(sidebar); }
.docs-content { @include cia.area(content); }
.docs-toc     { @include cia.area(toc); }`}</Example.Code>
      </Example>
      <p>Two facts about area maps that save you an afternoon of debugging:</p>
      <ol>
        <li>
          <strong>Omitting an area from the mobile map does NOT hide the
          element.</strong> A grid child whose named area doesn&apos;t exist
          in the current template is auto-placed — it still renders,
          somewhere you didn&apos;t plan. Pair the omission with{" "}
          <code>display: none</code>:
          <Example>
            <Example.Code>{`.docs-toc {
  @include cia.area(toc);
  @include cia.mobile-only { display: none; }  // omitted from the map ≠ hidden
}`}</Example.Code>
          </Example>
        </li>
        <li>
          <strong>Multi-column presets auto-flatten.</strong> You only write
          a custom mobile map when the stacking <em>order</em> should differ
          from the desktop reading order (or a region should disappear).
          Otherwise <code>cia.page-layout()</code> already collapsed it for
          you.
        </li>
      </ol>

      <h2 id="app-layout">App layout — dock + sheets</h2>
      <p>
        For tool-like pages — dashboards, editors, the docs site itself — a
        top nav is the worst place for navigation on a phone: it&apos;s the
        one region a thumb can&apos;t reach. The app layout moves navigation
        to a <strong>fixed bottom dock</strong> whose slots open{" "}
        <strong>slide-up sheets</strong>. The dock is a CSS grid with equal
        tracks per slot; the sheets are Popover-API panels, so the browser
        manages open/close state, <kbd>Esc</kbd>, light-dismiss and{" "}
        <code>aria-expanded</code> — zero JavaScript.
      </p>
      <Example>
        <Example.Code>{`<nav class="quick-dock" aria-label="Quick menu">
  <button popovertarget="docs-sheet">Docs</button>
  <button popovertarget="themes-sheet">Themes</button>
  <a href="/playground" aria-current="page">Playground</a>
</nav>

<section id="docs-sheet" class="quick-sheet" popover aria-label="Docs">
  …links…
</section>`}</Example.Code>
      </Example>
      <Example>
        <Example.Code>{`@use 'css-is-awesome/api' as cia;

.quick-dock {
  @include cia.dock(3);              // 3 equal grid tracks, fixed to the bottom,
                                     // border on top, safe-area padding below
  > button,
  > a { @include cia.dock-item; }    // 56px targets; lights up on
                                     // [aria-expanded="true"] and [aria-current]
}

.quick-sheet {
  @include cia.sheet;                // bottom drawer preset: slides up, caps at
                                     // 72dvh, rounded shoulders, safe-area padding
}`}</Example.Code>
      </Example>
      <p>
        Note what&apos;s absent: no <code>.open</code> class, no click
        handler. The browser sets <code>aria-expanded</code> on any{" "}
        <code>popovertarget</code> invoker, and <code>dock-item</code>{" "}
        styles the active state off that attribute (and off{" "}
        <code>aria-current</code> for routed slots) — semantic state lives
        in ARIA, never a class. <code>cia.sheet($max: 72dvh)</code> caps the
        panel so the page stays visible behind it; <code>dvh</code> survives
        mobile URL-bar resizing.
      </p>
      <p>
        The full pattern — markup, sheet contents, focus notes — is the{" "}
        <Link href="/docs/recipes/bottom-nav">bottom-nav recipe</Link>.
      </p>

      <h2 id="flex-layout">Flex layout — shell + hamburger + drawer</h2>
      <p>
        For content pages — marketing, blogs, docs prose — you want one
        fluid shell that moves with the shape and size of the screen. The
        flex layout is <code>cia.page-layout()</code> from the doctrine
        section plus a navigation swap below the breakpoint: inline links on
        desktop, a <strong>hamburger button opening a drawer</strong> on
        mobile. Same zero-JS mechanics — the drawer is a popover, the
        hamburger morphs to an X off the browser-managed{" "}
        <code>[aria-expanded]</code>.
      </p>
      <Example>
        <Example.Code>{`<header>
  <a href="/">Acme</a>
  <nav class="site-links" aria-label="Site">…inline links…</nav>
  <button class="menu-button" popovertarget="site-menu" aria-label="Menu">
    <span></span><span></span><span></span>
  </button>
</header>

<nav id="site-menu" class="site-drawer" popover aria-label="Site menu">
  …the same links, stacked…
</nav>`}</Example.Code>
      </Example>
      <Example>
        <Example.Code>{`@use 'css-is-awesome/api' as cia;

body          { @include cia.page-layout; }     // header / main / footer shell
body > header { @include cia.page-header; }
body > main   { @include cia.page-main; }
body > footer { @include cia.page-footer; }

// Inline links on desktop, hamburger below md — swap, don't duplicate
.site-links  { @include cia.mobile-only { display: none; } }
.menu-button {
  @include cia.hamburger;            // three bars; morphs to X on
                                     // [aria-expanded="true"] — browser-managed
  @include cia.tablet { display: none; }
}

.site-drawer {
  @include cia.drawer($side: start); // slides in from the reading-direction
                                     // start edge; Esc + light-dismiss free
}`}</Example.Code>
      </Example>
      <p>
        <code>cia.drawer()</code> takes logical sides —{" "}
        <code>start | end | top | bottom</code> — so an RTL locale mirrors
        the drawer with no extra code. <code>$size</code> sets the panel
        width (or height for top/bottom). If you can&apos;t use a popover
        (a <code>:checked</code> checkbox fallback, say), the morph is
        available alone as <code>cia.hamburger-open</code>:
      </p>
      <Example>
        <Example.Code>{`.menu-check:checked + .menu-button { @include cia.hamburger-open; }`}</Example.Code>
      </Example>
      <p>
        The full pattern is the{" "}
        <Link href="/docs/recipes/mobile-nav">mobile-nav recipe</Link>.
      </p>

      <h2 id="dropdowns">Dropdowns — things take the space they&apos;re in</h2>
      <p>
        The house rule for every interactive surface on a phone:{" "}
        <strong>it fills the container it lives in</strong> — 100% of its
        column, inside the page&apos;s existing padding and formatting.
        Never edge-to-edge past the gutters, never a floating mid-width
        popup. For a dropdown that means the trigger stretches to 100%
        with <code>justify-content: space-between</code> (label left,
        affordance right), and the menu opens{" "}
        <strong>1px under the trigger, at the trigger&apos;s exact
        width</strong> — flipping above it when it would run off the
        bottom of the screen.
      </p>
      <p>
        One wrinkle: a popover menu lives in the top layer, so it
        can&apos;t size to its container directly —{" "}
        <code>width: 100%</code> means nothing up there. CSS anchor
        positioning closes the gap: name the trigger an anchor, pin the
        menu&apos;s inline edges to it, and keep viewport-minus-gutters as
        the fallback for engines without anchors:
      </p>
      <Example>
        <Example.Code>{`@use 'css-is-awesome/api' as cia;

.nav-trigger {
  @include cia.mobile-only {
    display: flex;
    inline-size: 100%;               // the space it's in: the whole column
    justify-content: space-between;  // label left, affordance right
    anchor-name: --nav-trigger;
  }
}

.nav-menu {
  @include cia.mobile-only {
    @include cia.dropdown;           // zero-JS popover menu

    // Must match the mixin's &[popover] specificity — its inset reset
    // wins over a bare class otherwise.
    &[popover] {
      inset-inline: cia.space(4);    // no-anchor fallback: viewport minus gutters
      min-width: 0;
      width: auto;                   // the UA's [popover] { width: fit-content }
                                     // otherwise beats both inline edges

      @supports (anchor-name: --a) {
        position-anchor: --nav-trigger;
        inset-inline: anchor(start) anchor(end);     // the trigger's width
        inset-block-start: calc(anchor(end) + 1px);  // 1px below the trigger
        position-try-fallbacks: flip-block;          // flip above at screen bottom
      }

      a { white-space: normal; overflow-wrap: anywhere; }  // long labels wrap
    }

    a { @include cia.dropdown-item; }
  }
}`}</Example.Code>
      </Example>
      <p>
        Two of those lines are load-bearing in ways that aren&apos;t
        obvious. The <code>&amp;[popover]</code> nesting isn&apos;t style —{" "}
        <code>cia.dropdown</code> resets the UA popover defaults
        (<code>inset: unset</code>) at that specificity, so a bare class
        loses to it. And <code>width: auto</code> looks redundant but
        isn&apos;t: the UA stylesheet says{" "}
        <code>[popover] {"{"} width: fit-content {"}"}</code>, which beats
        both inline insets — without the override the menu hugs its
        content instead of matching the trigger. <code>cia.dropdown</code>{" "}
        also guards its own closed state (the menu&apos;s{" "}
        <code>display: flex</code> is re-asserted only under{" "}
        <code>:popover-open</code>), so it never renders permanently open
        on popover markup.
      </p>
      <p>
        Inside the menu, long labels <strong>wrap</strong> — never clip,
        never scroll sideways. The one deliberate exception to the
        take-the-space rule is <strong>code</strong>: on phones a code
        block may run off into a horizontal scroll <em>inside its own
        box</em> (<code>white-space: pre; overflow-x: auto</code>) — never
        wrapped or shrunk to fit, and never widening the page; the copy
        button carries usability for long lines. And a consumer-level JS
        nicety is allowed: real links close the popover by navigating, so
        if yours don&apos;t (soft navigation, demo links), one delegated
        click handler calling <code>hidePopover()</code> is all it takes.
        The Dashboard shell demo in the{" "}
        <Link href="/docs/recipes">recipes gallery</Link> is the reference
        implementation of the whole pattern.
      </p>

      <h2 id="breakpoints">Breakpoint helpers</h2>
      <p>
        Both layouts key off the same scale: <code>sm</code> 640px,{" "}
        <code>md</code> 768px, <code>lg</code> 1024px. The helpers are
        content blocks:
      </p>
      <Example>
        <Example.Code>{`.site-links {
  @include cia.media-down(md) { display: none; }  // below a breakpoint
}
.toc         { @include cia.mobile-only { display: none; } }  // < md
.side-panel  { @include cia.tablet  { /* ≥ md */ } }
.mega-menu   { @include cia.desktop { /* ≥ lg */ } }`}</Example.Code>
      </Example>
      <p>
        cia is <strong>direction-agnostic</strong>: <code>media-down()</code>{" "}
        for desktop-first authoring, <code>tablet</code> /{" "}
        <code>desktop</code> for mobile-first — both are one line. The real
        responsive work happens at the component level, with the area maps
        above.
      </p>

      <h2 id="lessons">Mobile lessons</h2>
      <p>
        Five things that separate a page that works on a phone from a page
        that merely fits on one.
      </p>

      <h3 id="tap-targets">Tap targets: 44px minimum</h3>
      <p>
        Fingers are not cursors. cia&apos;s interactive mixins already
        honor <code>--touch-target-min</code> (44px —{" "}
        <code>cia.hamburger</code> defaults to it; <code>cia.dock-item</code>{" "}
        gives 56px). For your own controls, enforce it the same way:
      </p>
      <Example>
        <Example.Code>{`.icon-action {
  min-width: var(--touch-target-min, 44px);
  min-height: var(--touch-target-min, 44px);
}`}</Example.Code>
      </Example>

      <h3 id="dock-clearance">Clear the dock</h3>
      <p>
        A fixed bottom dock floats over the page — the last paragraph of
        scrollable content will hide behind it unless the scroll container
        reserves room. Pad past the dock <em>and</em> the home-indicator
        safe area:
      </p>
      <Example>
        <Example.Code>{`main {
  @include cia.mobile-only {
    padding-block-end: calc(6rem + env(safe-area-inset-bottom));
  }
}`}</Example.Code>
      </Example>

      <h3 id="table-cards">Wide tables restack into cards</h3>
      <p>
        A six-column table cannot shrink to 375px; it can only overflow or
        lie. Below the breakpoint, restack each row into a labeled card:
        the cells go block-level, and each cell prints its own column
        header from a <code>data-label</code> attribute in the markup
        (<code>&lt;td data-label=&quot;Price&quot;&gt;$24&lt;/td&gt;</code>):
      </p>
      <Example>
        <Example.Code>{`.plans-table {
  @include cia.mobile-only {
    thead { display: none; }        // headers move into the cells
    tr {
      display: block;
      border: 1px solid cia.color(border-default);
      border-radius: cia.radius(md);
      margin-block-end: cia.space(4);
    }
    td {
      display: flex;
      justify-content: space-between;
      padding: cia.space(2) cia.space(4);

      &::before {                   // the label rides in from the markup
        content: attr(data-label);
        font-weight: cia.font-weight(medium);
      }
    }
  }
}`}</Example.Code>
      </Example>

      <h3 id="icon-only">Icon-only controls keep their name</h3>
      <p>
        Narrow widths tempt you to drop button text and keep the icon. Fine
        — but the accessible name must survive. An icon-only control
        without <code>aria-label</code> is announced as
        &quot;button&quot;, full stop:
      </p>
      <Example>
        <Example.Code>{`<!-- text hidden below md; the name stays -->
<button class="search-button" aria-label="Search">
  <svg aria-hidden="true">…</svg>
  <span class="search-label">Search</span>
</button>`}</Example.Code>
      </Example>
      <Example>
        <Example.Code>{`.search-label { @include cia.mobile-only { display: none; } }`}</Example.Code>
      </Example>
      <p>
        The dock example above follows the same rule: slots that show only
        an icon at narrow widths carry <code>aria-label</code>.
      </p>

      <h3 id="spacing-trap">The spacing-scale trap</h3>
      <p>
        Mobile spacing tweaks mean lots of <code>cia.space()</code> calls —
        so know the scale. It&apos;s numbered <code>1</code>–<code>9</code>{" "}
        and <strong>nonlinear</strong>: <code>5</code> is 24px,{" "}
        <code>7</code> is 48px, <code>8</code> is 64px. Two consequences:
        don&apos;t guess that <code>8</code> means 32px (that&apos;s{" "}
        <code>6</code>), and don&apos;t pass a key that isn&apos;t on the
        scale — <strong>unknown keys pass through raw and silently
        invalidate the declaration</strong>:
      </p>
      <Example>
        <Example.Code>{`padding-block-end: cia.space(7);   // 48px — on the scale ✓
padding-block-end: cia.space(12);  // emits \`padding-block-end: 12\` —
                                   // invalid CSS, dropped by the browser,
                                   // no compile error to warn you`}</Example.Code>
      </Example>

      <h2 id="which">Which layout for which page?</h2>
      <ul>
        <li>
          <strong>App layout</strong> (<code>cia.dock</code> +{" "}
          <code>cia.sheet</code>) — the page is a tool: persistent actions,
          switching between panels, thumb-reach navigation. Recipe:{" "}
          <Link href="/docs/recipes/bottom-nav">bottom-nav</Link>.
        </li>
        <li>
          <strong>Flex layout</strong> (<code>cia.page-layout</code> +{" "}
          <code>cia.hamburger</code> + <code>cia.drawer</code>) — the page
          is content: one shell, fluid regions, navigation that gets out of
          the way. Recipe:{" "}
          <Link href="/docs/recipes/mobile-nav">mobile-nav</Link>.
        </li>
      </ul>
      <p>
        Either way the doctrine holds: stack by named grid areas, style
        state off ARIA, and ship no JavaScript for any of it.
      </p>
    </>
  );
}
