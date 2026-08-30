import Link from "next/link";
import Example from "@/components/Example";
import Button from "@/components/Button";
import Alert from "@/components/Alert";

export default function DocsA11yPage() {
  return (
    <>
      <h1>Accessibility</h1>
      <p className="lead">
        Accessibility is a default, not a feature — the system ships the
        primitives; this page shows where they live.
      </p>

      <h2 id="focus-rings">Focus rings</h2>
      <p>
        The <code>focus-ring</code> mixin in <code>scss/_mixins.scss</code> is
        the single source of truth for visible keyboard focus. It targets{" "}
        <code>:focus-visible</code> (so mouse clicks never light up a button
        mid-press) and draws a 3-pixel ring in{" "}
        <code>var(--border-focus)</code>, which every theme overrides to a
        colour that passes WCAG contrast against its own background. Pass a
        non-zero <code>$offset</code> and the mixin switches from a{" "}
        <code>box-shadow</code> ring to a real <code>outline</code> with{" "}
        <code>outline-offset</code> — useful when an element has its own
        shadow you do not want the ring to fight with.
      </p>
      <Example>
        <Example.Preview style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Button variant="primary">Tab to me</Button>
          <Button variant="outline">Then to me</Button>
          <Button variant="ghost">And me</Button>
        </Example.Preview>
        <Example.Code><span className="tok-com">{"// signature"}</span>
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">focus-ring</span>(<span className="tok-val">$color: border-focus, $width: 3px, $offset: 0</span>);
{"\n"}
{"\n"}<span className="tok-com">{"// usage on a custom element"}</span>
{"\n"}<span className="tok-sel">.my-link</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.focus-ring</span>;
{"\n"}{"}"}
{"\n"}
{"\n"}<span className="tok-com">{"// with outline-offset for elements that already cast a shadow"}</span>
{"\n"}<span className="tok-sel">.chip</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.focus-ring($offset: 2px)</span>;
{"\n"}{"}"}</Example.Code>
      </Example>
      <p>
        Every interactive cia component — <code>Button</code>,{" "}
        <code>Input</code>, <code>Select</code>, <code>Tabs</code>,{" "}
        <code>Dropdown</code>, the dismiss control inside <code>Alert</code> —
        already includes <code>focus-ring</code> through its base mixin. You
        only need to call it yourself on bespoke interactive elements you
        compose outside the component set.
      </p>

      <h2 id="color-contrast">Colour contrast</h2>
      <p>
        Status tokens — <code>--success-default</code>,{" "}
        <code>--warning-default</code>, <code>--error-default</code>,{" "}
        <code>--info-default</code> — are defined in every one of the 24
        shipped themes and are tuned so that text set in the token reaches
        WCAG AA (4.5:1 for body copy, 3:1 for large text) against its intended
        surface. The same holds for <code>--text-default</code> against{" "}
        <code>--surface-default</code> and <code>--border-focus</code> against
        whatever component it wraps. The build audits{" "}
        <strong>22 foreground/background pairs per theme</strong> — including
        the five <code>--code-*</code> tokens against <code>--code-bg</code> —
        in both <code>light-dark()</code> branches, and fails on any miss. See{" "}
        <Link href="/docs/tokens#palette">/docs/tokens#palette</Link> for the
        full token gallery per theme.
      </p>
      <Example>
        <Example.Preview style={{ display: "grid", gap: "12px" }}>
          <Alert status="success" title="Payment received">
            We processed your order and emailed a receipt.
          </Alert>
          <Alert status="error" title="Could not save">
            The server rejected three of the nine fields. Fix the highlighted
            rows and try again.
          </Alert>
        </Example.Preview>
        <Example.Code><span className="tok-sel">{"<Alert"}</span> <span className="tok-prop">status</span>=<span className="tok-val">{'"success"'}</span> <span className="tok-prop">title</span>=<span className="tok-val">{'"Payment received"'}</span><span className="tok-sel">{">"}</span>
{"\n"}  We processed your order and emailed a receipt.
{"\n"}<span className="tok-sel">{"</Alert>"}</span>
{"\n"}
{"\n"}<span className="tok-sel">{"<Alert"}</span> <span className="tok-prop">status</span>=<span className="tok-val">{'"error"'}</span> <span className="tok-prop">title</span>=<span className="tok-val">{'"Could not save"'}</span><span className="tok-sel">{">"}</span>
{"\n"}  The server rejected three of the nine fields.
{"\n"}<span className="tok-sel">{"</Alert>"}</span></Example.Code>
      </Example>

      <h2 id="sr-only">Screen-reader-only text</h2>
      <p>
        The <code>.cia-sr-only</code> utility hides content visually while
        keeping it in the accessibility tree, so assistive technology still
        announces it. Use it to label icon-only controls, annotate decorative
        layout, or expose headings that a sighted user gets from visual
        structure. A matching <code>.cia-not-sr-only</code> utility reverses
        the effect — useful for skip links that should appear on focus.
      </p>
      <Example>
        <Example.Code><span className="tok-com">{"/* from scss/_utilities.scss */"}</span>
{"\n"}<span className="tok-sel">.cia-sr-only</span> {"{"}
{"\n"}  <span className="tok-prop">position</span>: <span className="tok-val">absolute</span>;
{"\n"}  <span className="tok-prop">width</span>: <span className="tok-val">1px</span>;
{"\n"}  <span className="tok-prop">height</span>: <span className="tok-val">1px</span>;
{"\n"}  <span className="tok-prop">padding</span>: <span className="tok-val">0</span>;
{"\n"}  <span className="tok-prop">margin</span>: <span className="tok-val">-1px</span>;
{"\n"}  <span className="tok-prop">overflow</span>: <span className="tok-val">hidden</span>;
{"\n"}  <span className="tok-prop">clip</span>: <span className="tok-val">rect(0, 0, 0, 0)</span>;
{"\n"}  <span className="tok-prop">border</span>: <span className="tok-val">0</span>;
{"\n"}{"}"}</Example.Code>
      </Example>
      <Example>
        <Example.Preview style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Button variant="ghost" aria-label="Close dialog">
            <span aria-hidden="true">×</span>
            <span className="cia-sr-only">Close dialog</span>
          </Button>
        </Example.Preview>
        <Example.Code><span className="tok-sel">{"<button"}</span> <span className="tok-prop">class</span>=<span className="tok-val">"cia-btn-ghost"</span><span className="tok-sel">{">"}</span>
{"\n"}  <span className="tok-sel">{"<span"}</span> <span className="tok-prop">aria-hidden</span>=<span className="tok-val">"true"</span><span className="tok-sel">{">"}</span>×<span className="tok-sel">{"</span>"}</span>
{"\n"}  <span className="tok-sel">{"<span"}</span> <span className="tok-prop">class</span>=<span className="tok-val">"cia-sr-only"</span><span className="tok-sel">{">"}</span>Close dialog<span className="tok-sel">{"</span>"}</span>
{"\n"}<span className="tok-sel">{"</button>"}</span></Example.Code>
      </Example>
      <p>
        A parallel <code>@mixin sr-only</code> lives in{" "}
        <code>scss/_mixins.scss</code> when you would rather compose the same
        declarations into your own class.
      </p>

      <h2 id="keyboard-nav">Keyboard navigation</h2>
      <p>
        Every interactive cia React component — <code>Tabs</code>,{" "}
        <code>Dropdown</code>, <code>Modal</code>, <code>Tooltip</code>,{" "}
        <code>DataTable</code>, <code>Accordion</code> — ships with keyboard
        handling wired up: arrow keys for roving tab-index inside menus and
        tablists, <kbd>Escape</kbd> to close overlays, <kbd>Enter</kbd> and{" "}
        <kbd>Space</kbd> to activate. For custom interactive elements you
        build yourself, reach for native <code>&lt;button&gt;</code>,{" "}
        <code>&lt;a href&gt;</code> or <code>&lt;input&gt;</code> before
        writing a <code>&lt;div onClick&gt;</code> — the browser gives you
        focus management, keyboard activation and correct role for free.
      </p>
      <p>
        When you genuinely need a custom widget pattern (a split button, a
        command palette, a combobox), the{" "}
        <a href="https://www.w3.org/WAI/ARIA/apg/patterns/" target="_blank" rel="noreferrer">
          WAI-ARIA Authoring Practices
        </a>{" "}
        documents every pattern with the keyboard interaction model you are
        expected to match.
      </p>

      <h2 id="aria-patterns">ARIA patterns</h2>
      <p>
        Each high-level cia component implements a named pattern from the
        Authoring Practices Guide. The table below maps them so you know
        exactly what behaviour is already covered.
      </p>
      <table>
        <thead>
          <tr>
            <th>Component</th>
            <th>Pattern</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>&lt;Modal&gt;</code></td>
            <td>Dialog, with focus trap and restore on close</td>
          </tr>
          <tr>
            <td><code>&lt;Tabs&gt;</code></td>
            <td>Tabs, with arrow-key navigation between tabs</td>
          </tr>
          <tr>
            <td><code>&lt;Dropdown&gt;</code></td>
            <td>Menu, with <kbd>Escape</kbd> to close and arrow keys to move</td>
          </tr>
          <tr>
            <td><code>&lt;Tooltip&gt;</code></td>
            <td>Tooltip, linked to its target with <code>aria-describedby</code></td>
          </tr>
          <tr>
            <td><code>&lt;Accordion&gt;</code></td>
            <td>Disclosure, one button per collapsible region</td>
          </tr>
        </tbody>
      </table>

      <h2 id="prefers-reduced-motion">Prefers-reduced-motion</h2>
      <p>
        Every animation shipped in the system is wrapped in a{" "}
        <code>@media (prefers-reduced-motion: reduce)</code> guard that
        shortens durations to near-zero and skips non-essential transforms.
        See{" "}
        <Link href="/docs/animation#reduced-motion">/docs/animation#reduced-motion</Link>{" "}
        for the implementation and the mixins that honour the preference
        automatically.
      </p>

      <h2 id="skip-to-content">Skip to content</h2>
      <p>
        <strong>Recommendation.</strong> The current{" "}
        <code>SiteHeader</code> does not yet include a skip link. A standard
        implementation pairs <code>.cia-sr-only</code> with{" "}
        <code>.cia-not-sr-only</code> on focus, so the link is invisible
        until a keyboard user tabs onto the first focusable element of the
        page. Target the page&apos;s main landmark by id.
      </p>
      <Example>
        <Example.Code><span className="tok-com">{"<!-- first element inside <body>, before the header -->"}</span>
{"\n"}<span className="tok-sel">{"<a"}</span> <span className="tok-prop">class</span>=<span className="tok-val">"cia-sr-only focus:cia-not-sr-only"</span> <span className="tok-prop">href</span>=<span className="tok-val">"#main"</span><span className="tok-sel">{">"}</span>
{"\n"}  Skip to content
{"\n"}<span className="tok-sel">{"</a>"}</span>
{"\n"}
{"\n"}<span className="tok-com">{"<!-- ... header, nav ... -->"}</span>
{"\n"}
{"\n"}<span className="tok-sel">{"<main"}</span> <span className="tok-prop">id</span>=<span className="tok-val">"main"</span><span className="tok-sel">{">"}</span>
{"\n"}  <span className="tok-com">{"<!-- page content -->"}</span>
{"\n"}<span className="tok-sel">{"</main>"}</span></Example.Code>
      </Example>
      <p>
        If you are writing the CSS yourself rather than composing utilities,
        the minimal rule is: absolutely position the link off-screen, then
        reveal it with <code>:focus</code> or <code>:focus-visible</code>.
      </p>

      <h2 id="writing-accessible-components">Writing accessible components</h2>
      <ul>
        <li>
          Use semantic HTML before ARIA — a <code>&lt;button&gt;</code> is
          always better than a <code>&lt;div role=&quot;button&quot;&gt;</code>,
          and <code>&lt;nav&gt;</code> beats{" "}
          <code>&lt;div role=&quot;navigation&quot;&gt;</code>.
        </li>
        <li>
          Mixins provide focus rings — do not remove <code>outline</code> or
          <code>box-shadow</code> on <code>:focus-visible</code> without a
          replacement. If the default ring fights your design, pass a
          different <code>$color</code> or <code>$offset</code> to{" "}
          <code>focus-ring</code>.
        </li>
        <li>
          Every form input needs a <code>&lt;label&gt;</code>. Either wrap
          the input in one, associate them with <code>for</code>/<code>id</code>,
          or use <code>&lt;FormField&gt;</code> from cia which wires the
          relationship for you.
        </li>
        <li>
          Colour is never the only cue. Pair status colour with an icon, a
          text label, or both — users with low vision, colour-blindness or a
          monochrome display still need to tell error from success.
        </li>
        <li>
          Test keyboard-only navigation on every interactive component you
          ship. Unplug the mouse, tab through the page, and verify that every
          action has a visible focus state and a keyboard activation path.
        </li>
      </ul>
    </>
  );
}
