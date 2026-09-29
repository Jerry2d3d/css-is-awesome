import Link from "next/link";
import Example from "@/components/Example";
import Button from "@/components/Button";
import Card from "@/components/Card";

export default function DocsPage() {
  return (
    <>
      <h1>Get started in 5 minutes</h1>
      <p className="lead">
        Paste one HTML snippet, open it in a browser, and you are looking at a
        themed page. No build step, no config, no framework. When you are ready
        to re-skin, you change exactly one line.
      </p>

      <h2 id="minimum-setup">Minimum setup</h2>
      <p>
        Prerequisites: any modern browser. No Node, no bundler, no build step.
        The stylesheets below are served from jsDelivr, auto-mirrored from the
        npm package — theme first so the base can read its tokens.
      </p>
      <Example>
        <Example.Code><span className="tok-sel">{"<!doctype html>"}</span>
{"\n"}<span className="tok-sel">{"<html"}</span> <span className="tok-prop">lang</span>=<span className="tok-val">"en"</span><span className="tok-sel">{">"}</span>
{"\n"}<span className="tok-sel">{"<head>"}</span>
{"\n"}  <span className="tok-sel">{"<meta"}</span> <span className="tok-prop">charset</span>=<span className="tok-val">"utf-8"</span><span className="tok-sel">{">"}</span>
{"\n"}  <span className="tok-sel">{"<title>"}</span>Hello, sketchbook<span className="tok-sel">{"</title>"}</span>
{"\n"}  <span className="tok-sel">{"<link"}</span> <span className="tok-prop">rel</span>=<span className="tok-val">"stylesheet"</span> <span className="tok-prop">href</span>=<span className="tok-val">"https://cdn.jsdelivr.net/npm/css-is-awesome@1/public/themes/sketchbook-light/theme.css"</span><span className="tok-sel">{">"}</span>
{"\n"}  <span className="tok-sel">{"<link"}</span> <span className="tok-prop">rel</span>=<span className="tok-val">"stylesheet"</span> <span className="tok-prop">href</span>=<span className="tok-val">"https://cdn.jsdelivr.net/npm/css-is-awesome@1/dist/css-is-awesome.min.css"</span><span className="tok-sel">{">"}</span>
{"\n"}<span className="tok-sel">{"</head>"}</span>
{"\n"}<span className="tok-sel">{"<body>"}</span>
{"\n"}  <span className="tok-sel">{"<main"}</span> <span className="tok-prop">class</span>=<span className="tok-val">"cia-mx-auto cia-p-6 cia-flex-col cia-gap-4"</span><span className="tok-sel">{">"}</span>
{"\n"}    <span className="tok-sel">{"<h1>"}</span>Hello, sketchbook<span className="tok-sel">{"</h1>"}</span>
{"\n"}    <span className="tok-sel">{"<p"}</span> <span className="tok-prop">class</span>=<span className="tok-val">"cia-text-text-secondary"</span><span className="tok-sel">{">"}</span>Swap the theme file and this page re-skins.<span className="tok-sel">{"</p>"}</span>
{"\n"}  <span className="tok-sel">{"</main>"}</span>
{"\n"}<span className="tok-sel">{"</body>"}</span>
{"\n"}<span className="tok-sel">{"</html>"}</span></Example.Code>
      </Example>
      <p>
        Save that as <code>index.html</code>, open it — you are done. That is
        the entire 1-minute track.
      </p>
      <p>
        Those classes are <strong>utilities</strong> — spacing, layout, text and
        animation. There are 746 of them and they are the whole of what a
        stylesheet drop-in gives you, alongside the tokens and resets.{" "}
        <strong>There are no component classes</strong>: no{" "}
        <code>.cia-btn</code>, no <code>.cia-card</code>. Components come from
        mixins, which need a Sass build — that is the next section — or from the{" "}
        <Link href="/docs/recipes/bare-tags">bare-tags recipe</Link>, which
        styles ordinary <code>&lt;button&gt;</code> and{" "}
        <code>&lt;table&gt;</code> elements with no classes at all.
      </p>

      <h2 id="first-themed-element">Your first themed element</h2>
      <p>
        Every element in the system reads from the active theme&apos;s tokens.
        Here is a button and a card rendered live on this page, followed by the
        SCSS that produced them — this is the real source of the two components
        above, not a paraphrase. The class names are ours; cia supplies only the
        mixin.
      </p>
      <Example>
        <Example.Preview style={{ display: "grid", gap: "16px" }}>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Button variant="primary" href="#">Get started</Button>
            <Button variant="outline" href="#">Read the docs</Button>
          </div>
          <Card title="Warm paper, sumi ink">
            The card inherits its paper colour, border and serif title from the
            active theme. Swap the theme and this block re-skins without a
            single markup change.
          </Card>
        </Example.Preview>
        <Example.Code><span className="tok-com">{"// Button.module.scss"}</span>
{"\n"}<span className="tok-sel">@use</span> <span className="tok-val">&apos;css-is-awesome/scss/components/buttons&apos;</span> <span className="tok-prop">as</span> <span className="tok-val">m</span>;
{"\n"}
{"\n"}<span className="tok-sel">.primary</span> {"{"} <span className="tok-prop">@include</span> <span className="tok-val">m.btn(primary)</span>; {"}"}
{"\n"}<span className="tok-sel">.outline</span> {"{"} <span className="tok-prop">@include</span> <span className="tok-val">m.btn(outline)</span>; {"}"}
{"\n"}
{"\n"}<span className="tok-com">{"// Card.module.scss"}</span>
{"\n"}<span className="tok-sel">@use</span> <span className="tok-val">&apos;css-is-awesome/scss/components/data&apos;</span> <span className="tok-prop">as</span> <span className="tok-val">d</span>;
{"\n"}
{"\n"}<span className="tok-sel">.card</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">d.card-base($border: true)</span>;
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">d.card-interactive</span>;
{"\n"}{"}"}</Example.Code>
      </Example>

      <h2 id="three-tiers">Three bundle tiers</h2>
      <p>
        Pick the smallest bundle that covers your needs — they all read the
        same theme tokens, so you can start with <code>core</code> and graduate
        to <code>full</code> later without changing markup.
      </p>
      <ul>
        <li>
          <strong>core</strong> — <strong>2.4 KB gzipped</strong>. Tokens (CSS
          custom properties) and base resets only. The minimum to use the
          system; bring your own components.
        </li>
        <li>
          <strong>utilities</strong> — <strong>4.1 KB gzipped</strong>. Every{" "}
          <code>cia-*</code> utility class — spacing, typography, layout,
          color, flex/grid helpers. Composes with your own component CSS.
        </li>
        <li>
          <strong>full</strong> — <strong>7.96 KB gzipped</strong>. Core plus
          all 746 utilities in one file. The drop-in default; what the CDN
          snippet above ships. It does <em>not</em> add component classes —
          there are none — so the difference between{" "}
          <code>core</code> and <code>full</code> is the utilities and nothing
          else.
        </li>
      </ul>
      <p>
        The <Link href="/compare">/compare page</Link> shows these sizes next
        to Tailwind&apos;s and Bootstrap&apos;s equivalents.
      </p>

      <h2 id="utility-or-mixin">Utility class, or SCSS mixin</h2>
      <p>
        The same button is reachable two ways. If you have no build step, drop
        the utility class on a tag. If you have a Sass build, call the mixin
        from your own selector — every variant the utility class ships rides
        through to the mixin and back.
      </p>
      <Example>
        <Example.Preview style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Button variant="primary" href="#">Via the mixin</Button>
          <Button variant="outline" href="#">Same mixin, other variant</Button>
        </Example.Preview>
        <Example.Code><span className="tok-com">{"<!-- Tier 3: no classes at all - the bare-tags recipe styles the element -->"}</span>
{"\n"}<span className="tok-sel">{"<button>"}</span>Get started<span className="tok-sel">{"</button>"}</span>
{"\n"}
{"\n"}<span className="tok-com">{"// Tier 2: same output, via the SCSS mixin"}</span>
{"\n"}<span className="tok-sel">@use</span> <span className="tok-val">&apos;css-is-awesome/scss/components/buttons&apos;</span> <span className="tok-prop">as</span> <span className="tok-val">b</span>;
{"\n"}
{"\n"}<span className="tok-sel">.hero-cta</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">b.btn(primary)</span>;
{"\n"}{"}"}</Example.Code>
      </Example>

      <h2 id="swap-the-theme">Swap the theme</h2>
      <p>
        Themes are single files. The base stylesheet never hard-codes a colour,
        a radius or a font — it reads them from CSS custom properties the theme
        defines. Re-skinning the entire site is one <code>&lt;link&gt;</code>{" "}
        change:
      </p>
      <Example>
        <Example.Code><span className="tok-com">{"/* before — sketchbook */"}</span>
{"\n"}<span className="tok-sel">{"<link"}</span> <span className="tok-prop">rel</span>=<span className="tok-val">"stylesheet"</span> <span className="tok-prop">href</span>=<span className="tok-val">"https://cdn.jsdelivr.net/npm/css-is-awesome@1/public/themes/sketchbook-light/theme.css"</span><span className="tok-sel">{">"}</span>
{"\n"}
{"\n"}<span className="tok-com">{"/* after — press */"}</span>
{"\n"}<span className="tok-sel">{"<link"}</span> <span className="tok-prop">rel</span>=<span className="tok-val">"stylesheet"</span> <span className="tok-prop">href</span>=<span className="tok-val">"https://cdn.jsdelivr.net/npm/css-is-awesome@1/public/themes/press/theme.css"</span><span className="tok-sel">{">"}</span></Example.Code>
      </Example>
      <p>
        The <strong>ThemePicker</strong> in the site header does exactly that
        live — pick another theme from the menu and every preview on this page,
        including the button and card above, re-skins as you scroll. No reload,
        no rebuild. That is the entire theme contract.
      </p>

      <h2 id="what-next">What next</h2>
      <ul>
        <li>
          <Link href="/docs/install">Install</Link> — npm, Vite, Next.js and
          Sass entry points for build-step projects.
        </li>
        <li>
          <Link href="/docs/tokens">Tokens</Link> — live swatches, type scale,
          spacing and radii for the active theme. Pick a new theme; the
          gallery reskins.
        </li>
        <li>
          <Link href="/docs/utilities">Utilities</Link> — the{" "}
          <code>cia-</code> utility classes for spacing, layout and type.
        </li>
        <li>
          <Link href="/docs/animation">Animation</Link> — the motion tokens
          and the named keyframes the system ships.
        </li>
        <li>
          <Link href="/themes">Themes editor</Link> — the live theme browser
          and editor for shipped themes.
        </li>
        <li>
          <Link href="/playground">Playground</Link> — write SCSS with cia
          mixins and see it render live against any theme, in your browser;
          share it as a link. Every recipe has a “Try in playground” button.
        </li>
        <li>
          <Link href="/docs/authoring/themes">Authoring themes</Link> — the
          token contract and validator for writing your own.
        </li>
        <li>
          <Link href="/compare">Compare</Link> — bundle sizes and feature
          parity with Tailwind and Bootstrap.
        </li>
      </ul>
    </>
  );
}
