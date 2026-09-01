import Example from "@/components/Example";
import Badge from "@/components/Badge";

export default function AccordionDocsPage() {
  return (
    <>
      <h1>Accordion</h1>
      <p className="lead">
        Zero-JS accordion built on native <code>{`<details name="…">`}</code>. The browser handles
        mutual exclusion — open one, siblings close automatically. No JavaScript, no hydration,
        no third-party Disclosure component.
      </p>

      <p>
        <Badge>0 KB JS</Badge>{" "}
        <Badge>Baseline 2024</Badge>{" "}
        <Badge>WCAG 2.2 keyboard-native</Badge>
      </p>

      <h2 id="usage">Usage</h2>
      <p>
        The mixin is the primary API. Apply it to whatever selector you like — cia doesn&rsquo;t care
        whether it&rsquo;s a class, a bare tag, or an attribute selector.
      </p>
      <Example>
        <Example.Code><span className="tok-com">{"// app.scss — mixin form"}</span>
{"\n"}<span className="tok-sel">@use</span> <span className="tok-val">'css-is-awesome'</span> <span className="tok-prop">as</span> <span className="tok-val">cia</span>;
{"\n"}
{"\n"}<span className="tok-sel">.faq-item</span> {"{"} <span className="tok-prop">@include</span> <span className="tok-val">cia.accordion</span>; {"}"}</Example.Code>
      </Example>
      <p>
        Pair with the opt-in utility class if you prefer to skip the Sass step:
      </p>
      <Example>
        <Example.Code><span className="tok-com">{"<!-- index.html -->"}</span>
{"\n"}<span className="tok-sel">{"<details"}</span> <span className="tok-prop">name</span>=<span className="tok-val">"faq"</span> <span className="tok-prop">class</span>=<span className="tok-val">"cia-accordion"</span><span className="tok-sel">{">"}</span>
{"\n"}  <span className="tok-sel">{"<summary>"}</span>What is mutual exclusion?<span className="tok-sel">{"</summary>"}</span>
{"\n"}  <span className="tok-sel">{"<div>"}</span>Open one, the others close. Native HTML since 2024.<span className="tok-sel">{"</div>"}</span>
{"\n"}<span className="tok-sel">{"</details>"}</span>
{"\n"}<span className="tok-sel">{"<details"}</span> <span className="tok-prop">name</span>=<span className="tok-val">"faq"</span> <span className="tok-prop">class</span>=<span className="tok-val">"cia-accordion"</span><span className="tok-sel">{">"}</span>
{"\n"}  <span className="tok-sel">{"<summary>"}</span>Do I need JavaScript?<span className="tok-sel">{"</summary>"}</span>
{"\n"}  <span className="tok-sel">{"<div>"}</span>No. The browser handles everything via the <code>name</code> attribute.<span className="tok-sel">{"</div>"}</span>
{"\n"}<span className="tok-sel">{"</details>"}</span></Example.Code>
      </Example>

      <h2 id="comparison">vs. Tailwind + Headless UI</h2>
      <p>The native primitive doesn&rsquo;t just save bytes — it removes a whole layer of state management:</p>
      <table>
        <thead>
          <tr><th>Metric</th><th>cia</th><th>Tailwind + Headless UI</th></tr>
        </thead>
        <tbody>
          <tr><td>JavaScript shipped</td><td><strong>0 KB</strong></td><td>~22 KB (Disclosure)</td></tr>
          <tr><td>LOC for 2-item accordion</td><td>~12</td><td>~70</td></tr>
          <tr><td>State management</td><td>Browser via <code>name</code></td><td>React state hooks</td></tr>
          <tr><td>SSR / static export</td><td>Works as-is</td><td>Hydrates on client</td></tr>
          <tr><td>Keyboard a11y</td><td>Native (Tab + Space/Enter)</td><td>Wired in component</td></tr>
          <tr><td>CSP-strict deploy</td><td>Works</td><td>Inline-style nonces needed</td></tr>
        </tbody>
      </table>

      <h2 id="a11y">Accessibility</h2>
      <ul>
        <li><strong>Keyboard:</strong> Tab to focus the summary, Space or Enter to toggle. Native.</li>
        <li><strong>Screen readers:</strong> announces as &ldquo;expandable&rdquo; / &ldquo;collapsed&rdquo;. Native.</li>
        <li><strong>Focus ring:</strong> routes through <code>m.focus-ring</code> — same indicator everywhere in cia.</li>
        <li><strong>Touch target:</strong> summary has <code>min-height: var(--touch-target-min, 24px)</code> per WCAG 2.2 SC 2.5.8.</li>
        <li><strong>Reduced motion:</strong> the chevron rotation respects <code>prefers-reduced-motion</code>.</li>
      </ul>

      <h2 id="theming">Theming</h2>
      <p>
        The accordion reads tokens via <code>var()</code>: <code>--border-default</code>, <code>--surface-default</code>,
        <code>--text-primary</code>, <code>--text-secondary</code>, <code>--interactive-hover</code>,
        <code>--radius-md</code>, <code>--space-3</code>, <code>--space-4</code>, <code>--duration-fast</code>, <code>--ease</code>.
        Override any of these on <code>:root</code> or in your theme file to retheme without touching the mixin.
      </p>

      <h2 id="source">Source</h2>
      <p>
        See <code>scss/components/_accordion.scss</code>. ~70 LOC. Mixin-first; class form is convenience-only.
      </p>
    </>
  );
}
