import Example from "@/components/Example";
import Badge from "@/components/Badge";

export default function CopyButtonRecipePage() {
  return (
    <>
      <h1>Recipe — Copy Button JS shim</h1>
      <p className="lead">
        cia&rsquo;s npm package ships <strong>zero JavaScript</strong>. For the{" "}
        <a href="/docs/components/copy-button">CopyButton component</a> to actually copy text,
        the consumer wires their own click handler. Here&rsquo;s the framework-free shim that
        the cia docs site uses — ~700 bytes raw, ~1 KB gzipped. Copy-paste it as a starting point.
      </p>

      <p>
        <Badge>~700 bytes raw</Badge>{" "}
        <Badge>~1 KB gzipped</Badge>{" "}
        <Badge>Zero dependencies</Badge>{" "}
        <Badge>Clipboard API + execCommand fallback</Badge>
      </p>

      <h2 id="install">Install</h2>
      <p>
        Save the snippet below as <code>copy-button.mjs</code> in your project (or copy it from
        cia&rsquo;s repo at <code>public/copy-button.mjs</code> — it lives in <code>public/</code>{" "}
        precisely so it does NOT ship in the npm package). Then load it once in your{" "}
        <code>{`<head>`}</code>:
      </p>
      <Example>
        <Example.Code><span className="tok-sel">{"<script"}</span> <span className="tok-prop">type</span>=<span className="tok-val">"module"</span> <span className="tok-prop">src</span>=<span className="tok-val">"/copy-button.mjs"</span><span className="tok-sel">{">"}</span><span className="tok-sel">{"</script>"}</span></Example.Code>
      </Example>

      <h2 id="the-shim">The shim</h2>
      <Example>
        <Example.Code><span className="tok-com">{"// copy-button.mjs"}</span>
{"\n"}<span className="tok-sel">document</span>.<span className="tok-prop">addEventListener</span>(<span className="tok-val">'click'</span>, (<span className="tok-prop">e</span>) {"=>"} {"{"}
{"\n"}  <span className="tok-sel">const</span> <span className="tok-prop">btn</span> = <span className="tok-prop">e</span>.<span className="tok-prop">target</span>.<span className="tok-prop">closest</span>(<span className="tok-val">'[data-copy-target]'</span>);
{"\n"}  <span className="tok-sel">if</span> (!<span className="tok-prop">btn</span>) <span className="tok-sel">return</span>;
{"\n"}
{"\n"}  <span className="tok-sel">const</span> <span className="tok-prop">target</span> =
{"\n"}    <span className="tok-prop">document</span>.<span className="tok-prop">querySelector</span>(<span className="tok-prop">btn</span>.<span className="tok-prop">dataset</span>.<span className="tok-prop">copyTarget</span>) ||
{"\n"}    <span className="tok-prop">btn</span>.<span className="tok-prop">previousElementSibling</span>;
{"\n"}  <span className="tok-sel">const</span> <span className="tok-prop">text</span> = <span className="tok-prop">target</span>?.<span className="tok-prop">textContent</span> ?? <span className="tok-val">''</span>;
{"\n"}  <span className="tok-sel">if</span> (!<span className="tok-prop">text</span>) <span className="tok-sel">return</span>;
{"\n"}
{"\n"}  <span className="tok-sel">const</span> <span className="tok-prop">copy</span> =
{"\n"}    <span className="tok-prop">navigator</span>.<span className="tok-prop">clipboard</span>?.<span className="tok-prop">writeText</span>(<span className="tok-prop">text</span>) ??
{"\n"}    <span className="tok-prop">Promise</span>.<span className="tok-prop">reject</span>(<span className="tok-sel">new</span> <span className="tok-prop">Error</span>(<span className="tok-val">'Clipboard API unavailable'</span>));
{"\n"}
{"\n"}  <span className="tok-prop">copy</span>
{"\n"}    .<span className="tok-prop">catch</span>(() {"=>"} {"{"}
{"\n"}      <span className="tok-com">{"// Legacy fallback for non-secure contexts"}</span>
{"\n"}      <span className="tok-sel">const</span> <span className="tok-prop">ta</span> = <span className="tok-prop">document</span>.<span className="tok-prop">createElement</span>(<span className="tok-val">'textarea'</span>);
{"\n"}      <span className="tok-prop">ta</span>.<span className="tok-prop">value</span> = <span className="tok-prop">text</span>;
{"\n"}      <span className="tok-prop">ta</span>.<span className="tok-prop">setAttribute</span>(<span className="tok-val">'readonly'</span>, <span className="tok-val">''</span>);
{"\n"}      <span className="tok-prop">Object</span>.<span className="tok-prop">assign</span>(<span className="tok-prop">ta</span>.<span className="tok-prop">style</span>, {"{"} <span className="tok-prop">position</span>: <span className="tok-val">'absolute'</span>, <span className="tok-prop">left</span>: <span className="tok-val">'-9999px'</span> {"}"});
{"\n"}      <span className="tok-prop">document</span>.<span className="tok-prop">body</span>.<span className="tok-prop">appendChild</span>(<span className="tok-prop">ta</span>);
{"\n"}      <span className="tok-prop">ta</span>.<span className="tok-prop">select</span>();
{"\n"}      <span className="tok-sel">try</span> {"{"} <span className="tok-prop">document</span>.<span className="tok-prop">execCommand</span>(<span className="tok-val">'copy'</span>); {"}"} <span className="tok-sel">finally</span> {"{"} <span className="tok-prop">ta</span>.<span className="tok-prop">remove</span>(); {"}"}
{"\n"}    {"}"})
{"\n"}    .<span className="tok-prop">finally</span>(() {"=>"} {"{"}
{"\n"}      <span className="tok-prop">btn</span>.<span className="tok-prop">dataset</span>.<span className="tok-prop">copied</span> = <span className="tok-val">'true'</span>;
{"\n"}      <span className="tok-prop">btn</span>.<span className="tok-prop">setAttribute</span>(<span className="tok-val">'aria-label'</span>, <span className="tok-val">'Copied to clipboard'</span>);
{"\n"}
{"\n"}      <span className="tok-com">{"// Auto-hide linked toast popover after 1.5s"}</span>
{"\n"}      <span className="tok-sel">const</span> <span className="tok-prop">toastId</span> = <span className="tok-prop">btn</span>.<span className="tok-prop">getAttribute</span>(<span className="tok-val">'popovertarget'</span>);
{"\n"}      <span className="tok-sel">if</span> (<span className="tok-prop">toastId</span>) {"{"}
{"\n"}        <span className="tok-prop">setTimeout</span>(() {"=>"} {"{"}
{"\n"}          <span className="tok-prop">document</span>.<span className="tok-prop">getElementById</span>(<span className="tok-prop">toastId</span>)?.<span className="tok-prop">hidePopover</span>?.();
{"\n"}        {"}"}, <span className="tok-val">1500</span>);
{"\n"}      {"}"}
{"\n"}
{"\n"}      <span className="tok-com">{"// Reset button state after 1.5s"}</span>
{"\n"}      <span className="tok-prop">setTimeout</span>(() {"=>"} {"{"}
{"\n"}        <span className="tok-sel">delete</span> <span className="tok-prop">btn</span>.<span className="tok-prop">dataset</span>.<span className="tok-prop">copied</span>;
{"\n"}        <span className="tok-prop">btn</span>.<span className="tok-prop">setAttribute</span>(<span className="tok-val">'aria-label'</span>, <span className="tok-val">'Copy to clipboard'</span>);
{"\n"}      {"}"}, <span className="tok-val">1500</span>);
{"\n"}    {"}"});
{"\n"}{"}"});</Example.Code>
      </Example>

      <h2 id="contract">The contract</h2>
      <ul>
        <li><strong>Delegated click listener on <code>document</code></strong> — works for buttons added dynamically.</li>
        <li><strong>Source = <code>data-copy-target</code> attribute</strong> — points at a selector. Falls back to <code>previousElementSibling</code> if attribute is missing.</li>
        <li><strong>Clipboard API + fallback</strong> — modern <code>navigator.clipboard.writeText()</code>, falls back to <code>execCommand('copy')</code> on non-HTTPS.</li>
        <li><strong>UI feedback</strong> — sets <code>data-copied=&ldquo;true&rdquo;</code> on the button for 1.5s. The <code>cia-copy-button</code> CSS reads this attribute to style the success state.</li>
        <li><strong>Toast auto-hide</strong> — if the button has <code>popovertarget</code>, calls <code>hidePopover()</code> on the linked element after 1.5s.</li>
        <li><strong>aria-label sync</strong> — flips between &ldquo;Copy to clipboard&rdquo; and &ldquo;Copied to clipboard&rdquo; for screen reader announcement.</li>
      </ul>

      <h2 id="alternatives">Alternatives</h2>
      <ul>
        <li><strong>Write your own.</strong> The contract above is the only thing the <code>cia-copy-button</code> CSS depends on. Replace the shim with React, Vue, Svelte, Alpine, your own framework — as long as the contract holds, styling works.</li>
        <li><strong>Wait for <code>@cia/copy-button</code> add-on.</strong> A separate npm package on the v1.x roadmap that ships this shim as an opt-in dependency. cia core stays JS-free; consumers who want a packaged solution install the add-on.</li>
      </ul>
    </>
  );
}
