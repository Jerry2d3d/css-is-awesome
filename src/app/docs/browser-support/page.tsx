import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Browser support — css-is-awesome",
  description:
    "The dated cia support matrix: the CIA Baseline every shipped feature requires (Chrome/Edge 120, Firefox 130, Safari 17.6), plus the progressive enhancements that layer on where supported — each with its documented fallback.",
};

export default function BrowserSupportPage() {
  return (
    <>
      <h1>Browser support</h1>
      <p className="lead">
        cia ships zero JavaScript, so its browser floor is set by the native
        primitives it rides — not by a polyfill budget. This page is the dated
        matrix: the <strong>CIA Baseline</strong> every shipped feature
        requires, and the <strong>progressive enhancements</strong> that layer
        on where supported, each with its fallback behaviour. Versions are
        stated conservatively. <em>As of 2026-09-05.</em>
      </p>

      <h2 id="cia-baseline">The CIA Baseline</h2>
      <p>
        The floor is anchored by the newest native primitive in the system: the
        zero-JS accordion&rsquo;s exclusive{" "}
        <code>{`<details name>`}</code> attribute, Baseline 2024. Every other
        shipped feature clears these versions with room to spare.
      </p>
      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Browser</th>
              <th>Minimum version</th>
              <th>Set by</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Chrome</td>
              <td>120 (Dec 2023)</td>
              <td>
                <code>{`<details name>`}</code> exclusive accordion
              </td>
            </tr>
            <tr>
              <td>Edge</td>
              <td>120 (Dec 2023)</td>
              <td>
                <code>{`<details name>`}</code> exclusive accordion
              </td>
            </tr>
            <tr>
              <td>Firefox</td>
              <td>130 (Sep 2024)</td>
              <td>
                <code>{`<details name>`}</code> — the newest hard requirement
                in the whole system
              </td>
            </tr>
            <tr>
              <td>Safari</td>
              <td>17.6 (Jul 2024)</td>
              <td>
                <code>{`<details name>`}</code> exclusive accordion
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        What that floor buys you — every feature below is used by shipped
        mixins and is fully supported in all four floor browsers:
      </p>
      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th>Baseline status</th>
              <th>Where cia uses it</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>{`<details name>`}</code>
              </td>
              <td>Baseline 2024 (Chrome 120, Firefox 130, Safari 17.6)</td>
              <td>
                <Link href="/docs/components/accordion">Accordion</Link> —
                sibling panels close natively, zero JS
              </td>
            </tr>
            <tr>
              <td>
                Popover API (<code>[popover]</code>,{" "}
                <code>:popover-open</code>)
              </td>
              <td>Baseline 2024 (Chrome 114, Firefox 125, Safari 17)</td>
              <td>
                <Link href="/docs/components/dropdown">Dropdown</Link>,{" "}
                <Link href="/docs/components/tooltip">tooltip</Link>, the{" "}
                <Link href="/docs/mobile">mobile toolkit</Link> (drawer, sheet,
                dock, hamburger), copy-button toast
              </td>
            </tr>
            <tr>
              <td>
                <code>{`<dialog>`}</code> + <code>::backdrop</code>
              </td>
              <td>Baseline 2022 (Chrome 37, Firefox 98, Safari 15.4)</td>
              <td>
                <Link href="/docs/components/modal">Modal</Link> — native focus
                trap, Escape, inert background
              </td>
            </tr>
            <tr>
              <td>
                <code>:has()</code>
              </td>
              <td>Baseline Dec 2023 (Chrome 105, Firefox 121, Safari 15.4)</td>
              <td>
                <Link href="/docs/components/tabs">Tabs</Link> — panel
                switching with no JS
              </td>
            </tr>
            <tr>
              <td>
                Container queries (<code>container-type</code>,{" "}
                <code>@container</code>)
              </td>
              <td>Baseline Feb 2023 (Chrome 105, Firefox 110, Safari 16)</td>
              <td>
                <code>container</code> / <code>contain</code> /{" "}
                <code>contain-down</code> / <code>contain-between</code>{" "}
                <Link href="/docs/mixins">mixins</Link>
              </td>
            </tr>
            <tr>
              <td>
                <code>subgrid</code>
              </td>
              <td>Baseline Sep 2023 (Chrome 117, Firefox 71, Safari 16)</td>
              <td>
                The <code>subgrid</code> layout mixin
              </td>
            </tr>
            <tr>
              <td>
                <code>color-mix()</code>
              </td>
              <td>Baseline mid-2023 (Chrome 111, Firefox 113, Safari 16.2)</td>
              <td>
                <code>states()</code> hover/active derivation; button and
                stepper state shades
              </td>
            </tr>
            <tr>
              <td>
                <code>grid-template-areas</code>
              </td>
              <td>Universal since 2017; Baseline since 2020</td>
              <td>The named-region page-layout engine (all four tiers)</td>
            </tr>
            <tr>
              <td>
                <code>dvh</code> viewport units
              </td>
              <td>Baseline late 2022 (Chrome 108, Firefox 101, Safari 15.4)</td>
              <td>
                Layout shells; drawer and sheet height caps (survives the
                mobile URL-bar collapse)
              </td>
            </tr>
            <tr>
              <td>
                <code>:where()</code> / <code>:focus-visible</code>
              </td>
              <td>Baseline 2021 / 2022</td>
              <td>
                Zero-specificity bare-tag recipes; the shared{" "}
                <code>focus-ring</code> mixin
              </td>
            </tr>
            <tr>
              <td>
                <code>mask</code>
              </td>
              <td>
                Unprefixed in Chrome 120; Firefox 53, Safari 15.4 (cia also
                emits <code>-webkit-mask</code>)
              </td>
              <td>
                The <Link href="/docs/authoring/icons">icon system</Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Need to reach <em>below</em> the floor? The recipes document the
        swaps: the mobile-nav recipe includes a checkbox variant for engines
        without the Popover API, and the dialog recipe recommends a focus-trap
        library plus <code>[role=&quot;dialog&quot;]</code> where native{" "}
        <code>{`<dialog>`}</code> is unavailable.
      </p>

      <h2 id="progressive-enhancements">Progressive enhancements</h2>
      <p>
        These features layer on where the browser supports them. None of them
        is required for a working page — each row states exactly what happens
        without it.
      </p>
      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Enhancement</th>
              <th>Support (as of 2026-09-05)</th>
              <th>Used by</th>
              <th>Without it</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>@starting-style</code> +{" "}
                <code>transition-behavior: allow-discrete</code>
              </td>
              <td>Baseline Aug 2024 (Chrome 117, Firefox 129, Safari 17.5)</td>
              <td>
                Drawer and sheet slide-in/out (
                <Link href="/docs/mobile">mobile toolkit</Link>)
              </td>
              <td>
                The drawer opens and closes <strong>instantly</strong> instead
                of sliding — fully functional, just unanimated
              </td>
            </tr>
            <tr>
              <td>
                <code>light-dark()</code>
              </td>
              <td>Baseline May 2024 (Chrome 123, Firefox 120, Safari 17.5)</td>
              <td>
                Every colour token in the 7 paired (auto light/dark){" "}
                <Link href="/docs/authoring/themes">theme files</Link>;{" "}
                <code>states()</code> custom-colour derivation
              </td>
              <td>
                Auto light/dark switching needs it — on older engines
                (including Chrome 120–122) ship the pinned{" "}
                <code>-light</code> / <code>-dark</code> theme files instead,
                which use plain colours. Custom-colour buttons lose their
                derived hover/active shades and keep their resting colour
              </td>
            </tr>
            <tr>
              <td>
                CSS anchor positioning (<code>anchor-name</code>,{" "}
                <code>anchor()</code>, <code>position-area</code>)
              </td>
              <td>
                <strong>Not Baseline.</strong> Chrome/Edge 125+, Firefox 144+;
                Safari Technology Preview only
              </td>
              <td>
                The{" "}
                <Link href="/docs/recipes/anchor-positioning">
                  anchored-dropdown recipe
                </Link>{" "}
                and this site&rsquo;s own menus — the shipped mixins never
                emit it; positioning stays the consumer&rsquo;s call
              </td>
              <td>
                Behind <code>@supports (anchor-name: --a)</code> the menu hugs
                its trigger; without it the menu spans the{" "}
                <strong>viewport minus gutters</strong> (
                <code>inset-inline</code> fallback) instead of matching the
                trigger — still opens, still dismisses
              </td>
            </tr>
            <tr>
              <td>
                <code>@property</code> (opt-in{" "}
                <code>theme-properties</code> mixin)
              </td>
              <td>Baseline Jul 2024 (Chrome 85, Firefox 128, Safari 16.4)</td>
              <td>
                Animated theme-token transitions (
                <code>transition: --token</code>)
              </td>
              <td>
                Theme swaps <strong>snap</strong> instead of cross-fading;
                colours are still correct
              </td>
            </tr>
            <tr>
              <td>
                Style queries (<code>@container style()</code>)
              </td>
              <td>
                <strong>Not Baseline.</strong> Chrome 111+, Safari 18+; not in
                Firefox
              </td>
              <td>
                Suggested in the print docs for custom{" "}
                <code>--is-print</code> effects
              </td>
              <td>
                The custom print effect simply doesn&rsquo;t apply; the print
                mixins and size-based container queries are unaffected
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="how-we-decide">How we decide</h2>
      <p>
        cia is zero-JS by riding native primitives —{" "}
        <code>{`<details name>`}</code>, <code>{`<dialog>`}</code>,{" "}
        <code>[popover]</code> — so the floor is set by the primitives
        themselves, not by a transpiler target. When we adopt a newer
        primitive, the floor moves and this matrix gets re-dated; until then
        it doesn&rsquo;t.
      </p>
      <p>
        Enhancements always ship a fallback: in code where CSS can express it
        (the <code>@supports</code> gutter fallback for anchor positioning) or
        architecturally where it can&rsquo;t (the pinned{" "}
        <code>-light</code> / <code>-dark</code> theme files beside every
        paired theme). The cross-engine contract is enforced by the{" "}
        <Link href="/docs/testing">test suite</Link>, which exercises the
        platform features above in real browsers on every CI run.
      </p>
    </>
  );
}
