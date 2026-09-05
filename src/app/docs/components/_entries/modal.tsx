import Example from "@/components/Example";
import ModalDemo from "./ModalDemo";
import type { DocEntry } from "../_registry/types";

// Modal — content ported verbatim from the former hand-written page; the
// live demo is NEW: a native <dialog> styled by the real cia.modal mixin
// output (demos.modal), opened by a tiny client island (ModalDemo) because
// showModal() is the consumer's one line of JS per the component's own docs.
export const modalEntry: DocEntry = {
  slug: "modal",
  name: "Modal",
  category: "Interactive component",
  oneLiner: (
    <>
      Zero-JS modal built on native <code>{`<dialog>`}</code>. Escape closes
      it, focus is trapped, the background goes inert — all native browser
      behavior since Baseline 2022. Consumer triggers via{" "}
      <code>dialog.showModal()</code> (native DOM); cia ships zero modal
      JavaScript.
    </>
  ),
  badges: ["0 KB JS", "Baseline 2022", "Native focus trap"],

  demo: (
    <>
      <ModalDemo />
      <p>
        The open call is the consumer&rsquo;s one line of JavaScript — this
        demo&rsquo;s trigger runs exactly <code>dialog.showModal()</code>.
        Everything after it (Escape, the focus trap, the inert background,{" "}
        <code>::backdrop</code>) is native, and the dialog is the real{" "}
        <code>cia.modal</code> output.
      </p>
    </>
  ),

  usage: (
    <>
      <Example>
        <Example.Code><span className="tok-com">{"// app.scss"}</span>
{"\n"}<span className="tok-sel">@use</span> <span className="tok-val">'css-is-awesome'</span> <span className="tok-prop">as</span> <span className="tok-val">cia</span>;
{"\n"}
{"\n"}<span className="tok-sel">.confirm-dialog</span> {"{"} <span className="tok-prop">@include</span> <span className="tok-val">cia.modal</span>; {"}"}</Example.Code>
      </Example>
      <Example>
        <Example.Code><span className="tok-com">{"<!-- index.html -->"}</span>
{"\n"}<span className="tok-sel">{"<dialog"}</span> <span className="tok-prop">class</span>=<span className="tok-val">"cia-modal"</span> <span className="tok-prop">id</span>=<span className="tok-val">"confirm"</span><span className="tok-sel">{">"}</span>
{"\n"}  <span className="tok-sel">{"<h2>"}</span>Confirm action<span className="tok-sel">{"</h2>"}</span>
{"\n"}  <span className="tok-sel">{"<p>"}</span>Are you sure?<span className="tok-sel">{"</p>"}</span>
{"\n"}  <span className="tok-sel">{"<form"}</span> <span className="tok-prop">method</span>=<span className="tok-val">"dialog"</span><span className="tok-sel">{">"}</span>
{"\n"}    <span className="tok-sel">{"<button"}</span> <span className="tok-prop">value</span>=<span className="tok-val">"cancel"</span><span className="tok-sel">{">"}</span>Cancel<span className="tok-sel">{"</button>"}</span>
{"\n"}    <span className="tok-sel">{"<button"}</span> <span className="tok-prop">value</span>=<span className="tok-val">"confirm"</span><span className="tok-sel">{">"}</span>Delete<span className="tok-sel">{"</button>"}</span>
{"\n"}  <span className="tok-sel">{"</form>"}</span>
{"\n"}<span className="tok-sel">{"</dialog>"}</span>
{"\n"}
{"\n"}<span className="tok-sel">{"<button"}</span> <span className="tok-prop">onclick</span>=<span className="tok-val">"document.getElementById('confirm').showModal()"</span><span className="tok-sel">{">"}</span>
{"\n"}  Delete
{"\n"}<span className="tok-sel">{"</button>"}</span></Example.Code>
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
              <tr><td>JavaScript shipped</td><td><strong>0 KB</strong></td><td>~18 KB (Dialog)</td></tr>
              <tr><td>Focus trap</td><td>Native (Tab cycles within)</td><td>JS-driven</td></tr>
              <tr><td>Background inert</td><td>Native (<code>inert</code> applied)</td><td>JS-applied</td></tr>
              <tr><td>Escape to close</td><td>Native</td><td>JS event listener</td></tr>
              <tr><td>Animation</td><td>CSS keyframes via mixin</td><td>Tailwind transition classes</td></tr>
              <tr><td>Backdrop blur</td><td>Native <code>::backdrop</code> pseudo</td><td>Stacked div + backdrop-filter</td></tr>
            </tbody>
          </table>
        </div>
      ),
    },
    {
      label: "Accessibility",
      content: (
        <ul>
          <li><strong>Focus trap:</strong> native — Tab cycles within <code>{`<dialog>`}</code>, focus restored on close.</li>
          <li><strong>Escape:</strong> native — calls <code>HTMLDialogElement.close()</code>.</li>
          <li><strong>Background inert:</strong> native — when opened via <code>showModal()</code>, the rest of the page is non-interactive.</li>
          <li><strong>Reduced motion:</strong> open/close animation respects <code>prefers-reduced-motion</code>.</li>
          <li><strong>Form integration:</strong> <code>{`<form method="dialog">`}</code> closes the dialog on submit and returns the button&rsquo;s value.</li>
        </ul>
      ),
    },
    {
      label: "Tokens",
      content: (
        <p>
          Reads <code>--modal-padding</code>, <code>--modal-radius</code>,{" "}
          <code>--modal-shadow</code>, <code>--surface-default</code>,{" "}
          <code>--duration-normal</code>, <code>--ease</code>. Override any on{" "}
          <code>:root</code> or in your theme file.
        </p>
      ),
    },
    {
      label: "Source",
      content: (
        <p>
          See <code>scss/components/_overlay.scss</code> →{" "}
          <code>@mixin modal</code>. Wraps the existing
          <code>m.modal-base</code> with native <code>{`<dialog>`}</code>{" "}
          semantics + <code>::backdrop</code> styling + open animation.
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
