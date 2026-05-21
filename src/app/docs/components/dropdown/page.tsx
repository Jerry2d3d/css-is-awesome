import Example from "@/components/Example";
import Badge from "@/components/Badge";

export default function DropdownDocsPage() {
  return (
    <>
      <h1>Dropdown</h1>
      <p className="lead">
        Zero-JS dropdown menu built on native <code>[popover]</code>. Click outside auto-dismisses,
        Escape closes, focus management is native. Pair with a <code>popovertarget</code> trigger button —
        no JavaScript needed.
      </p>

      <p>
        <Badge>0 KB JS</Badge>{" "}
        <Badge>Baseline 2024</Badge>{" "}
        <Badge>Auto-dismiss</Badge>
      </p>

      <h2 id="usage">Usage</h2>
      <Example>
        <Example.Code><span className="tok-com">{"// app.scss"}</span>
{"\n"}<span className="tok-sel">@use</span> <span className="tok-val">'css-is-awesome'</span> <span className="tok-prop">as</span> <span className="tok-val">cia</span>;
{"\n"}
{"\n"}<span className="tok-sel">.user-menu</span> {"{"} <span className="tok-prop">@include</span> <span className="tok-val">cia.dropdown</span>; {"}"}</Example.Code>
      </Example>
      <Example>
        <Example.Code><span className="tok-com">{"<!-- index.html -->"}</span>
{"\n"}<span className="tok-sel">{"<button"}</span> <span className="tok-prop">popovertarget</span>=<span className="tok-val">"user-menu"</span> <span className="tok-prop">type</span>=<span className="tok-val">"button"</span><span className="tok-sel">{">"}</span>
{"\n"}  Menu &#9662;
{"\n"}<span className="tok-sel">{"</button>"}</span>
{"\n"}
{"\n"}<span className="tok-sel">{"<div"}</span> <span className="tok-prop">id</span>=<span className="tok-val">"user-menu"</span>
{"\n"}     <span className="tok-prop">popover</span>
{"\n"}     <span className="tok-prop">class</span>=<span className="tok-val">"cia-dropdown"</span><span className="tok-sel">{">"}</span>
{"\n"}  <span className="tok-sel">{"<a"}</span> <span className="tok-prop">href</span>=<span className="tok-val">"/profile"</span>  <span className="tok-prop">class</span>=<span className="tok-val">"cia-dropdown-item"</span><span className="tok-sel">{">"}</span>Profile<span className="tok-sel">{"</a>"}</span>
{"\n"}  <span className="tok-sel">{"<a"}</span> <span className="tok-prop">href</span>=<span className="tok-val">"/settings"</span> <span className="tok-prop">class</span>=<span className="tok-val">"cia-dropdown-item"</span><span className="tok-sel">{">"}</span>Settings<span className="tok-sel">{"</a>"}</span>
{"\n"}  <span className="tok-sel">{"<hr"}</span> <span className="tok-prop">class</span>=<span className="tok-val">"cia-dropdown-divider"</span><span className="tok-sel">{">"}</span>
{"\n"}  <span className="tok-sel">{"<a"}</span> <span className="tok-prop">href</span>=<span className="tok-val">"/logout"</span> <span className="tok-prop">class</span>=<span className="tok-val">"cia-dropdown-item"</span><span className="tok-sel">{">"}</span>Log out<span className="tok-sel">{"</a>"}</span>
{"\n"}<span className="tok-sel">{"</div>"}</span></Example.Code>
      </Example>

      <h2 id="comparison">vs. Floating UI / @radix-ui/react-dropdown-menu</h2>
      <table>
        <thead><tr><th>Metric</th><th>cia</th><th>Floating UI + Dropdown</th></tr></thead>
        <tbody>
          <tr><td>JavaScript shipped</td><td><strong>0 KB</strong></td><td>~12 KB</td></tr>
          <tr><td>Outside-click dismiss</td><td>Native (regular <code>popover</code> mode)</td><td>JS document listener</td></tr>
          <tr><td>Escape to close</td><td>Native</td><td>JS handler</td></tr>
          <tr><td>Layering</td><td>Top layer (native)</td><td>Portal + z-index</td></tr>
          <tr><td>Open animation</td><td>CSS keyframes via mixin</td><td>JS-controlled CSS classes</td></tr>
        </tbody>
      </table>

      <h2 id="positioning">Positioning</h2>
      <p>
        Same anchor-positioning recipe as Tooltip: layer CSS <code>anchor()</code> + <code>position-area</code>
        on top of the mixin styles for browsers that support it. Otherwise position via your own CSS
        or inline <code>style</code>.
      </p>

      <h2 id="a11y">Accessibility</h2>
      <ul>
        <li><strong>Outside click:</strong> regular <code>popover</code> (not <code>hint</code>) auto-dismisses when you click outside the menu.</li>
        <li><strong>Escape:</strong> native — closes the menu, focus returns to the trigger.</li>
        <li><strong>Keyboard:</strong> Tab focuses the trigger, Space/Enter opens; Tab cycles items inside the menu.</li>
        <li><strong>Focus management:</strong> on close, focus naturally returns to the trigger via the popover lifecycle.</li>
      </ul>

      <h2 id="theming">Theming</h2>
      <p>
        Reads <code>--dropdown-radius</code>, <code>--dropdown-shadow</code>, <code>--surface-default</code>,
        <code>--border-default</code>, <code>--duration-fast</code>, <code>--ease</code>. The
        <code>cia-dropdown-item</code> + <code>cia-dropdown-divider</code> classes are paired conveniences.
      </p>

      <h2 id="source">Source</h2>
      <p>
        See <code>scss/components/_overlay.scss</code> → <code>@mixin dropdown</code>.
      </p>
    </>
  );
}
