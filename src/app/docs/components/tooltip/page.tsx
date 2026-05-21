import Example from "@/components/Example";
import Badge from "@/components/Badge";

export default function TooltipDocsPage() {
  return (
    <>
      <h1>Tooltip</h1>
      <p className="lead">
        Zero-JS tooltip built on native <code>popover=&ldquo;hint&rdquo;</code>. Multiple hints can
        coexist without stack-cancelling each other. Browser handles show, close, Escape, layering —
        cia ships zero tooltip JavaScript.
      </p>

      <p>
        <Badge>0 KB JS</Badge>{" "}
        <Badge>Baseline 2024 (popover)</Badge>{" "}
        <Badge>aria-describedby ready</Badge>
      </p>

      <h2 id="usage">Usage</h2>
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

      <h2 id="comparison">vs. Floating UI / @radix-ui/react-tooltip</h2>
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

      <h2 id="positioning">Positioning</h2>
      <p>
        The mixin styles the tooltip itself. For anchor-aware positioning, layer in CSS
        anchor positioning (Chrome 125+, Firefox 144+) or set inline <code>style</code> on the popover.
        A copy-paste recipe lives at <code>/docs/recipes/anchor-positioning</code>.
      </p>

      <h2 id="a11y">Accessibility</h2>
      <ul>
        <li><strong>Pair with <code>aria-describedby</code>:</strong> the trigger button references the tooltip&rsquo;s ID. Screen readers announce the description when the trigger is focused.</li>
        <li><strong>Escape:</strong> native — closes the popover.</li>
        <li><strong>Keyboard:</strong> Tab focuses the trigger; click/Enter/Space opens via <code>popovertarget</code>.</li>
        <li><strong>Multiple hints:</strong> <code>popover=&ldquo;hint&rdquo;</code> mode lets several open at once without stack-cancelling.</li>
      </ul>

      <h2 id="theming">Theming</h2>
      <p>
        Reads <code>--tooltip-padding-y</code>, <code>--tooltip-padding-x</code>,
        <code>--tooltip-radius</code>, <code>--text-primary</code> (background), <code>--text-inverse</code> (foreground),
        <code>--duration-fast</code>, <code>--ease</code>.
      </p>

      <h2 id="source">Source</h2>
      <p>
        See <code>scss/components/_overlay.scss</code> → <code>@mixin tooltip</code>.
      </p>
    </>
  );
}
