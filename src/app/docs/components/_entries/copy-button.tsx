import Example from "@/components/Example";
import type { DocEntry } from "../_registry/types";

// Copy Button — content ported verbatim from the former hand-written page;
// the live demo is NEW: the site's own CopyButton island (inside
// Example.Code), which IS the reference implementation of the documented
// recipe contract.
export const copyButtonEntry: DocEntry = {
  slug: "copy-button",
  name: "Copy Button",
  category: "Interactive component",
  oneLiner: (
    <>
      A copy-to-clipboard button with feedback states. cia ships the styling as
      a mixin — the clipboard logic is consumer-wired via the native{" "}
      <code>navigator.clipboard</code> API. The npm package contains{" "}
      <strong>zero JavaScript</strong>; the shim is a documented recipe (~1 KB
      gzipped) you opt into when you need it.
    </>
  ),
  badges: [
    "0 KB JS in package",
    "~1 KB recipe shim (opt-in)",
    "Clipboard API + execCommand fallback",
  ],

  demo: (
    <>
      <Example>
        <Example.Code>$ npm install css-is-awesome</Example.Code>
      </Example>
      <p>
        Hover the code block and press Copy — that button is the site&rsquo;s
        own CopyButton island, the reference implementation of the documented
        contract: <code>navigator.clipboard</code> write with an{" "}
        <code>execCommand</code> fallback, an <code>aria-label</code> flip to
        &ldquo;Copied to clipboard&rdquo;, and a <code>data-copied</code> state
        that reverts after 1.5s.
      </p>
    </>
  ),

  usage: (
    <>
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
    </>
  ),

  tabs: [
    {
      label: "JS recipe",
      content: (
        <>
          <p>
            The cia npm package <em>does not</em> ship a JS handler. Three
            opt-in paths:
          </p>
          <ol>
            <li>
              <strong>Copy-paste the framework-free shim</strong> from{" "}
              <code>/docs/recipes/copy-button</code> (~700 bytes). Drop it in
              your <code>{`<head>`}</code> with{" "}
              <code>{`<script type="module">`}</code>.
            </li>
            <li>
              <strong>Write your own handler.</strong> The contract is a
              delegated click listener that reads <code>data-copy-target</code>{" "}
              and toggles <code>data-copied=&ldquo;true&rdquo;</code> on the
              button for 1.5s.
            </li>
            <li>
              <strong>
                Install the <code>@cia/copy-button</code> add-on
              </strong>{" "}
              (v1.x roadmap). Separate npm package — keeps the cia core install
              JS-free.
            </li>
          </ol>
        </>
      ),
    },
    {
      label: "Toast variant",
      content: (
        <>
          <p>
            For a floating &ldquo;Copied!&rdquo; toast, pair the button with a
            popover and the <code>cia-copy-toast</code> mixin. The button uses{" "}
            <code>popovertarget</code> to show the toast; your handler calls{" "}
            <code>hidePopover()</code> after a timeout.
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
        </>
      ),
    },
    {
      label: "Accessibility",
      content: (
        <ul>
          <li><strong>Focus ring:</strong> routes through <code>m.focus-ring</code> — consistent with the rest of cia.</li>
          <li><strong>Touch target:</strong> <code>min-height: var(--touch-target-min, 24px)</code> per WCAG 2.2 SC 2.5.8.</li>
          <li><strong>aria-label sync:</strong> the recommended handler updates <code>aria-label</code> to &ldquo;Copied to clipboard&rdquo; on success, reverts after 1.5s.</li>
          <li><strong>Live region:</strong> the toast variant uses <code>popover=&ldquo;hint&rdquo;</code> which is announced; or wrap a text node in <code>aria-live=&ldquo;polite&rdquo;</code> if you prefer label-flip feedback only.</li>
        </ul>
      ),
    },
    {
      label: "Tokens",
      content: (
        <p>
          Reads <code>--text-primary</code>, <code>--text-secondary</code>,{" "}
          <code>--surface-raised</code>, <code>--surface-emphasis</code>,{" "}
          <code>--border-default</code>, <code>--border-emphasis</code>,{" "}
          <code>--success-*</code> (copied state), <code>--font-mono</code>,{" "}
          <code>--radius-sm</code>.
        </p>
      ),
    },
    {
      label: "Source",
      content: (
        <p>
          See <code>scss/components/_copy-button.scss</code> →{" "}
          <code>@mixin copy-button</code> + <code>@mixin copy-toast</code>.
        </p>
      ),
    },
  ],

  footerLinks: [
    { label: "← Docs home", href: "/docs" },
    { label: "Mixin reference", href: "/docs/mixins" },
    { label: "Source on GitHub", href: "https://github.com/Jerry2d3d/css-is-awesome/blob/main/scss/components/_copy-button.scss" },
  ],
};
