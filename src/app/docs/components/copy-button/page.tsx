import Example from "@/components/Example";
import Badge from "@/components/Badge";

export default function CopyButtonDocsPage() {
  return (
    <>
      <h1>Copy Button</h1>
      <p className="lead">
        A copy-to-clipboard button with feedback states. cia ships the styling as a mixin — the
        clipboard logic is consumer-wired via the native <code>navigator.clipboard</code> API.
        The npm package contains <strong>zero JavaScript</strong>; the shim is a documented recipe
        (~1 KB gzipped) you opt into when you need it.
      </p>

      <p>
        <Badge>0 KB JS in package</Badge>{" "}
        <Badge>~1 KB recipe shim (opt-in)</Badge>{" "}
        <Badge>Clipboard API + execCommand fallback</Badge>
      </p>

      <h2 id="usage">Usage (mixin)</h2>
      <Example>
        <Example.Code><span className="tok-com">{"// app.scss"}</span>
{"\n"}<span className="tok-sel">@use</span> <span className="tok-val">'css-is-awesome'</span> <span className="tok-prop">as</span> <span className="tok-val">cia</span>;
{"\n"}
{"\n"}<span className="tok-sel">.doc-copy</span> {"{"} <span className="tok-prop">@include</span> <span className="tok-val">cia.copy-button</span>; {"}"}</Example.Code>
      </Example>
      <Example>
        <Example.Code><span className="tok-com">{"<!-- index.html -->"}</span>
{"\n"}<span className="tok-sel">{"<pre"}</span> <span className="tok-prop">id</span>=<span className="tok-val">"snippet1"</span><span className="tok-sel">{">"}</span>$ npm install css-is-awesome<span className="tok-sel">{"</pre>"}</span>
{"\n"}<span className="tok-sel">{"<button"}</span> <span className="tok-prop">data-copy-target</span>=<span className="tok-val">"#snippet1"</span>
{"\n"}        <span className="tok-prop">class</span>=<span className="tok-val">"cia-copy-button"</span><span className="tok-sel">{">"}</span>Copy<span className="tok-sel">{"</button>"}</span></Example.Code>
      </Example>

      <h2 id="js-recipe">Optional JS recipe (consumer chooses)</h2>
      <p>
        The cia npm package <em>does not</em> ship a JS handler. Three opt-in paths:
      </p>
      <ol>
        <li>
          <strong>Copy-paste the framework-free shim</strong> from <code>/docs/recipes/copy-button</code>{" "}
          (~700 bytes). Drop it in your <code>{`<head>`}</code> with <code>{`<script type="module">`}</code>.
        </li>
        <li>
          <strong>Write your own handler.</strong> The contract is a delegated click listener that reads{" "}
          <code>data-copy-target</code> and toggles <code>data-copied=&ldquo;true&rdquo;</code> on the button for 1.5s.
        </li>
        <li>
          <strong>Install the <code>@cia/copy-button</code> add-on</strong> (v1.x roadmap). Separate npm package — keeps the cia core install JS-free.
        </li>
      </ol>

      <h2 id="toast">Toast variant</h2>
      <p>
        For a floating &ldquo;Copied!&rdquo; toast, pair the button with a popover and the{" "}
        <code>cia-copy-toast</code> mixin. The button uses <code>popovertarget</code> to show the toast; your
        handler calls <code>hidePopover()</code> after a timeout.
      </p>
      <Example>
        <Example.Code><span className="tok-sel">.copy-msg</span> {"{"} <span className="tok-prop">@include</span> <span className="tok-val">cia.copy-toast</span>; {"}"}</Example.Code>
      </Example>
      <Example>
        <Example.Code><span className="tok-sel">{"<button"}</span> <span className="tok-prop">data-copy-target</span>=<span className="tok-val">"#snippet2"</span>
{"\n"}        <span className="tok-prop">popovertarget</span>=<span className="tok-val">"copy-msg"</span>
{"\n"}        <span className="tok-prop">class</span>=<span className="tok-val">"cia-copy-button"</span><span className="tok-sel">{">"}</span>Copy<span className="tok-sel">{"</button>"}</span>
{"\n"}<span className="tok-sel">{"<div"}</span> <span className="tok-prop">id</span>=<span className="tok-val">"copy-msg"</span> <span className="tok-prop">popover</span>=<span className="tok-val">"hint"</span> <span className="tok-prop">class</span>=<span className="tok-val">"copy-msg"</span><span className="tok-sel">{">"}</span>Copied!<span className="tok-sel">{"</div>"}</span></Example.Code>
      </Example>

      <h2 id="a11y">Accessibility</h2>
      <ul>
        <li><strong>Focus ring:</strong> routes through <code>m.focus-ring</code> — consistent with the rest of cia.</li>
        <li><strong>Touch target:</strong> <code>min-height: var(--touch-target-min, 24px)</code> per WCAG 2.2 SC 2.5.8.</li>
        <li><strong>aria-label sync:</strong> the recommended handler updates <code>aria-label</code> to &ldquo;Copied to clipboard&rdquo; on success, reverts after 1.5s.</li>
        <li><strong>Live region:</strong> the toast variant uses <code>popover=&ldquo;hint&rdquo;</code> which is announced; or wrap a text node in <code>aria-live=&ldquo;polite&rdquo;</code> if you prefer label-flip feedback only.</li>
      </ul>

      <h2 id="theming">Theming</h2>
      <p>
        Reads <code>--text-primary</code>, <code>--text-secondary</code>, <code>--surface-raised</code>,
        <code>--surface-emphasis</code>, <code>--border-default</code>, <code>--border-emphasis</code>,
        <code>--success-*</code> (copied state), <code>--font-mono</code>, <code>--radius-sm</code>.
      </p>

      <h2 id="source">Source</h2>
      <p>
        See <code>scss/components/_copy-button.scss</code> → <code>@mixin copy-button</code> +{" "}
        <code>@mixin copy-toast</code>.
      </p>
    </>
  );
}
