import Link from "next/link";
import Example from "@/components/Example";
import Button from "@/components/Button";

export default function ThreeTiersPage() {
  return (
    <>
      <h1>Three authoring tiers</h1>
      <p className="lead">
        css-is-awesome ships three ways to author the same components — drop-in
        classes, SCSS mixins, or zero-class bare tags. All three resolve to the
        same router mixin per component, so styling stays consistent across an
        app that mixes them.
      </p>

      <p>
        <strong>One router mixin per component. Three doors into it.</strong>{" "}
        That&rsquo;s the entire architecture. Add a variant to{" "}
        <code>btn(variant)</code> once and every tier picks it up.
      </p>

      <h2 id="tier-1">Tier 1 — Drop-in CSS + HTML</h2>
      <p>
        Two stylesheets, one class per element, ship. No build, no SCSS, no
        framework. Audience: designers, marketing pages, prototypes, anyone
        without a build step.
      </p>
      <Example>
        <Example.Preview style={{ display: "flex", gap: "var(--space-sm)", flexWrap: "wrap", alignItems: "center" }}>
          <Button variant="primary">Get started</Button>
          <Button variant="outline">Read docs</Button>
        </Example.Preview>
        <Example.Code><span className="tok-com">{"<!-- in your <head> -->"}</span>
{"\n"}<span className="tok-sel">{"<link"}</span> <span className="tok-prop">rel</span>=<span className="tok-val">"stylesheet"</span> <span className="tok-prop">href</span>=<span className="tok-val">"css-is-awesome.min.css"</span><span className="tok-sel">{">"}</span>
{"\n"}<span className="tok-sel">{"<link"}</span> <span className="tok-prop">rel</span>=<span className="tok-val">"stylesheet"</span> <span className="tok-prop">href</span>=<span className="tok-val">"theme-sketchbook-light.css"</span><span className="tok-sel">{">"}</span>
{"\n"}
{"\n"}<span className="tok-com">{"<!-- in your <body> -->"}</span>
{"\n"}<span className="tok-sel">{"<a"}</span> <span className="tok-prop">class</span>=<span className="tok-val">"cia-btn-primary"</span> <span className="tok-prop">href</span>=<span className="tok-val">"/start"</span><span className="tok-sel">{">"}</span>Get started<span className="tok-sel">{"</a>"}</span>
{"\n"}<span className="tok-sel">{"<a"}</span> <span className="tok-prop">class</span>=<span className="tok-val">"cia-btn-outline"</span> <span className="tok-prop">href</span>=<span className="tok-val">"/docs"</span><span className="tok-sel">{">"}</span>Read docs<span className="tok-sel">{"</a>"}</span>
{"\n"}<span className="tok-sel">{"<article"}</span> <span className="tok-prop">class</span>=<span className="tok-val">"cia-card"</span><span className="tok-sel">{">"}</span>…<span className="tok-sel">{"</article>"}</span></Example.Code>
      </Example>
      <p>
        One class per element. No BEM, no <code>__element</code> /{" "}
        <code>--modifier</code> chains. The <code>cia-</code> prefix keeps every
        utility and component class out of your app&rsquo;s namespace.
      </p>

      <h2 id="tier-2">Tier 2 — SCSS mixins + HTML</h2>
      <p>
        Author your own class names; the mixin handles the styling. Audience:
        product teams that want their own domain vocabulary in markup
        (<code>hero-cta</code>, <code>product-card</code>) without giving up a
        design system.
      </p>
      <Example>
        <Example.Preview style={{ display: "flex", gap: "var(--space-sm)", flexWrap: "wrap", alignItems: "center" }}>
          <Button variant="primary">Buy now</Button>
          <Button variant="outline">Back to cart</Button>
        </Example.Preview>
        <Example.Code><span className="tok-com">{"// app.scss"}</span>
{"\n"}<span className="tok-sel">@use</span> <span className="tok-val">'css-is-awesome/scss/components/buttons'</span> <span className="tok-prop">as</span> <span className="tok-val">b</span>;
{"\n"}<span className="tok-sel">@use</span> <span className="tok-val">'css-is-awesome/scss/components/data'</span>    <span className="tok-prop">as</span> <span className="tok-val">d</span>;
{"\n"}<span className="tok-sel">@use</span> <span className="tok-val">'css-is-awesome/scss/mixins'</span>             <span className="tok-prop">as</span> <span className="tok-val">m</span>;
{"\n"}
{"\n"}<span className="tok-sel">.hero-cta</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">b.btn(primary, $px: 6, $r: full)</span>;
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.elevation(2)</span>;
{"\n"}{"}"}
{"\n"}<span className="tok-sel">.checkout-cancel</span> {"{"} <span className="tok-prop">@include</span> <span className="tok-val">b.btn(outline)</span>; {"}"}
{"\n"}<span className="tok-sel">.product-card</span>    {"{"} <span className="tok-prop">@include</span> <span className="tok-val">d.card-base($shadow: 2)</span>; {"}"}
{"\n"}
{"\n"}<span className="tok-com">{"<!-- in your HTML -->"}</span>
{"\n"}<span className="tok-sel">{"<a"}</span> <span className="tok-prop">class</span>=<span className="tok-val">"hero-cta"</span> <span className="tok-prop">href</span>=<span className="tok-val">"/buy"</span><span className="tok-sel">{">"}</span>Buy now<span className="tok-sel">{"</a>"}</span>
{"\n"}<span className="tok-sel">{"<a"}</span> <span className="tok-prop">class</span>=<span className="tok-val">"checkout-cancel"</span> <span className="tok-prop">href</span>=<span className="tok-val">"/cart"</span><span className="tok-sel">{">"}</span>Back to cart<span className="tok-sel">{"</a>"}</span>
{"\n"}<span className="tok-sel">{"<article"}</span> <span className="tok-prop">class</span>=<span className="tok-val">"product-card"</span><span className="tok-sel">{">"}</span>…<span className="tok-sel">{"</article>"}</span></Example.Code>
      </Example>
      <p>
        Variant is an argument to the mixin, not a class modifier. Every
        parameter is overridable — the mixin accepts <code>$px</code>,{" "}
        <code>$r</code>, <code>$shadow</code>, and friends to tune one-off
        components without breaking the system.
      </p>

      <h2 id="tier-3">Tier 3 — Bare tags (opt-in Pico-mode)</h2>
      <p>
        One <code>@use</code> line styles every common bare tag in your site —
        buttons, tables, inputs, forms, headings, lists. Audience: content-heavy
        sites, blog posts, READMEs rendered as HTML, anywhere the author
        doesn&rsquo;t want to think about classes.
      </p>
      <Example>
        <Example.Preview style={{ display: "flex", gap: "var(--space-sm)", flexWrap: "wrap", alignItems: "center" }}>
          <Button variant="primary">Save</Button>
          <Button variant="outline">Cancel</Button>
        </Example.Preview>
        <Example.Code><span className="tok-com">{"// app.scss — one line styles the whole site"}</span>
{"\n"}<span className="tok-sel">@use</span> <span className="tok-val">'css-is-awesome/scss/recipes/bare-tags'</span>;
{"\n"}
{"\n"}<span className="tok-com">{"<!-- in your HTML -->"}</span>
{"\n"}<span className="tok-sel">{"<button>"}</span>Save<span className="tok-sel">{"</button>"}</span>
{"\n"}<span className="tok-sel">{"<button"}</span> <span className="tok-prop">type</span>=<span className="tok-val">"reset"</span><span className="tok-sel">{">"}</span>Cancel<span className="tok-sel">{"</button>"}</span>
{"\n"}<span className="tok-sel">{"<table>"}</span>…<span className="tok-sel">{"</table>"}</span>
{"\n"}<span className="tok-sel">{"<input"}</span> <span className="tok-prop">type</span>=<span className="tok-val">"email"</span><span className="tok-sel">{">"}</span></Example.Code>
      </Example>
      <p>
        The recipe styles bare tags at specificity <code>0,0,1</code> — no{" "}
        <code>@layer</code>, no <code>:where()</code>. Any class-based selector
        you add wins automatically, so React + CSS Modules + third-party libs
        all override the recipe without ceremony.
      </p>

      <h2 id="same-button">The same button, three ways</h2>
      <p>
        All three of these resolve to the same <code>btn(primary)</code> mixin
        output. Visually identical, conceptually different.
      </p>
      <Example>
        <Example.Preview style={{ display: "flex", gap: "var(--space-md)", flexWrap: "wrap", alignItems: "center" }}>
          <Button variant="primary">Save</Button>
          <Button variant="primary">Save</Button>
          <Button variant="primary">Save</Button>
        </Example.Preview>
        <Example.Code><span className="tok-com">{"<!-- Tier 1 -->"}</span>
{"\n"}<span className="tok-sel">{"<button"}</span> <span className="tok-prop">class</span>=<span className="tok-val">"cia-btn-primary"</span><span className="tok-sel">{">"}</span>Save<span className="tok-sel">{"</button>"}</span>
{"\n"}
{"\n"}<span className="tok-com">{"<!-- Tier 2 -->"}</span>
{"\n"}<span className="tok-sel">{"<button"}</span> <span className="tok-prop">class</span>=<span className="tok-val">"save-btn"</span><span className="tok-sel">{">"}</span>Save<span className="tok-sel">{"</button>"}</span>
{"\n"}<span className="tok-com">{"// app.scss"}</span>
{"\n"}<span className="tok-sel">.save-btn</span> {"{"} <span className="tok-prop">@include</span> <span className="tok-val">b.btn(primary)</span>; {"}"}
{"\n"}
{"\n"}<span className="tok-com">{"<!-- Tier 3 -->"}</span>
{"\n"}<span className="tok-sel">{"<button>"}</span>Save<span className="tok-sel">{"</button>"}</span></Example.Code>
      </Example>

      <h2 id="architecture">Architecture</h2>
      <ul>
        <li>
          <strong>Single source of truth.</strong> One mixin per component
          (<code>btn</code>, <code>card</code>, <code>input</code>,{" "}
          <code>alert</code>, …) with private internals.
        </li>
        <li>
          <strong>Router pattern.</strong> <code>btn(variant)</code> dispatches
          to private mixins. Variant is an argument, not a class modifier —
          that&rsquo;s why there&rsquo;s no BEM.
        </li>
        <li>
          <strong>Tier 1</strong> = router output baked into single utility
          classes (<code>.cia-btn-primary</code>,{" "}
          <code>.cia-btn-outline</code>, …).
        </li>
        <li>
          <strong>Tier 2</strong> = direct router <code>@include</code> in
          author SCSS under custom class names.
        </li>
        <li>
          <strong>Tier 3</strong> = router <code>@include</code> applied to
          bare-tag selectors via the recipe.
        </li>
        <li>
          <strong>Tier 4 — React.</strong> Components in <code>src/</code> wrap
          the same mixins through CSS Modules. Same output,
          framework-aware ergonomics. See the{" "}
          <Link href="/docs/recipes">recipes</Link> page for live examples.
        </li>
      </ul>
      <p>
        Change the router, every tier updates. Add a variant once, every tier
        gets it. That&rsquo;s the entire payoff.
      </p>

      <h2 id="picking">Picking a tier</h2>
      <table>
        <thead>
          <tr>
            <th>You&rsquo;re building…</th>
            <th>Use</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>A landing page, prototype, or static site with no build</td>
            <td>Tier 1</td>
          </tr>
          <tr>
            <td>A product app where designers want semantic class names</td>
            <td>Tier 2</td>
          </tr>
          <tr>
            <td>A content site, blog, or generated HTML where classes are noise</td>
            <td>Tier 3</td>
          </tr>
          <tr>
            <td>A React or Next.js app</td>
            <td>Tier 4 — see <a href="/docs/install#react-next">install</a></td>
          </tr>
        </tbody>
      </table>
      <p>
        Tiers compose. A Tier 2 product can drop in a Tier 3 recipe for its{" "}
        <code>/blog</code> route, and a Tier 1 marketing page can sit next to a
        Tier 4 app under the same theme file.
      </p>
    </>
  );
}
