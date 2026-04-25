import Link from "next/link";
import Example from "@/components/Example";
import Button from "@/components/Button";
import Card from "@/components/Card";

export default function DocsMixinsPage() {
  return (
    <>
      <h1>Mixins</h1>
      <p className="lead">
        Mixins are the primary API of css-is-awesome. Every visual decision is
        token-driven — mixin bodies read from CSS custom properties that the
        active theme defines, so the same <code>@include</code> produces a
        sketchbook button, a brutalist button or a corporate button depending
        on the loaded theme. Consume mixins from your own SCSS and the system
        stays small, fast and easy to re-skin.
      </p>

      <h2 id="import-setup">Import setup</h2>
      <p>
        Two <code>@use</code> lines cover the whole surface. <code>_mixins.scss</code>
        is the barrel for core layout, typography, colour, interactive and effect
        mixins — the atomic vocabulary. Each component partial in{" "}
        <code>scss/components/*</code> exports its own composite mixins
        (<code>btn-primary</code>, <code>card-base</code>, <code>input-base</code>,
        etc.) so you only import the components you need and your compiled CSS
        stays lean.
      </p>
      <Example>
        <Example.Code><span className="tok-com">{"// your-app.scss"}</span>
{"\n"}<span className="tok-sel">@use</span> <span className="tok-val">'cia/scss/mixins'</span> <span className="tok-sel">as</span> <span className="tok-prop">m</span>;
{"\n"}<span className="tok-sel">@use</span> <span className="tok-val">'cia/scss/components/buttons'</span> <span className="tok-sel">as</span> <span className="tok-prop">b</span>;
{"\n"}<span className="tok-sel">@use</span> <span className="tok-val">'cia/scss/components/forms'</span> <span className="tok-sel">as</span> <span className="tok-prop">f</span>;
{"\n"}
{"\n"}<span className="tok-sel">.my-cta</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">b.btn-primary()</span>;
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.elevation(2)</span>;
{"\n"}{"}"}</Example.Code>
      </Example>
      <p>
        The rest of this page is a reference of every public mixin, grouped
        by category. Internal helpers (anything prefixed with{" "}
        <code>_</code> or used only by <code>_generator.scss</code>) are
        omitted.
      </p>

      <h2 id="layout">Layout</h2>
      <p>
        Layout mixins cover flex helpers, responsive grids, page-level
        scaffolding, containers and dividers. All spacing arguments accept a
        numeric space token (<code>1</code>–<code>9</code>) or a t-shirt alias
        (<code>xs</code>/<code>sm</code>/<code>md</code>/<code>lg</code>/
        <code>xl</code>).
      </p>

      <h3 id="flex-center"><code>flex-center</code></h3>
      <p>Centers children horizontally and vertically with flexbox.</p>
      <Example>
        <Example.Preview style={{ display: "flex", justifyContent: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 200,
              height: 80,
              border: "1px dashed var(--border-default,#888)",
              borderRadius: 8,
            }}
          >
            centered
          </div>
        </Example.Preview>
        <Example.Code><span className="tok-com">{"// signature"}</span>
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">flex-center</span>;
{"\n"}
{"\n"}<span className="tok-com">{"// usage"}</span>
{"\n"}<span className="tok-sel">.hero</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.flex-center</span>;
{"\n"}{"}"}</Example.Code>
      </Example>

      <h3 id="flex-between"><code>flex-between</code></h3>
      <p>Flex row with <code>space-between</code> — ideal for toolbars and card headers.</p>
      <Example>
        <Example.Code><span className="tok-sel">@mixin</span> <span className="tok-prop">flex-between</span>;
{"\n"}
{"\n"}<span className="tok-sel">.card__header</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.flex-between</span>;
{"\n"}{"}"}</Example.Code>
      </Example>

      <h3 id="stack"><code>stack</code></h3>
      <p>Vertical flex stack with a token-aware gap. Default gap is <code>4</code>.</p>
      <Example>
        <Example.Preview>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ padding: 8, background: "var(--surface-muted,#eee)" }}>one</div>
            <div style={{ padding: 8, background: "var(--surface-muted,#eee)" }}>two</div>
            <div style={{ padding: 8, background: "var(--surface-muted,#eee)" }}>three</div>
          </div>
        </Example.Preview>
        <Example.Code><span className="tok-sel">@mixin</span> <span className="tok-prop">stack</span>(<span className="tok-val">$gap: 4, $align: stretch</span>);
{"\n"}
{"\n"}<span className="tok-sel">.feed</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.stack(3)</span>;
{"\n"}{"}"}</Example.Code>
      </Example>

      <h3 id="inline"><code>inline</code></h3>
      <p>Horizontal flex row with gap, alignment and wrapping controls.</p>
      <Example>
        <Example.Code><span className="tok-sel">@mixin</span> <span className="tok-prop">inline</span>(<span className="tok-val">$gap: 2, $align: center, $wrap: nowrap</span>);
{"\n"}
{"\n"}<span className="tok-sel">.toolbar</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.inline(2, center, wrap)</span>;
{"\n"}{"}"}</Example.Code>
      </Example>

      <h3 id="container"><code>container</code></h3>
      <p>Page-width container with responsive horizontal padding. Sizes: <code>sm</code>, <code>md</code>, <code>lg</code>, <code>xl</code>, <code>2xl</code>, <code>full</code>.</p>
      <Example>
        <Example.Code><span className="tok-sel">@mixin</span> <span className="tok-prop">container</span>(<span className="tok-val">$size: xl, $px: null</span>);
{"\n"}
{"\n"}<span className="tok-sel">.page</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.container(lg)</span>;
{"\n"}{"}"}</Example.Code>
      </Example>

      <h3 id="grid"><code>grid</code></h3>
      <p>Responsive CSS grid. Pass a column count, <code>auto</code> for auto-fit, or a minimum track size. Collapses to one column below the supplied breakpoint.</p>
      <Example>
        <Example.Preview>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1rem",
            }}
          >
            <div style={{ padding: 8, background: "var(--surface-muted,#eee)" }}>1</div>
            <div style={{ padding: 8, background: "var(--surface-muted,#eee)" }}>2</div>
            <div style={{ padding: 8, background: "var(--surface-muted,#eee)" }}>3</div>
          </div>
        </Example.Preview>
        <Example.Code><span className="tok-sel">@mixin</span> <span className="tok-prop">grid</span>(<span className="tok-val">$cols: 1, $gap: 4, $bp: md, $min: null</span>);
{"\n"}
{"\n"}<span className="tok-sel">.gallery</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.grid(3, $gap: 5)</span>;
{"\n"}{"}"}
{"\n"}
{"\n"}<span className="tok-sel">.cards</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.grid(auto, $min: 250px)</span>;
{"\n"}{"}"}</Example.Code>
      </Example>

      <h3 id="subgrid"><code>subgrid</code></h3>
      <p>Child inherits the parent grid&apos;s column or row tracks. Direction: <code>columns</code>, <code>rows</code>, <code>both</code>.</p>
      <Example>
        <Example.Code><span className="tok-sel">@mixin</span> <span className="tok-prop">subgrid</span>(<span className="tok-val">$direction: columns</span>);
{"\n"}
{"\n"}<span className="tok-sel">.card</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.subgrid</span>;
{"\n"}  <span className="tok-prop">grid-column</span>: <span className="tok-val">span 3</span>;
{"\n"}{"}"}</Example.Code>
      </Example>

      <h3 id="page-layout"><code>page-layout</code></h3>
      <p>Full-page grid with sticky footer. Variants: <code>default</code>, <code>sidebar-left</code>, <code>sidebar-right</code>. Pair with <code>page-header</code>, <code>page-main</code>, <code>page-footer</code>, <code>page-sidebar</code> grid-area helpers.</p>
      <Example>
        <Example.Code><span className="tok-sel">@mixin</span> <span className="tok-prop">page-layout</span>(<span className="tok-val">$variant: default</span>);
{"\n"}
{"\n"}<span className="tok-sel">body</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.page-layout(sidebar-left)</span>;
{"\n"}{"}"}
{"\n"}<span className="tok-sel">header</span> {"{"} <span className="tok-prop">@include</span> <span className="tok-val">m.page-header</span>; {"}"}
{"\n"}<span className="tok-sel">aside</span>  {"{"} <span className="tok-prop">@include</span> <span className="tok-val">m.page-sidebar</span>; {"}"}
{"\n"}<span className="tok-sel">main</span>   {"{"} <span className="tok-prop">@include</span> <span className="tok-val">m.page-main</span>; {"}"}
{"\n"}<span className="tok-sel">footer</span> {"{"} <span className="tok-prop">@include</span> <span className="tok-val">m.page-footer</span>; {"}"}</Example.Code>
      </Example>

      <h3 id="section"><code>section</code></h3>
      <p>Vertical page section with consistent top/bottom padding.</p>
      <Example>
        <Example.Code><span className="tok-sel">@mixin</span> <span className="tok-prop">section</span>(<span className="tok-val">$py: 8, $px: null</span>);
{"\n"}
{"\n"}<span className="tok-sel">section</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.section($py: 9)</span>;
{"\n"}{"}"}</Example.Code>
      </Example>

      <h3 id="row-col"><code>row</code> and <code>col</code></h3>
      <p>Simple flex row / column with token-aware gap and alignment defaults.</p>
      <Example>
        <Example.Code><span className="tok-sel">@mixin</span> <span className="tok-prop">row</span>(<span className="tok-val">$gap: 4, $align: center, $justify: flex-start, $wrap: wrap</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">col</span>(<span className="tok-val">$gap: 4, $align: stretch, $justify: flex-start</span>);
{"\n"}
{"\n"}<span className="tok-sel">.form-row</span> {"{"} <span className="tok-prop">@include</span> <span className="tok-val">m.row(3)</span>; {"}"}
{"\n"}<span className="tok-sel">.form-col</span> {"{"} <span className="tok-prop">@include</span> <span className="tok-val">m.col(2)</span>; {"}"}</Example.Code>
      </Example>

      <h3 id="inset"><code>inset</code>, <code>inset-x</code>, <code>inset-y</code>, <code>squish</code></h3>
      <p>Padding helpers. <code>inset</code> applies even padding on all sides, <code>inset-x</code>/<code>inset-y</code> split axes, <code>squish</code> takes a Y/X pair.</p>
      <Example>
        <Example.Code><span className="tok-sel">@mixin</span> <span className="tok-prop">inset</span>(<span className="tok-val">$size: 4</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">inset-x</span>(<span className="tok-val">$size: 4</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">inset-y</span>(<span className="tok-val">$size: 4</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">squish</span>(<span className="tok-val">$y: 2, $x: 4</span>);</Example.Code>
      </Example>

      <h3 id="divider"><code>divider</code> / <code>divider-vertical</code></h3>
      <p>Horizontal or vertical divider with token-aware spacing.</p>
      <Example>
        <Example.Preview>
          <div style={{ width: "100%" }}>
            <p style={{ margin: 0 }}>above</p>
            <hr
              style={{
                border: 0,
                borderTop: "1px solid var(--border-default,#ccc)",
                margin: "1rem 0",
              }}
            />
            <p style={{ margin: 0 }}>below</p>
          </div>
        </Example.Preview>
        <Example.Code><span className="tok-sel">@mixin</span> <span className="tok-prop">divider</span>(<span className="tok-val">$color: border-default, $spacing: 4</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">divider-vertical</span>(<span className="tok-val">$color: border-default, $spacing: 4</span>);</Example.Code>
      </Example>

      <h2 id="breakpoints">Breakpoints & container queries</h2>
      <p>
        Responsive at viewport and component level. Breakpoint mixins take a
        token (<code>sm</code>, <code>md</code>, <code>lg</code>, <code>xl</code>,
        <code>2xl</code>) or a literal width. Container-query mixins pair with{" "}
        <code>container</code> to make components respond to their own width.
      </p>

      <h3 id="bp"><code>bp</code>, <code>bp-down</code>, <code>bp-between</code></h3>
      <p>Viewport media queries — <code>min-width</code>, <code>max-width</code>, and ranged.</p>
      <Example>
        <Example.Code><span className="tok-sel">@mixin</span> <span className="tok-prop">bp</span>(<span className="tok-val">$size</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">bp-down</span>(<span className="tok-val">$size</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">bp-between</span>(<span className="tok-val">$min, $max</span>);
{"\n"}
{"\n"}<span className="tok-sel">.hero</span> {"{"}
{"\n"}  <span className="tok-prop">font-size</span>: <span className="tok-val">2rem</span>;
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.bp(md)</span> {"{"} <span className="tok-prop">font-size</span>: <span className="tok-val">3rem</span>; {"}"}
{"\n"}{"}"}</Example.Code>
      </Example>

      <h3 id="bp-aliases">Alias mixins</h3>
      <p>Convenience aliases for common breakpoint ranges: <code>mobile-only</code>, <code>tablet</code>, <code>tablet-only</code>, <code>desktop</code>, <code>wide</code>.</p>
      <Example>
        <Example.Code><span className="tok-sel">.nav</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.mobile-only</span> {"{"} <span className="tok-prop">display</span>: <span className="tok-val">none</span>; {"}"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.desktop</span> {"{"} <span className="tok-prop">display</span>: <span className="tok-val">flex</span>; {"}"}
{"\n"}{"}"}</Example.Code>
      </Example>

      <h3 id="cq"><code>container</code>, <code>cq</code>, <code>cq-down</code>, <code>cq-between</code></h3>
      <p>Container queries. Name the container with <code>container</code>, then query it with <code>cq</code> variants.</p>
      <Example>
        <Example.Code><span className="tok-sel">@mixin</span> <span className="tok-prop">container</span>(<span className="tok-val">$name: null, $type: inline-size</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">cq</span>(<span className="tok-val">$size, $name: null</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">cq-down</span>(<span className="tok-val">$size, $name: null</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">cq-between</span>(<span className="tok-val">$min, $max, $name: null</span>);
{"\n"}
{"\n"}<span className="tok-sel">.card</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.container(card)</span>;
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.cq(md, card)</span> {"{"} <span className="tok-prop">display</span>: <span className="tok-val">grid</span>; {"}"}
{"\n"}{"}"}</Example.Code>
      </Example>

      <h2 id="typography">Typography</h2>
      <p>
        All typography is token-driven. <code>font</code> composes weight,
        style, size, line-height and letter-spacing in one mixin;{" "}
        <code>type</code> pulls from the named scale (<code>display</code>,
        <code>heading-1</code>…<code>heading-4</code>, <code>body</code>,
        <code>body-sm</code>, <code>caption</code>, <code>overline</code>).
      </p>

      <h3 id="font"><code>font</code></h3>
      <p>Sets weight, style, size, line-height, letter-spacing from one call. Size/lh/ls accept a token name or a literal value. Pass <code>$family</code> to set a font-family — if it&apos;s a name registered via <code>font-load</code>, the registered fallback is auto-applied; if it&apos;s a CSS-native value (with comma or <code>var()</code>), it passes through; if it&apos;s a single-word name that isn&apos;t loaded, the build fails with <code>@error</code> so typos surface at compile time.</p>
      <Example>
        <Example.Code><span className="tok-sel">@mixin</span> <span className="tok-prop">font</span>(<span className="tok-val">$type: reg, $size: null, $lh: null, $ls: null, $family: null</span>);
{"\n"}
{"\n"}<span className="tok-sel">.lede</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.font(medium, $size: 4, $lh: 2)</span>;
{"\n"}{"}"}</Example.Code>
      </Example>

      <h3 id="font-load"><code>font-load</code> &amp; <code>font-load-local</code></h3>
      <p>Drop a one-off font into a single page or section without forking the theme. <code>font-load</code> registers a Google Fonts URL once (idempotent across the compile), emits the <code>@import</code>, and optionally aliases the loaded family to one of the theme&apos;s font tokens (<code>display</code>, <code>script</code>, <code>serif</code>, <code>sans</code>, <code>mono</code>, <code>primary</code>) so the rest of the page can keep using <code>var(--font-display)</code> with no further changes. <code>font-load-local</code> is the sister mixin for self-hosted woff2/ttf via <code>@font-face</code>.</p>
      <Example>
        <Example.Code><span className="tok-com">{"// Load + apply (Google Fonts)"}</span>
{"\n"}<span className="tok-sel">@include</span> <span className="tok-prop">m.font-load</span>(<span className="tok-val">'Pacifico', 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap'</span>);
{"\n"}<span className="tok-sel">.headline</span> {"{"} <span className="tok-prop">@include</span> <span className="tok-val">m.font(reg, 7, $family: 'Pacifico')</span>; {"}"}
{"\n"}
{"\n"}<span className="tok-com">{"// Load + alias to a theme token (page-scoped --font-display override)"}</span>
{"\n"}<span className="tok-sel">@include</span> <span className="tok-prop">m.font-load</span>(<span className="tok-val">{"'Pacifico', '<url>', $alias: display"}</span>);
{"\n"}
{"\n"}<span className="tok-com">{"// Self-hosted file"}</span>
{"\n"}<span className="tok-sel">@include</span> <span className="tok-prop">m.font-load-local</span>(<span className="tok-val">'Untitled Sans', '/fonts/UntitledSans.woff2'</span>);</Example.Code>
      </Example>
      <p>Tip: drop the <code>font-load</code> call inside a per-route CSS Module (e.g. <code>src/app/special-landing/page.module.scss</code>) and Next will scope the font download to that route only — pages that don&apos;t import the module never see the font in their network tab.</p>

      <h3 id="type"><code>type</code></h3>
      <p>Applies a named type-scale preset: size + weight + line-height + letter-spacing in one include.</p>
      <Example>
        <Example.Preview>
          <div style={{ display: "grid", gap: 8 }}>
            <span style={{ fontSize: "2rem", fontWeight: 700 }}>heading-1</span>
            <span style={{ fontSize: "1rem" }}>body</span>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>overline</span>
          </div>
        </Example.Preview>
        <Example.Code><span className="tok-sel">@mixin</span> <span className="tok-prop">type</span>(<span className="tok-val">$preset</span>);
{"\n"}
{"\n"}<span className="tok-sel">h1</span> {"{"} <span className="tok-prop">@include</span> <span className="tok-val">m.type(heading-1)</span>; {"}"}
{"\n"}<span className="tok-sel">.label</span> {"{"} <span className="tok-prop">@include</span> <span className="tok-val">m.type(overline)</span>; {"}"}</Example.Code>
      </Example>

      <h3 id="truncate"><code>truncate</code></h3>
      <p>Single-line ellipsis by default, or multi-line clamp with <code>$lines</code>.</p>
      <Example>
        <Example.Code><span className="tok-sel">@mixin</span> <span className="tok-prop">truncate</span>(<span className="tok-val">$lines: 1</span>);
{"\n"}
{"\n"}<span className="tok-sel">.card__desc</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.truncate(2)</span>;
{"\n"}{"}"}</Example.Code>
      </Example>

      <h2 id="color-and-effects">Colour, borders & effects</h2>
      <p>
        These wrap raw theme values in runtime-override-capable custom
        properties, so a consumer can re-skin a single site without rebuilding
        the library.
      </p>

      <h3 id="border"><code>border</code></h3>
      <p>Applies a border on all sides, one side, or a list of sides, with token-aware colour.</p>
      <Example>
        <Example.Code><span className="tok-sel">@mixin</span> <span className="tok-prop">border</span>(<span className="tok-val">$width: 1px, $style: solid, $color: border-default, $sides: all</span>);
{"\n"}
{"\n"}<span className="tok-sel">.panel</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.border($sides: (top, bottom))</span>;
{"\n"}{"}"}</Example.Code>
      </Example>

      <h3 id="elevation"><code>elevation</code></h3>
      <p>Applies a theme-driven shadow level (<code>0</code>–<code>5</code>).</p>
      <Example>
        <Example.Preview style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div
            style={{
              width: 120,
              height: 80,
              background: "var(--surface-default,#fff)",
              borderRadius: 8,
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            level 1
          </div>
          <div
            style={{
              width: 120,
              height: 80,
              background: "var(--surface-default,#fff)",
              borderRadius: 8,
              boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            level 3
          </div>
        </Example.Preview>
        <Example.Code><span className="tok-sel">@mixin</span> <span className="tok-prop">elevation</span>(<span className="tok-val">$level: 2</span>);
{"\n"}
{"\n"}<span className="tok-sel">.card</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.elevation(3)</span>;
{"\n"}{"}"}</Example.Code>
      </Example>

      <h2 id="interactive">Interactive states</h2>
      <p>
        Focus ring, hover transitions, disabled state, and a composite{" "}
        <code>interactive</code> mixin that wires hover, active and disabled
        in one call.
      </p>

      <h3 id="focus-ring"><code>focus-ring</code></h3>
      <p>Accessible focus-visible ring using <code>border-focus</code> by default.</p>
      <Example>
        <Example.Code><span className="tok-sel">@mixin</span> <span className="tok-prop">focus-ring</span>(<span className="tok-val">$color: border-focus, $width: 3px, $offset: 0</span>);
{"\n"}
{"\n"}<span className="tok-sel">.btn</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.focus-ring</span>;
{"\n"}{"}"}</Example.Code>
      </Example>

      <h3 id="hover"><code>hover</code></h3>
      <p>One-property transition + hover change in a single line.</p>
      <Example>
        <Example.Code><span className="tok-sel">@mixin</span> <span className="tok-prop">hover</span>(<span className="tok-val">$prop, $value, $speed: fast</span>);
{"\n"}
{"\n"}<span className="tok-sel">.link</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.hover(color, m.color(action-primary-hover))</span>;
{"\n"}{"}"}</Example.Code>
      </Example>

      <h3 id="interactive-mixin"><code>interactive</code></h3>
      <p>Composite: transitions background-color, applies hover + active backgrounds, and disables the element when <code>disabled</code>.</p>
      <Example>
        <Example.Code><span className="tok-sel">@mixin</span> <span className="tok-prop">interactive</span>(<span className="tok-val">$bg-hover: interactive-hover, $bg-active: interactive-active</span>);
{"\n"}
{"\n"}<span className="tok-sel">.row</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.interactive</span>;
{"\n"}{"}"}</Example.Code>
      </Example>

      <h3 id="transition"><code>transition</code></h3>
      <p>Variadic — pass any number of CSS properties plus an optional speed (<code>instant</code>/<code>fast</code>/<code>normal</code>/<code>slow</code>/<code>slower</code>) and easing token (<code>smooth</code>/<code>bounce</code>/etc.). Respects <code>prefers-reduced-motion</code>.</p>
      <Example>
        <Example.Code><span className="tok-sel">@mixin</span> <span className="tok-prop">transition</span>(<span className="tok-val">$props...</span>);
{"\n"}
{"\n"}<span className="tok-sel">.btn</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.transition(background-color, color, fast, smooth)</span>;
{"\n"}{"}"}</Example.Code>
      </Example>

      <h3 id="disabled"><code>disabled</code></h3>
      <p>Standard disabled styling — dimmed, not-allowed cursor, pointer events off.</p>
      <Example>
        <Example.Code><span className="tok-sel">@mixin</span> <span className="tok-prop">disabled</span>(<span className="tok-val">$opacity: 0.5</span>);</Example.Code>
      </Example>

      <h3 id="sr-only"><code>sr-only</code></h3>
      <p>Visually hide an element while keeping it available to screen readers.</p>
      <Example>
        <Example.Code><span className="tok-sel">@mixin</span> <span className="tok-prop">sr-only</span>;
{"\n"}
{"\n"}<span className="tok-sel">.skip-link</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.sr-only</span>;
{"\n"}{"}"}</Example.Code>
      </Example>

      <h2 id="resets">Resets</h2>
      <p>Strip user-agent styling from common elements.</p>
      <Example>
        <Example.Code><span className="tok-sel">@mixin</span> <span className="tok-prop">button-reset</span>;  <span className="tok-com">{"// appearance, background, border, padding, cursor"}</span>
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">list-reset</span>;    <span className="tok-com">{"// list-style + margin + padding"}</span>
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">header-reset</span>;  <span className="tok-com">{"// h1..h6 within scope"}</span>
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">form-reset</span>;    <span className="tok-com">{"// input/select/textarea full-width"}</span></Example.Code>
      </Example>

      <h2 id="animation">Animation</h2>
      <p>
        Keyframes are declared once and referenced by name. All animation
        mixins respect <code>prefers-reduced-motion</code>.
      </p>

      <h3 id="animate"><code>animate</code></h3>
      <p>Trigger a named animation with configurable speed, delay, iteration and timing. Names live in <code>_animations.scss</code> (<code>fade-in</code>, <code>fade-out</code>, <code>slide-up</code>, <code>slide-down</code>, <code>spin</code>, <code>pulse</code>, <code>shimmer</code>, etc.).</p>
      <Example>
        <Example.Code><span className="tok-sel">@mixin</span> <span className="tok-prop">animate</span>(
{"\n"}  <span className="tok-val">$name,</span>
{"\n"}  <span className="tok-val">$speed: normal,</span>
{"\n"}  <span className="tok-val">$delay: 0s,</span>
{"\n"}  <span className="tok-val">$iteration: 1,</span>
{"\n"}  <span className="tok-val">$fill: both,</span>
{"\n"}  <span className="tok-val">$timing: var(--ease, cubic-bezier(0.33, 0.66, 0.33, 1))</span>
{"\n"});
{"\n"}
{"\n"}<span className="tok-sel">.modal</span> {"{"} <span className="tok-prop">@include</span> <span className="tok-val">m.animate(slide-up)</span>; {"}"}
{"\n"}<span className="tok-sel">.spinner</span> {"{"} <span className="tok-prop">@include</span> <span className="tok-val">m.animate(spin, $iteration: infinite, $timing: linear)</span>; {"}"}</Example.Code>
      </Example>

      <h3 id="animate-on"><code>animate-on</code></h3>
      <p>Interaction-triggered animations. Events: <code>hover</code>, <code>focus</code>, <code>active</code>. Effects: <code>lift</code>, <code>glow</code>, <code>press</code>, <code>fade</code>.</p>
      <Example>
        <Example.Code><span className="tok-sel">@mixin</span> <span className="tok-prop">animate-on</span>(<span className="tok-val">$event: hover, $effect: lift</span>);
{"\n"}
{"\n"}<span className="tok-sel">.card</span> {"{"} <span className="tok-prop">@include</span> <span className="tok-val">m.animate-on(hover, lift)</span>; {"}"}</Example.Code>
      </Example>

      <h3 id="animation-helpers">Shortcuts</h3>
      <p>Pre-baked animation helpers that inject the keyframes in the same call.</p>
      <Example>
        <Example.Code><span className="tok-sel">@mixin</span> <span className="tok-prop">spin</span>(<span className="tok-val">$duration: 1s</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">pulse</span>(<span className="tok-val">$duration: 2s</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">fade-in</span>(<span className="tok-val">$duration: normal</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">slide-up</span>(<span className="tok-val">$duration: normal, $distance: 1rem</span>);</Example.Code>
      </Example>

      <h2 id="icons">Icons</h2>
      <p>
        SVG and Font Awesome helpers. Prefer <code>svg</code> for inline icon
        styling, <code>svg-bg</code> for background-image masks,{" "}
        <code>svg-text</code> for inline-text alignment. Font Awesome mixins
        require <code>fa-load</code> once at the root to inject the shared
        @font-face rules.
      </p>
      <Example>
        <Example.Code><span className="tok-sel">@mixin</span> <span className="tok-prop">svg</span>(<span className="tok-val">...</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">svg-bg</span>(<span className="tok-val">...</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">svg-text</span>(<span className="tok-val">...</span>);
{"\n"}
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">fa-load</span>;
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">fa</span>(<span className="tok-val">$name</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">fa-icon</span>(<span className="tok-val">$name</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">fa-text</span>(<span className="tok-val">$name</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">fa-spin</span>(<span className="tok-val">$name, $size, $style</span>);
{"\n"}
{"\n"}<span className="tok-sel">:root</span> {"{"} <span className="tok-prop">@include</span> <span className="tok-val">m.fa-load</span>; {"}"}
{"\n"}<span className="tok-sel">.icon--check</span> {"{"} <span className="tok-prop">@include</span> <span className="tok-val">m.fa-icon(check)</span>; {"}"}</Example.Code>
      </Example>

      <h2 id="components">Component mixins</h2>
      <p>
        Composite mixins live in <code>scss/components/*.scss</code> and
        compose the atomic mixins above into real UI primitives. Every base
        mixin wraps its override-controlled properties in{" "}
        <code>var(--&lt;key&gt;, &lt;default&gt;)</code>, so a theme can tweak
        padding, radius, shadow or colour without a rebuild.
      </p>

      <h3 id="btn-mixins">Buttons</h3>
      <p>From <code>components/buttons</code>. Import as <code>@use &apos;.../components/buttons&apos; as b;</code>.</p>
      <Example>
        <Example.Preview style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Button variant="primary" href="#">Primary</Button>
          <Button variant="outline" href="#">Outline</Button>
          <Button variant="ghost" href="#">Ghost</Button>
        </Example.Preview>
        <Example.Code><span className="tok-sel">@mixin</span> <span className="tok-prop">btn-base</span>(<span className="tok-val">$py: 1, $px: 4, $r: md, $font-weight: medium, $font-size: null</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">btn-primary</span>(<span className="tok-val">$bg, $bg-hover, $bg-active, $color, $py, $px, $r, $font-size</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">btn-secondary</span>(<span className="tok-val">...</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">btn-outline</span>(<span className="tok-val">...</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">btn-ghost</span>(<span className="tok-val">...</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">btn-icon</span>(<span className="tok-val">$size: 2.5rem, $r: md</span>);
{"\n"}
{"\n"}<span className="tok-sel">.cia-btn--primary</span> {"{"} <span className="tok-prop">@include</span> <span className="tok-val">b.btn-primary</span>; {"}"}
{"\n"}<span className="tok-sel">.cia-btn--outline</span> {"{"} <span className="tok-prop">@include</span> <span className="tok-val">b.btn-outline</span>; {"}"}</Example.Code>
      </Example>

      <h3 id="data-mixins">Data display — cards, lists, tables, avatars</h3>
      <p>From <code>components/data</code>.</p>
      <Example>
        <Example.Preview style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
          <Card title="Warm paper">Card-base composes padding, radius, shadow and surface colour.</Card>
          <Card title="Themable">Swap the theme — every card re-skins without markup changes.</Card>
        </Example.Preview>
        <Example.Code><span className="tok-sel">@mixin</span> <span className="tok-prop">table-base</span>(<span className="tok-val">$striped: false, $hover: false, $bordered: false, $compact: false</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">table-responsive</span>;
{"\n"}
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">card-base</span>(<span className="tok-val">$p: 4, $r: lg, $shadow: 1, $bg: surface-default</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">card-header</span>(<span className="tok-val">$pb: 2</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">card-footer</span>(<span className="tok-val">$pt: 2</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">card-interactive</span>;
{"\n"}
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">list-base</span>(<span className="tok-val">$gap: 0, $dividers: false</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">list-item</span>(<span className="tok-val">$py: 2, $px: 4, $interactive: false</span>);
{"\n"}
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">avatar</span>(<span className="tok-val">$size: 2.5rem, $r: full</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">avatar-placeholder</span>(<span className="tok-val">$size, $r, $bg, $color</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">avatar-group</span>(<span className="tok-val">$overlap: -0.5rem</span>);</Example.Code>
      </Example>

      <h3 id="feedback-mixins">Feedback — alerts, toasts, badges, tags, progress</h3>
      <p>From <code>components/feedback</code>. Status-coloured variants read <code>status-*</code> tokens.</p>
      <Example>
        <Example.Code><span className="tok-sel">@mixin</span> <span className="tok-prop">alert-base</span>(<span className="tok-val">$py: 2, $px: 4, $r: md, $border-width: 1px</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">alert</span>(<span className="tok-val">$status: info, $py: 2, $px: 4, $r: md</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">toast-base</span>(<span className="tok-val">$py: 2, $px: 4, $r: lg, $shadow: 3</span>);
{"\n"}
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">badge-base</span>(<span className="tok-val">$py, $px, $r: full, $font-size: 1</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">badge</span>(<span className="tok-val">$status: info</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">tag</span>(<span className="tok-val">$py: 2xs, $px: 2, $r: md, $font-size: 2, $removable: false</span>);
{"\n"}
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">progress-track</span>(<span className="tok-val">$height, $r: full, $bg: surface-muted</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">progress-fill</span>(<span className="tok-val">$color: action-primary-default</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">spinner</span>(<span className="tok-val">...</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">skeleton</span>(<span className="tok-val">...</span>);</Example.Code>
      </Example>

      <h3 id="form-mixins">Forms — inputs, selects, checks, radios, switches, sliders</h3>
      <p>From <code>components/forms</code>. All form primitives share the same focus treatment and disabled contract.</p>
      <Example>
        <Example.Code><span className="tok-sel">@mixin</span> <span className="tok-prop">input-base</span>(<span className="tok-val">$py: 1, $px: 2, $r: md, $border-width: 1px, $bg, $border-color</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">select-base</span>(<span className="tok-val">...</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">textarea-base</span>(<span className="tok-val">...</span>);
{"\n"}
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">check-base</span>(<span className="tok-val">$size: 1.125rem, $r: sm, $color: action-primary-default</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">radio-base</span>(<span className="tok-val">$size: 1.125rem, $color: action-primary-default</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">switch-base</span>(<span className="tok-val">...</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">slider-base</span>(<span className="tok-val">...</span>);
{"\n"}
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">label-base</span>(<span className="tok-val">$size: 2, $weight: medium, $color: text-primary</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">form-layout</span>(<span className="tok-val">$columns: 1, $gap: 4</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">form-group</span>(<span className="tok-val">$gap: 1, $direction: column</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">form-row</span>(<span className="tok-val">$gap: 2, $align: center</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">form-help</span>(<span className="tok-val">$color: text-muted</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">form-error</span>;</Example.Code>
      </Example>

      <h3 id="nav-mixins">Navigation — navbar, nav, breadcrumb, tabs, pagination</h3>
      <p>From <code>components/navigation</code>.</p>
      <Example>
        <Example.Code><span className="tok-sel">@mixin</span> <span className="tok-prop">navbar-base</span>(<span className="tok-val">...</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">navbar-brand</span>(<span className="tok-val">$gap: 2</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">navbar-nav</span>(<span className="tok-val">$gap: 1</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">navbar-link</span>(<span className="tok-val">$py: 1, $px: 2, $r: md</span>);
{"\n"}
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">nav-base</span>(<span className="tok-val">$direction: row, $gap: 1</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">breadcrumb</span>(<span className="tok-val">$gap: 1, $separator: "/"</span>);
{"\n"}
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">tabs-base</span>(<span className="tok-val">$gap: 0, $border: true</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">tab-item</span>(<span className="tok-val">$py: 2, $px: 4, $active-color: action-primary-default</span>);
{"\n"}
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">pagination</span>(<span className="tok-val">$gap: 2xs</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">pagination-item</span>(<span className="tok-val">$size: 2.25rem, $r: md</span>);</Example.Code>
      </Example>

      <h3 id="overlay-mixins">Overlays — modals, tooltips, popovers, dropdowns</h3>
      <p>From <code>components/overlay</code>.</p>
      <Example>
        <Example.Code><span className="tok-sel">@mixin</span> <span className="tok-prop">modal-backdrop</span>(<span className="tok-val">$bg: rgba(0, 0, 0, 0.5)</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">modal-base</span>(<span className="tok-val">$p: 5, $r: xl, $shadow: 5, $max-width: 500px</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">modal-header</span>(<span className="tok-val">$pb: 2</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">modal-footer</span>(<span className="tok-val">$pt: 2</span>);
{"\n"}
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">tooltip-base</span>(<span className="tok-val">$py, $px, $r: md, $bg, $color</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">popover-base</span>(<span className="tok-val">$p: 4, $r: lg, $shadow: 3, $max-width: 320px</span>);
{"\n"}
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">dropdown-menu</span>(<span className="tok-val">$py: 1, $r: md, $shadow: 2, $min-width: 12rem</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">dropdown-item</span>(<span className="tok-val">$py: 1, $px: 4</span>);
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">dropdown-divider</span>(<span className="tok-val">$spacing: 1</span>);</Example.Code>
      </Example>

      <h2 id="writing-your-own">Writing your own mixins</h2>
      <p>
        When you extend the system, follow the same contract: read every
        visual value from a token helper (<code>color()</code>,{" "}
        <code>space()</code>, <code>radius()</code>, <code>shadow()</code>,{" "}
        <code>font-size()</code>), wrap override-controlled properties in{" "}
        <code>var(--&lt;key&gt;, &lt;default&gt;)</code> so themes can tweak
        them at runtime, and compose atomic mixins rather than duplicating
        their bodies.
      </p>
      <Example>
        <Example.Code><span className="tok-com">{"// good — token-driven, override-capable"}</span>
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">note-base</span>(<span className="tok-val">$p: 4, $r: md, $bg: surface-muted</span>) {"{"}
{"\n"}  <span className="tok-prop">padding</span>: <span className="tok-val">var(--note-padding, #{"{"}m.space($p){"}"})</span>;
{"\n"}  <span className="tok-prop">border-radius</span>: <span className="tok-val">var(--note-radius, #{"{"}m.radius($r){"}"})</span>;
{"\n"}  <span className="tok-prop">background</span>: <span className="tok-val">m.color($bg)</span>;
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.border($sides: left, $color: border-focus)</span>;
{"\n"}{"}"}</Example.Code>
      </Example>
      <p>
        The full contributor guide — naming conventions, parameter order,
        how to add a mixin to the barrel — lives in{" "}
        <Link href="/docs/install">CONTRIBUTING.md</Link> alongside the
        component authoring guide.
      </p>

      <h2 id="full-index">Full index</h2>
      <p>
        Every public mixin at a glance. Jump to the section above for usage
        examples.
      </p>
      <ul>
        <li><strong>Layout:</strong> <code>flex-center</code>, <code>flex-between</code>, <code>stack</code>, <code>inline</code>, <code>inset</code>, <code>inset-x</code>, <code>inset-y</code>, <code>squish</code>, <code>container</code>, <code>grid</code>, <code>subgrid</code>, <code>page-layout</code>, <code>page-header</code>, <code>page-main</code>, <code>page-footer</code>, <code>page-sidebar</code>, <code>section</code>, <code>row</code>, <code>col</code>, <code>divider</code>, <code>divider-vertical</code></li>
        <li><strong>Breakpoints:</strong> <code>bp</code>, <code>bp-down</code>, <code>bp-between</code>, <code>mobile-only</code>, <code>tablet</code>, <code>tablet-only</code>, <code>desktop</code>, <code>wide</code></li>
        <li><strong>Container queries:</strong> <code>container</code>, <code>cq</code>, <code>cq-down</code>, <code>cq-between</code></li>
        <li><strong>Typography:</strong> <code>font</code>, <code>type</code>, <code>truncate</code></li>
        <li><strong>Borders & effects:</strong> <code>border</code>, <code>elevation</code></li>
        <li><strong>Interactive:</strong> <code>focus-ring</code>, <code>hover</code>, <code>interactive</code>, <code>transition</code>, <code>disabled</code>, <code>sr-only</code></li>
        <li><strong>Resets:</strong> <code>button-reset</code>, <code>list-reset</code>, <code>header-reset</code>, <code>form-reset</code></li>
        <li><strong>Animation:</strong> <code>animate</code>, <code>animate-on</code>, <code>spin</code>, <code>pulse</code>, <code>fade-in</code>, <code>slide-up</code></li>
        <li><strong>Icons:</strong> <code>svg</code>, <code>svg-bg</code>, <code>svg-text</code>, <code>fa-load</code>, <code>fa</code>, <code>fa-icon</code>, <code>fa-text</code>, <code>fa-spin</code></li>
        <li><strong>Buttons:</strong> <code>btn-base</code>, <code>btn-primary</code>, <code>btn-secondary</code>, <code>btn-outline</code>, <code>btn-ghost</code>, <code>btn-icon</code></li>
        <li><strong>Data:</strong> <code>table-base</code>, <code>table-responsive</code>, <code>card-base</code>, <code>card-header</code>, <code>card-footer</code>, <code>card-interactive</code>, <code>list-base</code>, <code>list-item</code>, <code>avatar</code>, <code>avatar-placeholder</code>, <code>avatar-group</code></li>
        <li><strong>Feedback:</strong> <code>alert-base</code>, <code>alert</code>, <code>toast-base</code>, <code>badge-base</code>, <code>badge</code>, <code>tag</code>, <code>progress-track</code>, <code>progress-fill</code>, <code>spinner</code>, <code>skeleton</code></li>
        <li><strong>Forms:</strong> <code>input-base</code>, <code>select-base</code>, <code>textarea-base</code>, <code>check-base</code>, <code>radio-base</code>, <code>switch-base</code>, <code>slider-base</code>, <code>label-base</code>, <code>form-layout</code>, <code>form-group</code>, <code>form-row</code>, <code>form-help</code>, <code>form-error</code></li>
        <li><strong>Navigation:</strong> <code>navbar-base</code>, <code>navbar-brand</code>, <code>navbar-nav</code>, <code>navbar-link</code>, <code>nav-base</code>, <code>breadcrumb</code>, <code>tabs-base</code>, <code>tab-item</code>, <code>pagination</code>, <code>pagination-item</code></li>
        <li><strong>Overlays:</strong> <code>modal-backdrop</code>, <code>modal-base</code>, <code>modal-header</code>, <code>modal-footer</code>, <code>tooltip-base</code>, <code>popover-base</code>, <code>dropdown-menu</code>, <code>dropdown-item</code>, <code>dropdown-divider</code></li>
      </ul>
    </>
  );
}
