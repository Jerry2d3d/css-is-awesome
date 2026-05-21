import Example from "@/components/Example";

const outlineBox: React.CSSProperties = {
  outline: "1px dashed var(--border-default)",
  outlineOffset: "-1px",
  background: "var(--surface-subtle)",
};

export default function UtilitiesPage() {
  return (
    <>
      <h1>Utility classes</h1>
      <p className="lead">
        css-is-awesome ships a namespaced utility layer — every class is prefixed{" "}
        <code>.cia-*</code> so it never collides with host app styles. Utilities are
        composed directly in markup for one-off layout, spacing, and colour
        adjustments. The mixin API is still the primary surface of the system;
        utilities are the escape hatch for rapid prototyping and small tweaks.
      </p>

      <aside style={{
        margin: "1.5rem 0",
        padding: "1rem 1.25rem",
        background: "var(--surface-subtle)",
        borderInlineStart: "3px solid var(--action-primary-default)",
        borderRadius: "var(--radius-md)",
      }}>
        <strong>Opt-in since v0.8.</strong> Utilities default to <em>off</em> in the Sass compile —
        Sass-authoring consumers see zero <code>.cia-*</code> rules in their compiled CSS unless they opt in:
        <Example>
          <Example.Code><span className="tok-sel">@use</span> <span className="tok-val">'css-is-awesome'</span> <span className="tok-prop">as</span> <span className="tok-val">cia</span> <span className="tok-prop">with</span> (
{"\n"}  <span className="tok-prop">$utilities</span>: <span className="tok-val">true</span>,         <span className="tok-com">{"// opt in to ~80 structural utility classes"}</span>
{"\n"}  <span className="tok-prop">$responsive-spacing</span>: <span className="tok-val">true</span>,  <span className="tok-com">{"// opt in to .cia-sm-p-md, etc."}</span>
{"\n"});</Example.Code>
        </Example>
        <p style={{ margin: "0.5rem 0 0" }}>
          The pre-built <code>dist/css-is-awesome.utilities.css</code> still ships every utility for
          non-Sass consumers (CDN drop-in). The opt-in flag governs the Sass compile path only.
        </p>
      </aside>

      <h2 id="naming">Naming convention</h2>
      <p>
        All utilities follow <code>cia-&lt;property&gt;-&lt;value&gt;</code> or{" "}
        <code>cia-&lt;property&gt;-&lt;axis&gt;-&lt;value&gt;</code>. The{" "}
        <code>cia-</code> prefix is mandatory — it keeps the utility layer from
        bleeding into host application styles, plugins, or third-party components
        that share the same page.
      </p>
      <p>
        Reach for a utility when the rule is a one-off or you are sketching layout.
        Reach for a <a href="/docs/mixins">mixin</a> when the styling is semantic,
        reused, or part of a component contract. Most production code should lean on
        mixins; utilities are there to keep the last 10% fast.
      </p>

      <h2 id="spacing">Spacing</h2>
      <p>
        Margin, padding, and gap utilities generate for every step of the spacing
        scale — numeric keys (<code>1</code>–<code>9</code>) plus t-shirt aliases
        (<code>xs</code>, <code>sm</code>, <code>md</code>, <code>lg</code>,{" "}
        <code>xl</code>, <code>2xl</code>, <code>3xl</code>, <code>4xl</code>), plus{" "}
        <code>0</code>, <code>none</code>, and <code>2xs</code>.
      </p>
      <p>
        The pattern is <code>cia-&lt;side&gt;-&lt;step&gt;</code>. Sides:{" "}
        <code>m</code> (margin), <code>p</code> (padding), or an axis variant{" "}
        (<code>mx</code>, <code>my</code>, <code>px</code>, <code>py</code>), or a
        single edge (<code>mt</code>, <code>mr</code>, <code>mb</code>,{" "}
        <code>ml</code>, <code>pt</code>, <code>pr</code>, <code>pb</code>,{" "}
        <code>pl</code>).
      </p>

      <h3 id="spacing-scale">Scale reference</h3>
      <table>
        <thead>
          <tr>
            <th>Step</th>
            <th>Alias</th>
            <th>Value</th>
            <th>Pixels</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>0 / none</td><td>—</td><td>0</td><td>0</td></tr>
          <tr><td>2xs</td><td>—</td><td>0.25rem</td><td>4</td></tr>
          <tr><td>1</td><td>xs</td><td>0.5rem</td><td>8</td></tr>
          <tr><td>2</td><td>sm</td><td>0.75rem</td><td>12</td></tr>
          <tr><td>3</td><td>—</td><td>0.875rem</td><td>14</td></tr>
          <tr><td>4</td><td>md</td><td>1rem</td><td>16</td></tr>
          <tr><td>5</td><td>lg</td><td>1.5rem</td><td>24</td></tr>
          <tr><td>6</td><td>xl</td><td>2rem</td><td>32</td></tr>
          <tr><td>7</td><td>2xl</td><td>3rem</td><td>48</td></tr>
          <tr><td>8</td><td>3xl</td><td>4rem</td><td>64</td></tr>
          <tr><td>9</td><td>4xl</td><td>6rem</td><td>96</td></tr>
        </tbody>
      </table>

      <h3 id="spacing-padding">Padding in action</h3>
      <Example>
        <Example.Preview>
          <div className="cia-flex cia-gap-4" style={{ flexWrap: "wrap" }}>
            <div className="cia-p-2" style={outlineBox}>cia-p-2</div>
            <div className="cia-p-4" style={outlineBox}>cia-p-4</div>
            <div className="cia-p-6" style={outlineBox}>cia-p-6</div>
            <div className="cia-px-6 cia-py-2" style={outlineBox}>cia-px-6 cia-py-2</div>
          </div>
        </Example.Preview>
        <Example.Code>
          <span className="tok-sel">{"<div"}</span>{" "}
          <span className="tok-prop">class</span>=<span className="tok-val">"cia-p-4"</span>
          <span className="tok-sel">{">"}</span>...<span className="tok-sel">{"</div>"}</span>
          {"\n"}
          <span className="tok-sel">{"<div"}</span>{" "}
          <span className="tok-prop">class</span>=<span className="tok-val">"cia-px-6 cia-py-2"</span>
          <span className="tok-sel">{">"}</span>...<span className="tok-sel">{"</div>"}</span>
        </Example.Code>
      </Example>

      <h3 id="spacing-margin">Margin & gap</h3>
      <ul>
        <li><code>cia-m-&lt;step&gt;</code>, <code>cia-mx-&lt;step&gt;</code>, <code>cia-my-&lt;step&gt;</code>, <code>cia-m{"{t,r,b,l}"}-&lt;step&gt;</code> — margin on all sides / axis / single edge.</li>
        <li><code>cia-m-auto</code>, <code>cia-mx-auto</code>, <code>cia-my-auto</code>, <code>cia-m{"{t,r,b,l}"}-auto</code> — auto-margin variants.</li>
        <li><code>cia-gap-&lt;step&gt;</code>, <code>cia-gap-x-&lt;step&gt;</code>, <code>cia-gap-y-&lt;step&gt;</code> — flex/grid gap on both axes or one.</li>
      </ul>

      <h2 id="flex-grid">Flex & grid</h2>
      <p>
        Display, direction, alignment, wrap, grow/shrink, and common composition
        shortcuts. Pair with <code>cia-gap-*</code> for spacing between children.
      </p>

      <h3 id="flex-grid-display">Display</h3>
      <ul>
        <li><code>cia-flex</code>, <code>cia-inline-flex</code></li>
        <li><code>cia-grid</code>, <code>cia-inline-grid</code></li>
      </ul>

      <h3 id="flex-grid-direction">Flex direction & wrap</h3>
      <ul>
        <li><code>cia-flex-row</code>, <code>cia-flex-row-reverse</code>, <code>cia-flex-col</code>, <code>cia-flex-col-reverse</code></li>
        <li><code>cia-flex-wrap</code>, <code>cia-flex-nowrap</code>, <code>cia-flex-wrap-reverse</code></li>
      </ul>

      <h3 id="flex-grid-children">Flex children</h3>
      <ul>
        <li><code>cia-flex-1</code>, <code>cia-flex-auto</code>, <code>cia-flex-initial</code>, <code>cia-flex-none</code></li>
        <li><code>cia-flex-grow</code>, <code>cia-flex-grow-0</code>, <code>cia-flex-shrink</code>, <code>cia-flex-shrink-0</code></li>
      </ul>

      <h3 id="flex-grid-align">Alignment</h3>
      <ul>
        <li><code>cia-items-{"{start,end,center,baseline,stretch}"}</code> — <code>align-items</code></li>
        <li><code>cia-justify-{"{start,end,center,between,around,evenly}"}</code> — <code>justify-content</code></li>
        <li><code>cia-self-{"{auto,start,end,center,stretch}"}</code> — <code>align-self</code></li>
      </ul>

      <h3 id="flex-grid-shortcuts">Composition shortcuts</h3>
      <ul>
        <li><code>cia-flex-center</code> — flex + items-center + justify-center.</li>
        <li><code>cia-flex-between</code> — flex + items-center + justify-between.</li>
        <li><code>cia-stack</code> — flex + column direction.</li>
      </ul>

      <h3 id="flex-grid-example">Live example</h3>
      <Example>
        <Example.Preview>
          <div className="cia-flex cia-items-center cia-justify-between cia-gap-4 cia-p-4" style={outlineBox}>
            <span>Left</span>
            <span>Center</span>
            <span>Right</span>
          </div>
        </Example.Preview>
        <Example.Code>
          <span className="tok-sel">{"<div"}</span>{" "}
          <span className="tok-prop">class</span>=<span className="tok-val">"cia-flex cia-items-center cia-justify-between cia-gap-4 cia-p-4"</span>
          <span className="tok-sel">{">"}</span>
          {"\n  ..."}
          {"\n"}
          <span className="tok-sel">{"</div>"}</span>
        </Example.Code>
      </Example>

      <h3 id="flex-grid-grid">Grid columns & spans</h3>
      <ul>
        <li><code>cia-grid-cols-{"{1,2,3,4,6,12}"}</code> — equal-fraction column templates.</li>
        <li><code>cia-col-span-{"{1,2,3,4,6,12,full}"}</code> — child column spans; <code>full</code> spans the whole row.</li>
      </ul>
      <Example>
        <Example.Preview>
          <div className="cia-grid cia-grid-cols-3 cia-gap-3">
            <div className="cia-p-3" style={outlineBox}>1</div>
            <div className="cia-p-3" style={outlineBox}>2</div>
            <div className="cia-p-3" style={outlineBox}>3</div>
            <div className="cia-col-span-2 cia-p-3" style={outlineBox}>col-span-2</div>
            <div className="cia-p-3" style={outlineBox}>last</div>
          </div>
        </Example.Preview>
        <Example.Code>
          <span className="tok-sel">{"<div"}</span>{" "}
          <span className="tok-prop">class</span>=<span className="tok-val">"cia-grid cia-grid-cols-3 cia-gap-3"</span>
          <span className="tok-sel">{">"}</span>
          {"\n  "}
          <span className="tok-sel">{"<div"}</span>{" "}
          <span className="tok-prop">class</span>=<span className="tok-val">"cia-col-span-2"</span>
          <span className="tok-sel">{">"}</span>...<span className="tok-sel">{"</div>"}</span>
          {"\n"}
          <span className="tok-sel">{"</div>"}</span>
        </Example.Code>
      </Example>

      <h2 id="text">Text</h2>
      <p>
        Text utilities cover alignment, transform, decoration, size, weight, line
        height, and letter spacing. Sizes and weights read from CSS custom properties
        so they stay theme-aware.
      </p>

      <h3 id="text-align">Alignment & decoration</h3>
      <table>
        <thead>
          <tr><th>Class</th><th>CSS</th></tr>
        </thead>
        <tbody>
          <tr><td><code>cia-text-left</code></td><td><code>text-align: left</code></td></tr>
          <tr><td><code>cia-text-center</code></td><td><code>text-align: center</code></td></tr>
          <tr><td><code>cia-text-right</code></td><td><code>text-align: right</code></td></tr>
          <tr><td><code>cia-text-justify</code></td><td><code>text-align: justify</code></td></tr>
          <tr><td><code>cia-uppercase</code></td><td><code>text-transform: uppercase</code></td></tr>
          <tr><td><code>cia-lowercase</code></td><td><code>text-transform: lowercase</code></td></tr>
          <tr><td><code>cia-capitalize</code></td><td><code>text-transform: capitalize</code></td></tr>
          <tr><td><code>cia-normal-case</code></td><td><code>text-transform: none</code></td></tr>
          <tr><td><code>cia-underline</code></td><td><code>text-decoration: underline</code></td></tr>
          <tr><td><code>cia-line-through</code></td><td><code>text-decoration: line-through</code></td></tr>
          <tr><td><code>cia-no-underline</code></td><td><code>text-decoration: none</code></td></tr>
          <tr><td><code>cia-truncate</code></td><td>overflow-hidden + ellipsis + nowrap</td></tr>
          <tr><td><code>cia-whitespace-nowrap</code></td><td><code>white-space: nowrap</code></td></tr>
          <tr><td><code>cia-whitespace-normal</code></td><td><code>white-space: normal</code></td></tr>
          <tr><td><code>cia-break-words</code></td><td><code>overflow-wrap: break-word</code></td></tr>
        </tbody>
      </table>

      <h3 id="text-size">Size, weight, leading, tracking</h3>
      <ul>
        <li><code>cia-text-&lt;size&gt;</code> — font size. Keys: <code>xs</code>, <code>sm</code>, <code>base</code>, <code>lg</code>, <code>xl</code>, <code>2xl</code>, <code>3xl</code>, <code>4xl</code>, <code>5xl</code>, <code>6xl</code>, plus numeric <code>1</code>–<code>10</code>.</li>
        <li><code>cia-font-&lt;weight&gt;</code> — weight. Keys: <code>light</code>, <code>normal</code>, <code>medium</code>, <code>semibold</code>, <code>bold</code>, <code>black</code>.</li>
        <li><code>cia-leading-&lt;step&gt;</code> — line-height. Keys: <code>none</code>, <code>tight</code>, <code>snug</code>, <code>normal</code>, <code>relaxed</code>, <code>loose</code>, plus numeric <code>1</code>–<code>6</code>.</li>
        <li><code>cia-tracking-&lt;step&gt;</code> — letter-spacing. Keys: <code>tighter</code>, <code>tight</code>, <code>normal</code>, <code>wide</code>, <code>wider</code>, <code>widest</code>.</li>
      </ul>

      <Example>
        <Example.Preview>
          <div className="cia-stack cia-gap-2">
            <p className="cia-text-xs">cia-text-xs — the quick brown fox</p>
            <p className="cia-text-base">cia-text-base — the quick brown fox</p>
            <p className="cia-text-lg cia-font-semibold">cia-text-lg cia-font-semibold</p>
            <p className="cia-text-2xl cia-font-bold">cia-text-2xl cia-font-bold</p>
            <p className="cia-uppercase cia-tracking-widest">cia-uppercase cia-tracking-widest</p>
          </div>
        </Example.Preview>
        <Example.Code>
          <span className="tok-sel">{"<p"}</span>{" "}
          <span className="tok-prop">class</span>=<span className="tok-val">"cia-text-2xl cia-font-bold"</span>
          <span className="tok-sel">{">"}</span>...<span className="tok-sel">{"</p>"}</span>
          {"\n"}
          <span className="tok-sel">{"<p"}</span>{" "}
          <span className="tok-prop">class</span>=<span className="tok-val">"cia-uppercase cia-tracking-widest"</span>
          <span className="tok-sel">{">"}</span>...<span className="tok-sel">{"</p>"}</span>
        </Example.Code>
      </Example>

      <h2 id="color">Colour</h2>
      <p>
        Colour utilities read semantic tokens from <code>theme.css</code>, so swapping
        theme files reskins every utility at once.
      </p>

      <h3 id="color-text">Text colour</h3>
      <p>
        <code>cia-text-&lt;token&gt;</code> — tokens: <code>primary</code>,{" "}
        <code>secondary</code>, <code>muted</code>, <code>inverse</code>,{" "}
        <code>link</code>, plus status tokens <code>success-text</code>,{" "}
        <code>warning-text</code>, <code>error-text</code>, <code>info-text</code>.
      </p>

      <h3 id="color-bg">Background colour</h3>
      <p>
        <code>cia-bg-&lt;token&gt;</code> — tokens include{" "}
        <code>background-default</code>, <code>background-subtle</code>,{" "}
        <code>background-navbar</code>; surfaces <code>surface-default</code>,{" "}
        <code>surface-subtle</code>, <code>surface-muted</code>,{" "}
        <code>surface-emphasis</code>; status <code>success-subtle</code>,{" "}
        <code>warning-subtle</code>, <code>error-subtle</code>,{" "}
        <code>info-subtle</code>; actions <code>action-primary-default</code>,{" "}
        <code>action-secondary-default</code>.
      </p>

      <h3 id="color-border">Border colour</h3>
      <p>
        <code>cia-border-&lt;token&gt;</code> — tokens: <code>default</code>,{" "}
        <code>subtle</code>, <code>emphasis</code>, <code>focus</code>.
      </p>

      <Example>
        <Example.Preview>
          <div className="cia-grid cia-grid-cols-4 cia-gap-3">
            <div className="cia-bg-surface-default cia-p-4 cia-border cia-rounded-md">surface</div>
            <div className="cia-bg-surface-subtle cia-p-4 cia-border cia-rounded-md">surface-subtle</div>
            <div className="cia-bg-success-subtle cia-p-4 cia-rounded-md cia-text-success-text">success</div>
            <div className="cia-bg-error-subtle cia-p-4 cia-rounded-md cia-text-error-text">error</div>
          </div>
        </Example.Preview>
        <Example.Code>
          <span className="tok-sel">{"<div"}</span>{" "}
          <span className="tok-prop">class</span>=<span className="tok-val">"cia-bg-success-subtle cia-text-success-text cia-p-4 cia-rounded-md"</span>
          <span className="tok-sel">{">"}</span>...<span className="tok-sel">{"</div>"}</span>
        </Example.Code>
      </Example>

      <h2 id="display">Display</h2>
      <table>
        <thead>
          <tr><th>Class</th><th>CSS</th></tr>
        </thead>
        <tbody>
          <tr><td><code>cia-block</code></td><td><code>display: block</code></td></tr>
          <tr><td><code>cia-inline-block</code></td><td><code>display: inline-block</code></td></tr>
          <tr><td><code>cia-inline</code></td><td><code>display: inline</code></td></tr>
          <tr><td><code>cia-flex</code></td><td><code>display: flex</code></td></tr>
          <tr><td><code>cia-inline-flex</code></td><td><code>display: inline-flex</code></td></tr>
          <tr><td><code>cia-grid</code></td><td><code>display: grid</code></td></tr>
          <tr><td><code>cia-inline-grid</code></td><td><code>display: inline-grid</code></td></tr>
          <tr><td><code>cia-hidden</code></td><td><code>display: none</code></td></tr>
          <tr><td><code>cia-contents</code></td><td><code>display: contents</code></td></tr>
        </tbody>
      </table>

      <h2 id="responsive">Responsive variants</h2>
      <p>
        Mobile-first breakpoint prefixes apply the rule at and above the named
        breakpoint. The pattern is{" "}
        <code>cia-&lt;bp&gt;\:&lt;utility&gt;</code> — in HTML you write it unescaped,
        e.g. <code>cia-md:flex</code>.
      </p>
      <table>
        <thead>
          <tr><th>Prefix</th><th>Min width</th><th>Pixels</th></tr>
        </thead>
        <tbody>
          <tr><td><code>cia-sm:</code></td><td>40rem</td><td>640</td></tr>
          <tr><td><code>cia-md:</code></td><td>48rem</td><td>768</td></tr>
          <tr><td><code>cia-lg:</code></td><td>64rem</td><td>1024</td></tr>
          <tr><td><code>cia-xl:</code></td><td>80rem</td><td>1280</td></tr>
          <tr><td><code>cia-2xl:</code></td><td>96rem</td><td>1536</td></tr>
        </tbody>
      </table>
      <p>
        Responsive variants are generated for the display, flex, grid, text
        alignment, and spacing (<code>m</code>/<code>p</code>) families — the
        utilities most commonly reached for when a layout needs to change at a
        breakpoint. Everything else is left single-variant to keep the stylesheet
        small.
      </p>
      <Example>
        <Example.Code>
          <span className="tok-com">{"<!-- stacked on mobile, row from md up -->"}</span>
          {"\n"}
          <span className="tok-sel">{"<div"}</span>{" "}
          <span className="tok-prop">class</span>=<span className="tok-val">"cia-flex cia-flex-col cia-md:flex-row cia-gap-4"</span>
          <span className="tok-sel">{">"}</span>
          {"\n  ..."}
          {"\n"}
          <span className="tok-sel">{"</div>"}</span>
        </Example.Code>
      </Example>

      <h2 id="full-index">Full index</h2>
      <p>
        The categories above cover the utilities you reach for day-to-day. Everything
        else that ships in the utility layer is listed here as a compact reference.
      </p>

      <h3 id="index-position">Position & inset</h3>
      <ul>
        <li><code>cia-static</code>, <code>cia-relative</code>, <code>cia-absolute</code>, <code>cia-fixed</code>, <code>cia-sticky</code></li>
        <li><code>cia-inset-0</code>, <code>cia-top-0</code>, <code>cia-right-0</code>, <code>cia-bottom-0</code>, <code>cia-left-0</code></li>
      </ul>

      <h3 id="index-sizing">Sizing</h3>
      <ul>
        <li>Width — <code>cia-w-full</code>, <code>cia-w-screen</code>, <code>cia-w-auto</code>, <code>cia-w-fit</code>, <code>cia-w-min</code>, <code>cia-w-max</code></li>
        <li>Min/max width — <code>cia-min-w-0</code>, <code>cia-min-w-full</code>, <code>cia-max-w-none</code>, <code>cia-max-w-full</code></li>
        <li>Height — <code>cia-h-full</code>, <code>cia-h-screen</code>, <code>cia-h-auto</code>, <code>cia-h-fit</code></li>
        <li>Min height — <code>cia-min-h-0</code>, <code>cia-min-h-screen</code>, <code>cia-min-h-full</code></li>
      </ul>

      <h3 id="index-border">Border, radius, shadow</h3>
      <ul>
        <li>Border — <code>cia-border</code>, <code>cia-border-0</code>, <code>cia-border-t</code>, <code>cia-border-r</code>, <code>cia-border-b</code>, <code>cia-border-l</code></li>
        <li>Radius — <code>cia-rounded-&lt;key&gt;</code> (keys from the theme radius scale, e.g. <code>sm</code>, <code>md</code>, <code>lg</code>, <code>full</code>)</li>
        <li>Shadow — <code>cia-shadow-&lt;key&gt;</code> (keys from the theme shadow scale, e.g. <code>sm</code>, <code>md</code>, <code>lg</code>)</li>
      </ul>

      <h3 id="index-effects">Opacity, z-index, overflow</h3>
      <ul>
        <li>Opacity — <code>cia-opacity-&lt;step&gt;</code> where step is <code>0</code>, <code>5</code>, <code>10</code>, <code>20</code>, <code>25</code>, <code>30</code>, <code>40</code>, <code>50</code>, <code>60</code>, <code>70</code>, <code>75</code>, <code>80</code>, <code>90</code>, <code>95</code>, <code>100</code>.</li>
        <li>Z-index — <code>cia-z-&lt;layer&gt;</code> where layer is <code>hide</code>, <code>base</code>, <code>dropdown</code>, <code>sticky</code>, <code>fixed</code>, <code>backdrop</code>, <code>modal</code>, <code>popover</code>, <code>tooltip</code>, <code>toast</code>.</li>
        <li>Overflow — <code>cia-overflow-{"{auto,hidden,visible,scroll}"}</code>, plus axis variants <code>cia-overflow-x-auto</code>, <code>cia-overflow-y-auto</code>, <code>cia-overflow-x-hidden</code>, <code>cia-overflow-y-hidden</code>.</li>
      </ul>

      <h3 id="index-interaction">Cursor & interaction</h3>
      <ul>
        <li><code>cia-cursor-pointer</code>, <code>cia-cursor-default</code>, <code>cia-cursor-not-allowed</code></li>
        <li><code>cia-pointer-events-none</code>, <code>cia-pointer-events-auto</code></li>
        <li><code>cia-select-none</code>, <code>cia-select-text</code>, <code>cia-select-all</code></li>
      </ul>

      <h3 id="index-a11y">Accessibility</h3>
      <ul>
        <li><code>cia-sr-only</code> — visually hide while keeping content for screen readers.</li>
        <li><code>cia-not-sr-only</code> — reverse the above (useful for focus-visible reveals).</li>
      </ul>

      <h3 id="index-animation">Animation & hover</h3>
      <ul>
        <li><code>cia-anim-spin</code>, <code>cia-anim-pulse</code>, <code>cia-anim-shimmer</code> — looping effects.</li>
        <li><code>cia-hover-lift</code>, <code>cia-hover-glow</code>, <code>cia-hover-press</code>, <code>cia-hover-fade</code> — hover-triggered micro-interactions.</li>
      </ul>
    </>
  );
}
