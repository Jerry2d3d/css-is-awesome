import Example from "@/components/Example";
import Badge from "@/components/Badge";

export default function AnchorPositioningRecipePage() {
  return (
    <>
      <h1>Recipe — Anchor positioning</h1>
      <p className="lead">
        cia&rsquo;s tooltip and dropdown mixins style the element but leave positioning to the consumer.
        For browsers that support CSS anchor positioning (<code>anchor()</code> + <code>position-area</code>),
        here&rsquo;s the recipe — pure CSS, no JS, no Floating UI.
      </p>

      <p>
        <Badge>Chrome 125+</Badge>{" "}
        <Badge>Firefox 144+ (~2026)</Badge>{" "}
        <Badge>Safari TP</Badge>{" "}
        <Badge>0 KB JS</Badge>
      </p>

      <h2 id="basic">Tooltip anchored to a button</h2>
      <Example>
        <Example.Code><span className="tok-com">{"<!-- HTML -->"}</span>
{"\n"}<span className="tok-sel">{"<button"}</span> <span className="tok-prop">id</span>=<span className="tok-val">"help-btn"</span>
{"\n"}        <span className="tok-prop">style</span>=<span className="tok-val">"anchor-name: --help"</span>
{"\n"}        <span className="tok-prop">popovertarget</span>=<span className="tok-val">"help-tip"</span> <span className="tok-prop">type</span>=<span className="tok-val">"button"</span><span className="tok-sel">{">"}</span>?<span className="tok-sel">{"</button>"}</span>
{"\n"}
{"\n"}<span className="tok-sel">{"<div"}</span> <span className="tok-prop">id</span>=<span className="tok-val">"help-tip"</span>
{"\n"}     <span className="tok-prop">popover</span>=<span className="tok-val">"hint"</span>
{"\n"}     <span className="tok-prop">class</span>=<span className="tok-val">"cia-tooltip"</span><span className="tok-sel">{">"}</span>
{"\n"}  Helpful message
{"\n"}<span className="tok-sel">{"</div>"}</span></Example.Code>
      </Example>
      <Example>
        <Example.Code><span className="tok-com">{"/* CSS — position the tooltip above the button */"}</span>
{"\n"}<span className="tok-sel">#help-tip</span> {"{"}
{"\n"}  <span className="tok-prop">position-anchor</span>: <span className="tok-val">--help</span>;
{"\n"}  <span className="tok-prop">position-area</span>: <span className="tok-val">top</span>;
{"\n"}  <span className="tok-prop">margin-block-end</span>: <span className="tok-val">var(--space-1, 0.5rem)</span>;
{"\n"}{"}"}</Example.Code>
      </Example>

      <h2 id="dropdown">Dropdown menu anchored below a trigger</h2>
      <Example>
        <Example.Code><span className="tok-sel">{"<button"}</span> <span className="tok-prop">id</span>=<span className="tok-val">"menu-btn"</span>
{"\n"}        <span className="tok-prop">style</span>=<span className="tok-val">"anchor-name: --menu"</span>
{"\n"}        <span className="tok-prop">popovertarget</span>=<span className="tok-val">"user-menu"</span> <span className="tok-prop">type</span>=<span className="tok-val">"button"</span><span className="tok-sel">{">"}</span>Menu<span className="tok-sel">{"</button>"}</span>
{"\n"}
{"\n"}<span className="tok-sel">{"<div"}</span> <span className="tok-prop">id</span>=<span className="tok-val">"user-menu"</span> <span className="tok-prop">popover</span> <span className="tok-prop">class</span>=<span className="tok-val">"cia-dropdown"</span><span className="tok-sel">{">"}</span>
{"\n"}  ...
{"\n"}<span className="tok-sel">{"</div>"}</span></Example.Code>
      </Example>
      <Example>
        <Example.Code><span className="tok-sel">#user-menu</span> {"{"}
{"\n"}  <span className="tok-prop">position-anchor</span>: <span className="tok-val">--menu</span>;
{"\n"}  <span className="tok-prop">position-area</span>: <span className="tok-val">bottom span-right</span>;
{"\n"}  <span className="tok-prop">margin-block-start</span>: <span className="tok-val">var(--space-1)</span>;
{"\n"}{"}"}</Example.Code>
      </Example>

      <h2 id="position-area-values">position-area cheat sheet</h2>
      <p>Common values for the <code>position-area</code> property:</p>
      <ul>
        <li><code>top</code> · <code>bottom</code> · <code>left</code> · <code>right</code> — centered on the named edge</li>
        <li><code>top center</code> · <code>bottom center</code> — explicit centering</li>
        <li><code>top start</code> · <code>top end</code> — aligned to start/end of the anchor</li>
        <li><code>bottom span-right</code> — spans the right edge of the anchor (good for menus)</li>
        <li><code>top span-all</code> — spans the full width of the anchor</li>
      </ul>

      <h2 id="fallback">Fallback for older browsers</h2>
      <p>
        If a browser doesn&rsquo;t support <code>anchor()</code> / <code>position-area</code>, the popover
        still opens — it just positions wherever the browser&rsquo;s default popover placement puts it
        (top of the viewport in current implementations). For a controlled fallback:
      </p>
      <Example>
        <Example.Code><span className="tok-prop">@supports not</span> (<span className="tok-prop">position-area</span>: <span className="tok-val">top</span>) {"{"}
{"\n"}  <span className="tok-sel">#help-tip</span> {"{"}
{"\n"}    <span className="tok-prop">position</span>: <span className="tok-val">absolute</span>;
{"\n"}    <span className="tok-prop">inset-inline-start</span>: <span className="tok-val">var(--fallback-x, 1rem)</span>;
{"\n"}    <span className="tok-prop">inset-block-start</span>:  <span className="tok-val">var(--fallback-y, 2.5rem)</span>;
{"\n"}  {"}"}
{"\n"}{"}"}</Example.Code>
      </Example>

      <h2 id="caveats">Caveats</h2>
      <ul>
        <li><strong>Browser support is still rolling out.</strong> Test in your target browsers. As of 2026: Chrome solid, Firefox 144+, Safari TP only.</li>
        <li><strong>Anchor names are global within the document.</strong> Use unique names like <code>--user-menu-anchor</code> if you have multiple anchored popovers.</li>
        <li><strong>The popover already lives in the top layer.</strong> No <code>z-index</code> needed.</li>
      </ul>
    </>
  );
}
