import Example from "@/components/Example";
import Badge from "@/components/Badge";

export default function TabsDocsPage() {
  return (
    <>
      <h1>Tabs</h1>
      <p className="lead">
        Zero-JS tabs built on native <code>{`<input type="radio">`}</code> +{" "}
        <code>:has()</code> + <code>:nth-of-type()</code>. The browser tracks which tab is active;
        CSS shows the matching panel. No state machine, no React, no JSON of stories.
      </p>

      <p>
        <Badge>0 KB JS for core</Badge>{" "}
        <Badge>:has() Baseline Dec 2023</Badge>{" "}
        <Badge>Up to 12 tabs default</Badge>
      </p>

      <h2 id="usage">Usage</h2>
      <Example>
        <Example.Code><span className="tok-com">{"// app.scss"}</span>
{"\n"}<span className="tok-sel">@use</span> <span className="tok-val">'css-is-awesome'</span> <span className="tok-prop">as</span> <span className="tok-val">cia</span>;
{"\n"}
{"\n"}<span className="tok-sel">.product-tabs</span> {"{"} <span className="tok-prop">@include</span> <span className="tok-val">cia.tabs</span>; {"}"}</Example.Code>
      </Example>
      <Example>
        <Example.Code><span className="tok-com">{"<!-- index.html -->"}</span>
{"\n"}<span className="tok-sel">{"<div"}</span> <span className="tok-prop">class</span>=<span className="tok-val">"product-tabs"</span><span className="tok-sel">{">"}</span>
{"\n"}  <span className="tok-sel">{"<input"}</span> <span className="tok-prop">type</span>=<span className="tok-val">"radio"</span> <span className="tok-prop">name</span>=<span className="tok-val">"t"</span> <span className="tok-prop">id</span>=<span className="tok-val">"t1"</span> <span className="tok-prop">checked</span><span className="tok-sel">{">"}</span>
{"\n"}  <span className="tok-sel">{"<input"}</span> <span className="tok-prop">type</span>=<span className="tok-val">"radio"</span> <span className="tok-prop">name</span>=<span className="tok-val">"t"</span> <span className="tok-prop">id</span>=<span className="tok-val">"t2"</span><span className="tok-sel">{">"}</span>
{"\n"}  <span className="tok-sel">{"<input"}</span> <span className="tok-prop">type</span>=<span className="tok-val">"radio"</span> <span className="tok-prop">name</span>=<span className="tok-val">"t"</span> <span className="tok-prop">id</span>=<span className="tok-val">"t3"</span><span className="tok-sel">{">"}</span>
{"\n"}
{"\n"}  <span className="tok-sel">{"<div"}</span> <span className="tok-prop">class</span>=<span className="tok-val">"cia-tab-list"</span> <span className="tok-prop">role</span>=<span className="tok-val">"tablist"</span><span className="tok-sel">{">"}</span>
{"\n"}    <span className="tok-sel">{"<label"}</span> <span className="tok-prop">for</span>=<span className="tok-val">"t1"</span> <span className="tok-prop">role</span>=<span className="tok-val">"tab"</span><span className="tok-sel">{">"}</span>Overview<span className="tok-sel">{"</label>"}</span>
{"\n"}    <span className="tok-sel">{"<label"}</span> <span className="tok-prop">for</span>=<span className="tok-val">"t2"</span> <span className="tok-prop">role</span>=<span className="tok-val">"tab"</span><span className="tok-sel">{">"}</span>Specs<span className="tok-sel">{"</label>"}</span>
{"\n"}    <span className="tok-sel">{"<label"}</span> <span className="tok-prop">for</span>=<span className="tok-val">"t3"</span> <span className="tok-prop">role</span>=<span className="tok-val">"tab"</span><span className="tok-sel">{">"}</span>Reviews<span className="tok-sel">{"</label>"}</span>
{"\n"}  <span className="tok-sel">{"</div>"}</span>
{"\n"}
{"\n"}  <span className="tok-sel">{"<div"}</span> <span className="tok-prop">class</span>=<span className="tok-val">"cia-tab-panel"</span> <span className="tok-prop">role</span>=<span className="tok-val">"tabpanel"</span><span className="tok-sel">{">"}</span>Overview content<span className="tok-sel">{"</div>"}</span>
{"\n"}  <span className="tok-sel">{"<div"}</span> <span className="tok-prop">class</span>=<span className="tok-val">"cia-tab-panel"</span> <span className="tok-prop">role</span>=<span className="tok-val">"tabpanel"</span><span className="tok-sel">{">"}</span>Specs content<span className="tok-sel">{"</div>"}</span>
{"\n"}  <span className="tok-sel">{"<div"}</span> <span className="tok-prop">class</span>=<span className="tok-val">"cia-tab-panel"</span> <span className="tok-prop">role</span>=<span className="tok-val">"tabpanel"</span><span className="tok-sel">{">"}</span>Reviews content<span className="tok-sel">{"</div>"}</span>
{"\n"}<span className="tok-sel">{"</div>"}</span></Example.Code>
      </Example>

      <h2 id="comparison">vs. Tailwind + Headless UI Tab</h2>
      <table>
        <thead><tr><th>Metric</th><th>cia</th><th>Tailwind + Headless UI</th></tr></thead>
        <tbody>
          <tr><td>JavaScript shipped</td><td><strong>0 KB</strong> for core</td><td>~8 KB (Tab.Group)</td></tr>
          <tr><td>Active-panel switch</td><td><code>:has(input:nth-of-type(N):checked)</code></td><td>React state</td></tr>
          <tr><td>Keyboard nav</td><td>Native radio (Tab + Arrows + Space)</td><td>Wired in component</td></tr>
          <tr><td>SSR</td><td>Works as-is, initial tab via <code>checked</code></td><td>Hydrates after render</td></tr>
          <tr><td>aria-selected sync</td><td>Opt-in JS shim (~200 bytes)</td><td>Wired in component</td></tr>
        </tbody>
      </table>

      <h2 id="a11y">Accessibility</h2>
      <ul>
        <li><strong>Keyboard:</strong> Tab focuses the active label, Arrow keys move between tabs, Space/Enter activates. All native to the radio + label pattern.</li>
        <li><strong>Screen readers:</strong> Native radio + label text are announced. For full <code>aria-selected=&ldquo;true&rdquo;</code> sync on the active label, ship a tiny opt-in JS shim — recipe at <code>/docs/recipes/tabs-aria</code>.</li>
        <li><strong>Touch target:</strong> labels have <code>min-height: var(--touch-target-min, 24px)</code> per WCAG 2.2 SC 2.5.8.</li>
        <li><strong>Reduced motion:</strong> indicator transition respects <code>prefers-reduced-motion</code>.</li>
      </ul>

      <h2 id="customizing">Customizing tab count</h2>
      <p>
        Default supports up to 12 tabs (the <code>@for</code> loop emits N selectors). For more, pass
        <code>$max-tabs: 20</code>:
      </p>
      <Example>
        <Example.Code><span className="tok-sel">.dashboard-tabs</span> {"{"} <span className="tok-prop">@include</span> <span className="tok-val">cia.tabs($max-tabs: 20)</span>; {"}"}</Example.Code>
      </Example>

      <h2 id="theming">Theming</h2>
      <p>
        Reads <code>--text-primary</code>, <code>--text-secondary</code>, <code>--border-default</code>,
        <code>--action-primary-default</code> (active indicator color), <code>--space-*</code>,
        <code>--duration-fast</code>, <code>--ease</code>.
      </p>

      <h2 id="source">Source</h2>
      <p>
        See <code>scss/components/_tabs.scss</code> → <code>@mixin tabs</code>.
      </p>
    </>
  );
}
