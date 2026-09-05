import Example from "@/components/Example";
import demos from "../_registry/demos.module.scss";
import type { DocEntry } from "../_registry/types";

// Dropdown — content ported verbatim from the former hand-written page;
// the live demo is NEW: the real cia.dropdown mixin output on a native
// [popover] element, wired to its trigger with popovertarget — zero JS.
export const dropdownEntry: DocEntry = {
  slug: "dropdown",
  name: "Dropdown",
  category: "Interactive component",
  oneLiner: (
    <>
      Zero-JS dropdown menu built on native <code>[popover]</code>. Click
      outside auto-dismisses, Escape closes, focus management is native. Pair
      with a <code>popovertarget</code> trigger button — no JavaScript needed.
    </>
  ),
  badges: ["0 KB JS", "Baseline 2024", "Auto-dismiss"],

  demo: (
    <>
      <button
        type="button"
        className={demos.dropdownTrigger}
        popoverTarget="doc-demo-dropdown"
      >
        Menu <span aria-hidden="true">&#9662;</span>
      </button>
      <div
        id="doc-demo-dropdown"
        popover=""
        className={demos.dropdownMenu}
      >
        <a href="#usage">Profile</a>
        <a href="#usage">Settings</a>
        <a href="#usage">Log out</a>
      </div>
    </>
  ),

  usage: (
    <>
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
    </>
  ),

  tabs: [
    {
      label: "vs. Floating UI",
      content: (
        <div className="tableWrap" style={{ overflowX: "auto" }}>
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
        </div>
      ),
    },
    {
      label: "Positioning",
      content: (
        <p>
          Same anchor-positioning recipe as Tooltip: layer CSS{" "}
          <code>anchor()</code> + <code>position-area</code> on top of the mixin
          styles for browsers that support it. Otherwise position via your own
          CSS or inline <code>style</code>.
        </p>
      ),
    },
    {
      label: "Accessibility",
      content: (
        <ul>
          <li><strong>Outside click:</strong> regular <code>popover</code> (not <code>hint</code>) auto-dismisses when you click outside the menu.</li>
          <li><strong>Escape:</strong> native — closes the menu, focus returns to the trigger.</li>
          <li><strong>Keyboard:</strong> Tab focuses the trigger, Space/Enter opens; Tab cycles items inside the menu.</li>
          <li><strong>Focus management:</strong> on close, focus naturally returns to the trigger via the popover lifecycle.</li>
        </ul>
      ),
    },
    {
      label: "Tokens",
      content: (
        <p>
          Reads <code>--dropdown-radius</code>, <code>--dropdown-shadow</code>,{" "}
          <code>--surface-default</code>, <code>--border-default</code>,{" "}
          <code>--duration-fast</code>, <code>--ease</code>. The
          <code>cia-dropdown-item</code> + <code>cia-dropdown-divider</code>{" "}
          classes are paired conveniences.
        </p>
      ),
    },
    {
      label: "Source",
      content: (
        <p>
          See <code>scss/components/_overlay.scss</code> →{" "}
          <code>@mixin dropdown</code>.
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
