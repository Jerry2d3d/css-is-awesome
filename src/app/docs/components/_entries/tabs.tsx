import Example from "@/components/Example";
import Tabs from "@/components/Tabs";
import type { DocEntry } from "../_registry/types";

// Tabs — content ported verbatim from the former hand-written page. The
// live demo uses the site's own React Tabs wrapper (the docs UI ships one
// tabs implementation for every page, including this template's reference
// tabs below); the zero-JS radio + :has() markup the cia.tabs mixin styles
// is shown verbatim under Usage.
export const tabsEntry: DocEntry = {
  slug: "tabs",
  name: "Tabs",
  category: "Interactive component",
  oneLiner: (
    <>
      Zero-JS tabs built on native <code>{`<input type="radio">`}</code> +{" "}
      <code>:has()</code> + <code>:nth-of-type()</code>. The browser tracks
      which tab is active; CSS shows the matching panel. No state machine, no
      React, no JSON of stories.
    </>
  ),
  badges: ["0 KB JS for core", ":has() Baseline Dec 2023", "Up to 12 tabs default"],

  demo: (
    <>
      <Tabs defaultValue="Overview">
        <Tabs.List>
          <Tabs.Trigger value="Overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="Specs">Specs</Tabs.Trigger>
          <Tabs.Trigger value="Reviews">Reviews</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="Overview">Overview content</Tabs.Panel>
        <Tabs.Panel value="Specs">Specs content</Tabs.Panel>
        <Tabs.Panel value="Reviews">Reviews content</Tabs.Panel>
      </Tabs>
      <p>
        Honest note: this demo is the site&rsquo;s own React Tabs wrapper — the
        docs UI ships one tabs implementation for every page. The zero-JS radio
        + <code>:has()</code> markup the <code>cia.tabs</code> mixin styles is
        the code under Usage.
      </p>
    </>
  ),

  usage: (
    <>
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
    </>
  ),

  tabs: [
    {
      label: "vs. Tailwind",
      content: (
        <div className="tableWrap" style={{ overflowX: "auto" }}>
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
        </div>
      ),
    },
    {
      label: "Accessibility",
      content: (
        <ul>
          <li><strong>Keyboard:</strong> Tab focuses the active label, Arrow keys move between tabs, Space/Enter activates. All native to the radio + label pattern.</li>
          <li><strong>Screen readers:</strong> Native radio + label text are announced. For full <code>aria-selected=&ldquo;true&rdquo;</code> sync on the active label, ship a tiny opt-in JS shim — recipe at <code>/docs/recipes/tabs-aria</code>.</li>
          <li><strong>Touch target:</strong> labels have <code>min-height: var(--touch-target-min, 24px)</code> per WCAG 2.2 SC 2.5.8.</li>
          <li><strong>Reduced motion:</strong> indicator transition respects <code>prefers-reduced-motion</code>.</li>
        </ul>
      ),
    },
    {
      label: "Inputs",
      content: (
        <>
          <p>
            Default supports up to 12 tabs (the <code>@for</code> loop emits N
            selectors). For more, pass
            <code>$max-tabs: 20</code>:
          </p>
          <Example>
            <Example.Code><span className="tok-sel">.dashboard-tabs</span> {"{"} <span className="tok-prop">@include</span> <span className="tok-val">cia.tabs($max-tabs: 20)</span>; {"}"}</Example.Code>
          </Example>
        </>
      ),
    },
    {
      label: "Tokens",
      content: (
        <p>
          Reads <code>--text-primary</code>, <code>--text-secondary</code>,{" "}
          <code>--border-default</code>, <code>--action-primary-default</code>{" "}
          (active indicator color), <code>--space-*</code>,{" "}
          <code>--duration-fast</code>, <code>--ease</code>.
        </p>
      ),
    },
    {
      label: "Source",
      content: (
        <p>
          See <code>scss/components/_tabs.scss</code> → <code>@mixin tabs</code>.
        </p>
      ),
    },
  ],

  footerLinks: [
    { label: "← Docs home", href: "/docs" },
    { label: "Mixin reference", href: "/docs/mixins" },
    { label: "Source on GitHub", href: "https://github.com/Jerry2d3d/css-is-awesome/blob/main/scss/components/_tabs.scss" },
  ],
};
