import Example from "@/components/Example";

export default function CompositionPage() {
  return (
    <>
      <h1>Composition — the cia decision tree</h1>
      <p className="lead">
        cia is mixin-first: you author your own selectors and{" "}
        <code>@include</code> the system. This page is the decision tree from{" "}
        <strong>design intent</strong> to <strong>cia code</strong> — covering
        every value you might need to express and where to reach in cia. Read
        it once; the rest of the docs make sense after.
      </p>
      <p>
        Written equally for two audiences: humans authoring components and AI
        agents generating cia code via the{" "}
        <a href="/docs/mcp">MCP server</a>. The decision tree is identical for
        both.
      </p>

      <h2 id="tree">The decision tree</h2>
      <p>You need to express a value. Walk this tree:</p>
      <Example>
        <Example.Code>{`Need a value in your component →

├─ Is it a color, type, radius, shadow, motion timing?
│   → Use the themed token:
│     m.color() / m.font-size() / m.radius() / m.shadow() / m.duration()
│     (varies per theme — consumers can re-tune)
│
├─ Is it a themeable space (margin, padding, gap)?
│   → m.space(n)
│     (themed spacing scale — consumers can re-tune)
│
├─ Is it an explicit geometric size on the 4px grid?
│   → m.grid(n)
│     (NOT themed — geometric truth, shared with Figma)
│
├─ Is it an off-grid pixel value (rare)?
│   → m.px(value)
│     (raw rem conversion — escape hatch, not the default)
│
└─ Is it a component or pattern?
    ├─ Does a cia mixin match? → m.btn() / m.modal() / m.card-base() / etc.
    │       Customize via parameters: cia.btn(primary, $bg: brand-accent, $r: full)
    │       Extend via @content: cia.btn(primary) { letter-spacing: 0.05em; }
    │
    ├─ Does a recipe show the pattern? → follow scss/recipes/<name>.md
    │       (dialog, combobox, datepicker, etc.)
    │
    └─ Otherwise: compose from cia primitives
            (m.flex / m.stack / m.cluster / m.btn-base / m.focus-ring / m.transition)`}</Example.Code>
      </Example>

      <h2 id="tokens">Branch 1 — Themed tokens (color, type, radius, shadow, motion)</h2>
      <p>
        These are <strong>design choices</strong>. They vary per theme. Use
        the typed token function; the value is whatever the active theme
        declares.
      </p>
      <Example>
        <Example.Code><span className="tok-com">{"// theme provides --action-primary-default; m.color() returns var(--action-primary-default)"}</span>
{"\n"}<span className="tok-sel">.my-cta</span> {"{"}
{"\n"}  <span className="tok-prop">background</span>: <span className="tok-val">m.color(action-primary-default)</span>;
{"\n"}  <span className="tok-prop">color</span>: <span className="tok-val">m.color(text-inverse)</span>;
{"\n"}  <span className="tok-prop">font-size</span>: <span className="tok-val">m.font-size(3)</span>;
{"\n"}  <span className="tok-prop">border-radius</span>: <span className="tok-val">m.radius(md)</span>;
{"\n"}  <span className="tok-prop">box-shadow</span>: <span className="tok-val">m.shadow(2)</span>;
{"\n"}  <span className="tok-prop">transition-duration</span>: <span className="tok-val">m.duration(normal)</span>;
{"\n"}{"}"}</Example.Code>
      </Example>

      <h2 id="space">Branch 2 — Themeable spacing</h2>
      <p>
        Margin, padding, gap. cia ships a numbered space scale{" "}
        (<code>1</code>–<code>9</code>) with t-shirt aliases (<code>xs</code>{" "}
        through <code>4xl</code>). The scale itself IS themeable — consumers
        can re-tune the spacing per theme.
      </p>
      <Example>
        <Example.Code><span className="tok-sel">.feed</span> {"{"}
{"\n"}  <span className="tok-prop">padding</span>: <span className="tok-val">m.space(4)</span> <span className="tok-val">m.space(6)</span>;
{"\n"}  <span className="tok-prop">gap</span>: <span className="tok-val">m.space(3)</span>;
{"\n"}{"}"}</Example.Code>
      </Example>

      <h2 id="grid">Branch 3 — Geometric grid (NOT themed)</h2>
      <p>
        Explicit sizes on cia&apos;s 4px coordinate system. Use for icon
        widths, control heights, fixed dimensions that must align with the
        design grid. <strong>NOT themed</strong> — consumers don&apos;t tune
        the 4px grid; it&apos;s geometric truth.
      </p>
      <p>
        Why distinct from <code>m.space()</code>?{" "}
        <code>m.space()</code> is themeable (varies per theme){"; "}
        <code>m.grid()</code> is geometric (fixed across all themes). Same
        math, different semantics — use <code>m.space()</code> for margins
        and gaps, <code>m.grid()</code> for icon widths and control heights.
      </p>
      <Example>
        <Example.Code><span className="tok-sel">.icon-sm</span>     {"{"} <span className="tok-prop">width</span>: <span className="tok-val">m.grid(4)</span>;  {"}"}  <span className="tok-com">{"// 16px"}</span>
{"\n"}<span className="tok-sel">.control-md</span>  {"{"} <span className="tok-prop">height</span>: <span className="tok-val">m.grid(10)</span>; {"}"} <span className="tok-com">{"// 40px"}</span>
{"\n"}<span className="tok-sel">.avatar-xl</span>   {"{"} <span className="tok-prop">inline-size</span>: <span className="tok-val">m.grid(20)</span>; {"}"}<span className="tok-com">{"// 80px"}</span></Example.Code>
      </Example>

      <h2 id="px">Branch 4 — Off-grid pixel values (rare)</h2>
      <p>
        For the rare case where a value doesn&apos;t fit any cia scale.
        Returns rem so user zoom still works. <strong>Prefer{" "}
        <code>m.grid()</code> / <code>m.space()</code> / typed tokens when
        they fit</strong> — <code>m.px()</code> is the escape hatch, not the
        default.
      </p>
      <Example>
        <Example.Code><span className="tok-sel">.hero</span>    {"{"} <span className="tok-prop">margin-block-start</span>: <span className="tok-val">m.px(33)</span>; {"}"}<span className="tok-com">{"// 2.0625rem"}</span>
{"\n"}<span className="tok-sel">.badge</span>   {"{"} <span className="tok-prop">margin-inline-end</span>: <span className="tok-val">m.px(17)</span>;  {"}"}<span className="tok-com">{"// 1.0625rem"}</span></Example.Code>
      </Example>

      <h2 id="parameter-power">Branch 5a — Component mixin + parameter-power</h2>
      <p>
        cia ships component mixins for the patterns most consumers need:{" "}
        <code>m.btn()</code>, <code>m.modal()</code>, <code>m.card-base()</code>,{" "}
        <code>m.input-base()</code>, etc. <strong>Every cia mixin accepts
        overrides</strong> — this is parameter-power. If the default
        doesn&apos;t fit, override the parameter.
      </p>
      <Example>
        <Example.Code><span className="tok-com">{"// the default"}</span>
{"\n"}<span className="tok-sel">.checkout-cta</span> {"{"} <span className="tok-prop">@include</span> <span className="tok-val">cia.btn(primary)</span>; {"}"}
{"\n"}
{"\n"}<span className="tok-com">{"// custom background (hover + active derive automatically from $bg)"}</span>
{"\n"}<span className="tok-sel">.brand-cta</span> {"{"} <span className="tok-prop">@include</span> <span className="tok-val">cia.btn(primary, $bg: brand-accent)</span>; {"}"}
{"\n"}
{"\n"}<span className="tok-com">{"// custom radius + padding + size"}</span>
{"\n"}<span className="tok-sel">.pill-cta</span> {"{"} <span className="tok-prop">@include</span> <span className="tok-val">cia.btn(primary, $px: 6, $r: full, $font-size: 3)</span>; {"}"}
{"\n"}
{"\n"}<span className="tok-com">{"// AND extend via @content for anything the params don't cover"}</span>
{"\n"}<span className="tok-sel">.tracked-cta</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">cia.btn(primary)</span> {"{"}
{"\n"}    <span className="tok-prop">letter-spacing</span>: <span className="tok-val">0.05em</span>;
{"\n"}    <span className="tok-prop">text-transform</span>: <span className="tok-val">uppercase</span>;
{"\n"}  {"}"}
{"\n"}{"}"}</Example.Code>
      </Example>
      <p>
        <strong>The MCP server&apos;s <code>get_mixin</code> tool returns the
        full parameter list for any cia mixin.</strong> AI agents:
        when you need a component, fetch the mixin&apos;s signature first
        and override parameters rather than reaching for a literal value.
      </p>

      <h2 id="recipes">Branch 5b — Recipes for higher-level patterns</h2>
      <p>
        When a single mixin isn&apos;t enough, cia ships recipes — full
        framework-agnostic patterns for components like dialog, combobox,
        datepicker, command palette. Each recipe is a markdown file at{" "}
        <code>scss/recipes/&lt;name&gt;.md</code> with structure, styling,
        a11y, and framework examples.
      </p>
      <p>
        Recipes assemble cia primitives — they don&apos;t replace them.
        Read the recipe; copy the structure; let your selector names own
        the markup.
      </p>

      <h2 id="compose">Branch 5c — Composing from primitives</h2>
      <p>
        When no mixin and no recipe matches your component, compose from
        cia primitives directly. The system gives you the building blocks{" "}
        (<code>m.flex</code>, <code>m.stack</code>, <code>m.cluster</code>,{" "}
        <code>m.btn-base</code>, <code>m.focus-ring</code>,{" "}
        <code>m.transition</code>, the typed token functions) — assemble
        them into your bespoke component.
      </p>
      <Example>
        <Example.Code><span className="tok-com">{"// A bespoke pricing-tier card — no single cia mixin matches; compose"}</span>
{"\n"}<span className="tok-sel">.pricing-tier</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.card-base($shadow: 2)</span>;
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.stack($gap: 4)</span>;
{"\n"}  <span className="tok-prop">padding</span>: <span className="tok-val">m.space(6)</span>;
{"\n"}  <span className="tok-prop">border</span>: <span className="tok-val">1px solid m.color(border-default)</span>;
{"\n"}
{"\n"}  <span className="tok-sel">&[data-featured=&quot;true&quot;]</span> {"{"}
{"\n"}    <span className="tok-prop">border-color</span>: <span className="tok-val">m.color(action-primary-default)</span>;
{"\n"}    <span className="tok-prop">box-shadow</span>: <span className="tok-val">m.shadow(3)</span>;
{"\n"}  {"}"}
{"\n"}
{"\n"}  <span className="tok-sel">.price</span> {"{"}
{"\n"}    <span className="tok-prop">font-size</span>: <span className="tok-val">m.font-size(6)</span>;
{"\n"}    <span className="tok-prop">font-weight</span>: <span className="tok-val">m.font-weight(bold)</span>;
{"\n"}  {"}"}
{"\n"}
{"\n"}  <span className="tok-sel">.cta</span> {"{"} <span className="tok-prop">@include</span> <span className="tok-val">m.btn(primary)</span>; {"}"}
{"\n"}{"}"}</Example.Code>
      </Example>
      <p>
        The system disappears at this point — you&apos;re writing your own
        component, with cia&apos;s tokens and primitives feeding it. The
        result is bespoke but coherent with the design system.
      </p>

      <h2 id="three-ways">A bespoke component — three ways</h2>
      <p>
        Build the same multi-step pricing-tier card three ways. Compare and
        see why cia&apos;s composition story is the path of least friction.
      </p>

      <h3 id="three-ways-tailwind">The Tailwind way (utility soup)</h3>
      <Example>
        <Example.Code>{`<div class="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6
  border border-slate-200 dark:border-slate-700 flex flex-col gap-4
  data-[featured=true]:border-blue-600 data-[featured=true]:shadow-lg
  data-[featured=true]:dark:border-blue-400">
  <h3 class="text-base font-medium text-slate-700 dark:text-slate-200">
    Pro
  </h3>
  <div class="text-5xl font-bold text-slate-900 dark:text-white">
    $24
  </div>
  <button class="bg-blue-600 hover:bg-blue-700 active:bg-blue-800
    dark:bg-blue-500 dark:hover:bg-blue-400 dark:active:bg-blue-300
    text-white font-medium px-4 py-2 rounded-md transition-colors
    focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2">
    Get Pro
  </button>
</div>`}</Example.Code>
      </Example>
      <p>
        Forty-plus utility classes scattered across the markup. Color values
        repeated in light + dark variants. Hover / active / focus states
        spelled out per element. Changing the brand color = find-and-replace
        across the file.
      </p>

      <h3 id="three-ways-bootstrap">The Bootstrap way (override fight)</h3>
      <Example>
        <Example.Code>{`<div class="card p-6 my-pricing-tier">
  <h5 class="card-title">Pro</h5>
  <div class="display-4">$24</div>
  <button class="btn btn-primary my-cta">Get Pro</button>
</div>

<style>
  /* override Bootstrap's defaults — fighting specificity */
  .my-pricing-tier { gap: 1rem !important; display: flex !important;
    flex-direction: column !important; }
  .my-pricing-tier .card-title { font-size: 1rem !important; }
  .my-pricing-tier[data-featured="true"] {
    border-color: var(--bs-primary) !important;
  }
  .my-pricing-tier .my-cta { padding: 0.5rem 1rem !important; }
</style>`}</Example.Code>
      </Example>
      <p>
        Bootstrap classes for structure, then <code>!important</code> wars
        for every customization. Dark mode? You&apos;re editing CSS vars or
        adding another stylesheet. Change the brand? Edit{" "}
        <code>_variables.scss</code> and rebuild.
      </p>

      <h3 id="three-ways-cia">The cia way (composition)</h3>
      <Example>
        <Example.Code><span className="tok-com">{"// Markup uses YOUR class names; cia mixins do the work"}</span>
{"\n"}<span className="tok-sel">.pricing-tier</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.card-base($shadow: 2)</span>;
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.stack($gap: 4)</span>;
{"\n"}  <span className="tok-prop">padding</span>: <span className="tok-val">m.space(6)</span>;
{"\n"}  <span className="tok-prop">border</span>: <span className="tok-val">1px solid m.color(border-default)</span>;
{"\n"}
{"\n"}  <span className="tok-sel">&[data-featured=&quot;true&quot;]</span> {"{"}
{"\n"}    <span className="tok-prop">border-color</span>: <span className="tok-val">m.color(action-primary-default)</span>;
{"\n"}    <span className="tok-prop">box-shadow</span>: <span className="tok-val">m.shadow(3)</span>;
{"\n"}  {"}"}
{"\n"}
{"\n"}  <span className="tok-sel">.price</span> {"{"} <span className="tok-prop">font-size</span>: <span className="tok-val">m.font-size(6)</span>; <span className="tok-prop">font-weight</span>: <span className="tok-val">m.font-weight(bold)</span>; {"}"}
{"\n"}  <span className="tok-sel">.cta</span>   {"{"} <span className="tok-prop">@include</span> <span className="tok-val">m.btn(primary)</span>; {"}"}
{"\n"}{"}"}</Example.Code>
      </Example>
      <p>
        Fourteen lines of SCSS. Dark mode? Already handled — the tokens
        emit <code>light-dark()</code> per the active theme. Change the
        brand? Edit one theme file. Different size buttons across the app?
        Pass <code>$px</code> / <code>$r</code> to <code>btn()</code> per
        use. Same vocabulary across every component in your app.
      </p>

      <h2 id="ai">For AI agents — the contract</h2>
      <p>
        If you&apos;re generating cia code (via MCP, Figma → Code, or any
        agent workflow), the contract is:
      </p>
      <ol>
        <li>
          <strong>Resolve the value via the decision tree above.</strong>{" "}
          Never write a literal rem / px / hex that doesn&apos;t come from
          a cia function or token.
        </li>
        <li>
          <strong>For size values from a design tool</strong> (e.g. Figma
          gives 24px): call the MCP <code>resolve_size</code> tool →
          returns step <code>6</code> → emit <code>m.grid(6)</code>.
        </li>
        <li>
          <strong>For component patterns</strong>: call MCP{" "}
          <code>get_mixin</code> with the component name → receive the full
          parameter list → use parameter-power. Reach for{" "}
          <code>@content</code> only when no parameter matches.
        </li>
        <li>
          <strong>For higher-level patterns</strong>: call MCP{" "}
          <code>get_recipe</code> → receive the recipe&apos;s structure +
          a11y checklist + framework examples → adapt to the consumer&apos;s
          framework.
        </li>
        <li>
          <strong>When nothing matches</strong>: compose from cia primitives
          per the &quot;Composing from primitives&quot; section above.
        </li>
      </ol>
      <p>
        This contract is what makes cia AI-comprehensible: every value has
        a deterministic source, every component has an overridable mixin or
        recipe, and every fallback is documented.
      </p>
    </>
  );
}
