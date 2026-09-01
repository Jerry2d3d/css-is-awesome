import Example from "@/components/Example";
import Badge from "@/components/Badge";

export default function TabsAriaRecipePage() {
  return (
    <>
      <h1>Recipe — Tabs aria-selected sync</h1>
      <p className="lead">
        cia&rsquo;s <a href="/docs/components/tabs">Tabs</a> ship CSS-only — radio + label + <code>:has()</code>{" "}
        handle the active-panel switch with zero JavaScript. For full ARIA correctness, screen readers
        also want <code>aria-selected=&ldquo;true&rdquo;</code> on the active tab. That one attribute
        needs JS to sync. Here&rsquo;s the ~200-byte shim.
      </p>

      <p>
        <Badge>~200 bytes</Badge>{" "}
        <Badge>Opt-in</Badge>{" "}
        <Badge>Pure DOM</Badge>{" "}
        <Badge>Tabs work without it</Badge>
      </p>

      <h2 id="why">Why this exists</h2>
      <p>
        The CSS-only pattern uses radio inputs + labels. Browsers correctly announce the radio&rsquo;s
        checked state and label text. But the WAI-ARIA tab pattern expects <code>role=&ldquo;tab&rdquo;</code>{" "}
        elements to also have <code>aria-selected=&ldquo;true&rdquo;</code> on the active one. CSS can&rsquo;t
        set attributes — only JS can.
      </p>
      <p>
        <strong>If you skip this shim, your tabs are still keyboard- and screen-reader-accessible</strong> —
        just without the aria-selected layer. For strict WCAG 2.2 conformance with the canonical tab
        pattern, add the shim.
      </p>

      <h2 id="install">Install</h2>
      <Example>
        <Example.Code><span className="tok-com">{"<!-- in your head OR at end of body -->"}</span>
{"\n"}<span className="tok-sel">{"<script"}</span> <span className="tok-prop">type</span>=<span className="tok-val">"module"</span> <span className="tok-prop">src</span>=<span className="tok-val">"/tabs-aria.mjs"</span><span className="tok-sel">{">"}</span><span className="tok-sel">{"</script>"}</span></Example.Code>
      </Example>

      <h2 id="the-shim">The shim</h2>
      <Example>
        <Example.Code><span className="tok-com">{"// tabs-aria.mjs"}</span>
{"\n"}<span className="tok-com">{"// Syncs aria-selected on labels[role=\"tab\"] inside .cia-tabs when their input changes."}</span>
{"\n"}
{"\n"}<span className="tok-sel">function</span> <span className="tok-prop">syncTabs</span>(<span className="tok-prop">container</span>) {"{"}
{"\n"}  <span className="tok-sel">const</span> <span className="tok-prop">checkedId</span> = <span className="tok-prop">container</span>.<span className="tok-prop">querySelector</span>(<span className="tok-val">'input[type=radio]:checked'</span>)?.<span className="tok-prop">id</span>;
{"\n"}  <span className="tok-prop">container</span>.<span className="tok-prop">querySelectorAll</span>(<span className="tok-val">'label[role="tab"]'</span>).<span className="tok-prop">forEach</span>(<span className="tok-prop">label</span> {"=>"} {"{"}
{"\n"}    <span className="tok-prop">label</span>.<span className="tok-prop">setAttribute</span>(<span className="tok-val">'aria-selected'</span>, <span className="tok-prop">label</span>.<span className="tok-prop">htmlFor</span> === <span className="tok-prop">checkedId</span> ? <span className="tok-val">'true'</span> : <span className="tok-val">'false'</span>);
{"\n"}  {"}"});
{"\n"}{"}"}
{"\n"}
{"\n"}<span className="tok-prop">document</span>.<span className="tok-prop">querySelectorAll</span>(<span className="tok-val">'.cia-tabs'</span>).<span className="tok-prop">forEach</span>(<span className="tok-prop">tabs</span> {"=>"} {"{"}
{"\n"}  <span className="tok-prop">syncTabs</span>(<span className="tok-prop">tabs</span>);   <span className="tok-com">{"// initial state"}</span>
{"\n"}  <span className="tok-prop">tabs</span>.<span className="tok-prop">addEventListener</span>(<span className="tok-val">'change'</span>, () {"=>"} <span className="tok-prop">syncTabs</span>(<span className="tok-prop">tabs</span>));
{"\n"}{"}"});</Example.Code>
      </Example>

      <h2 id="contract">What the shim does</h2>
      <ul>
        <li>Finds every <code>.cia-tabs</code> container on the page.</li>
        <li>Sets <code>aria-selected</code> on the label whose <code>htmlFor</code> matches the currently-checked radio.</li>
        <li>Re-runs on radio <code>change</code> events (Tab/Arrow/Space all fire change).</li>
        <li>Sets <code>aria-selected=&ldquo;false&rdquo;</code> on the other labels (correct ARIA behavior — not just the active one).</li>
      </ul>

      <h2 id="markup">Required markup</h2>
      <p>
        For the shim to work, add <code>role=&ldquo;tab&rdquo;</code> to the labels and{" "}
        <code>role=&ldquo;tabpanel&rdquo;</code> to the panels (already shown in the{" "}
        <a href="/docs/components/tabs">Tabs docs</a>):
      </p>
      <Example>
        <Example.Code><span className="tok-sel">{"<div"}</span> <span className="tok-prop">class</span>=<span className="tok-val">"cia-tabs"</span><span className="tok-sel">{">"}</span>
{"\n"}  <span className="tok-sel">{"<input"}</span> <span className="tok-prop">type</span>=<span className="tok-val">"radio"</span> <span className="tok-prop">name</span>=<span className="tok-val">"t"</span> <span className="tok-prop">id</span>=<span className="tok-val">"t1"</span> <span className="tok-prop">checked</span><span className="tok-sel">{">"}</span>
{"\n"}  <span className="tok-sel">{"<input"}</span> <span className="tok-prop">type</span>=<span className="tok-val">"radio"</span> <span className="tok-prop">name</span>=<span className="tok-val">"t"</span> <span className="tok-prop">id</span>=<span className="tok-val">"t2"</span><span className="tok-sel">{">"}</span>
{"\n"}
{"\n"}  <span className="tok-sel">{"<div"}</span> <span className="tok-prop">class</span>=<span className="tok-val">"cia-tab-list"</span> <span className="tok-prop">role</span>=<span className="tok-val">"tablist"</span><span className="tok-sel">{">"}</span>
{"\n"}    <span className="tok-sel">{"<label"}</span> <span className="tok-prop">for</span>=<span className="tok-val">"t1"</span> <span className="tok-prop">role</span>=<span className="tok-val">"tab"</span><span className="tok-sel">{">"}</span>Tab 1<span className="tok-sel">{"</label>"}</span>
{"\n"}    <span className="tok-sel">{"<label"}</span> <span className="tok-prop">for</span>=<span className="tok-val">"t2"</span> <span className="tok-prop">role</span>=<span className="tok-val">"tab"</span><span className="tok-sel">{">"}</span>Tab 2<span className="tok-sel">{"</label>"}</span>
{"\n"}  <span className="tok-sel">{"</div>"}</span>
{"\n"}
{"\n"}  <span className="tok-sel">{"<div"}</span> <span className="tok-prop">class</span>=<span className="tok-val">"cia-tab-panel"</span> <span className="tok-prop">role</span>=<span className="tok-val">"tabpanel"</span><span className="tok-sel">{">"}</span>Panel 1<span className="tok-sel">{"</div>"}</span>
{"\n"}  <span className="tok-sel">{"<div"}</span> <span className="tok-prop">class</span>=<span className="tok-val">"cia-tab-panel"</span> <span className="tok-prop">role</span>=<span className="tok-val">"tabpanel"</span><span className="tok-sel">{">"}</span>Panel 2<span className="tok-sel">{"</div>"}</span>
{"\n"}<span className="tok-sel">{"</div>"}</span></Example.Code>
      </Example>

      <h2 id="alternatives">Alternatives</h2>
      <ul>
        <li><strong>Skip the shim entirely.</strong> CSS-only tabs are keyboard- and screen-reader-accessible without it; <code>aria-selected</code> is the canonical icing, not load-bearing.</li>
        <li><strong>Add <code>aria-controls</code> + <code>id</code> on panels</strong> for the full WAI-ARIA tab pattern. The shim above can be extended in ~5 more lines to sync those too.</li>
      </ul>
    </>
  );
}
