import Example from "@/components/Example";
import demos from "../_registry/demos.module.scss";
import type { DocEntry } from "../_registry/types";

// Tooltip — content ported verbatim from the former hand-written page;
// the live demo is NEW: the real cia.tooltip mixin output on a native
// popover="hint" element, opened via popovertarget — zero JS.
export const tooltipEntry: DocEntry = {
  slug: "tooltip",
  name: "Tooltip",
  category: "Interactive component",
  oneLiner: (
    <>
      Zero-JS tooltip built on native <code>popover=&ldquo;hint&rdquo;</code>.
      Multiple hints can coexist without stack-cancelling each other. Browser
      handles show, close, Escape, layering — cia ships zero tooltip
      JavaScript.
    </>
  ),
  badges: ["0 KB JS", "Baseline 2024 (popover)", "aria-describedby ready"],

  demo: (
    <>
      <button
        type="button"
        className={demos.dropdownTrigger}
        popoverTarget="doc-demo-tooltip"
        aria-describedby="doc-demo-tooltip"
      >
        ?
      </button>
      <div id="doc-demo-tooltip" popover="hint" className={demos.tooltip}>
        Use this button to invite team members
      </div>
      <p>
        The tooltip is the real <code>cia.tooltip</code> output on a native{" "}
        <code>popover=&ldquo;hint&rdquo;</code> element. Production tooltips
        pair the trigger with <code>aria-describedby</code> — as this one does
        — so screen readers announce the description when the trigger is
        focused.
      </p>
    </>
  ),

  usage: (
    <>
      <Example>
        <Example.Code><span className="tok-com">{"// app.scss"}</span>
{"\n"}<span className="tok-sel">@use</span> <span className="tok-val">'css-is-awesome'</span> <span className="tok-prop">as</span> <span className="tok-val">cia</span>;
{"\n"}
{"\n"}<span className="tok-sel">.info-tip</span> {"{"} <span className="tok-prop">@include</span> <span className="tok-val">cia.tooltip</span>; {"}"}</Example.Code>
      </Example>
      <Example>
        <Example.Code><span className="tok-com">{"<!-- index.html -->"}</span>
{"\n"}<span className="tok-sel">{"<button"}</span> <span className="tok-prop">popovertarget</span>=<span className="tok-val">"help-tip"</span>
{"\n"}        <span className="tok-prop">type</span>=<span className="tok-val">"button"</span>
{"\n"}        <span className="tok-prop">aria-describedby</span>=<span className="tok-val">"help-tip"</span><span className="tok-sel">{">"}</span>?<span className="tok-sel">{"</button>"}</span>
{"\n"}
{"\n"}<span className="tok-sel">{"<div"}</span> <span className="tok-prop">id</span>=<span className="tok-val">"help-tip"</span>
{"\n"}     <span className="tok-prop">popover</span>=<span className="tok-val">"hint"</span>
{"\n"}     <span className="tok-prop">class</span>=<span className="tok-val">"cia-tooltip"</span><span className="tok-sel">{">"}</span>
{"\n"}  Use this button to invite team members
{"\n"}<span className="tok-sel">{"</div>"}</span></Example.Code>
      </Example>
    </>
  ),

  tabs: [
    {
      label: "vs. Floating UI",
      content: (
        <div className="tableWrap" style={{ overflowX: "auto" }}>
          <table>
            <thead><tr><th>Metric</th><th>cia</th><th>Floating UI + Tooltip</th></tr></thead>
            <tbody>
              <tr><td>JavaScript shipped</td><td><strong>0 KB</strong></td><td>~12 KB</td></tr>
              <tr><td>Show / close</td><td>Native via <code>popovertarget</code></td><td>JS event listeners</td></tr>
              <tr><td>Stack behavior</td><td><code>hint</code> mode — multiple coexist</td><td>JS-managed open state</td></tr>
              <tr><td>Escape to close</td><td>Native</td><td>JS handler</td></tr>
              <tr><td>Layering</td><td>Top layer (native)</td><td>Portal + z-index</td></tr>
            </tbody>
          </table>
        </div>
      ),
    },
    {
      label: "Positioning",
      content: (
        <p>
          The mixin styles the tooltip itself. For anchor-aware positioning,
          layer in CSS anchor positioning (Chrome 125+, Firefox 144+) or set
          inline <code>style</code> on the popover. A copy-paste recipe lives at{" "}
          <code>/docs/recipes/anchor-positioning</code>.
        </p>
      ),
    },
    {
      label: "Accessibility",
      content: (
        <ul>
          <li><strong>Pair with <code>aria-describedby</code>:</strong> the trigger button references the tooltip&rsquo;s ID. Screen readers announce the description when the trigger is focused.</li>
          <li><strong>Escape:</strong> native — closes the popover.</li>
          <li><strong>Keyboard:</strong> Tab focuses the trigger; click/Enter/Space opens via <code>popovertarget</code>.</li>
          <li><strong>Multiple hints:</strong> <code>popover=&ldquo;hint&rdquo;</code> mode lets several open at once without stack-cancelling.</li>
        </ul>
      ),
    },
    {
      label: "Tokens",
      content: (
        <p>
          Reads <code>--tooltip-padding-y</code>, <code>--tooltip-padding-x</code>,{" "}
          <code>--tooltip-radius</code>, <code>--text-primary</code> (background),{" "}
          <code>--text-inverse</code> (foreground), <code>--duration-fast</code>,{" "}
          <code>--ease</code>.
        </p>
      ),
    },
    {
      label: "Source",
      content: (
        <p>
          See <code>scss/components/_overlay.scss</code> →{" "}
          <code>@mixin tooltip</code>.
        </p>
      ),
    },
  ],

  footerLinks: [
    { label: "← Docs home", href: "/docs" },
    { label: "Mixin reference", href: "/docs/mixins" },
    { label: "Source on GitHub", href: "https://github.com/Jerry2d3d/css-is-awesome/blob/main/scss/components/_overlay.scss" },
  ],
};
