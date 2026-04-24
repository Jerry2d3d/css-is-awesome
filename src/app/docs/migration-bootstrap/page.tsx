import Example from "@/components/Example";

export default function MigrationBootstrapPage() {
  return (
    <>
      <h1>Migrating from Bootstrap</h1>
      <p className="lead">
        If you know Bootstrap, you mostly know css-is-awesome — here&apos;s what
        changes and why.
      </p>

      <h2 id="why-migrate">Why migrate</h2>
      <p>
        Bootstrap is a great starting point for a lot of projects, and if
        yours is humming along, you don&apos;t have to move. But the cost of
        staying shows up in a few familiar places: long theme recompiles,
        utility markup sprawl, and a JavaScript bundle you may not need.
        css-is-awesome rethinks those trade-offs.
      </p>
      <ul>
        <li>
          <strong>Token-driven theming.</strong> One theme file (a flat list
          of CSS custom properties) reskins the entire system. No Sass
          recompile, no build step — swap the <code>&lt;link&gt;</code> and
          reload.
        </li>
        <li>
          <strong>Mixin-first API.</strong> You compose styles at the
          component level with SCSS mixins instead of stringing together a
          dozen utility classes in your markup.
        </li>
        <li>
          <strong>Smaller install footprint.</strong> Import only the parts
          you use. The utility layer is optional; the core ships as tokens +
          mixins.
        </li>
        <li>
          <strong>Zero JavaScript by default.</strong> cia&apos;s CSS is
          framework-agnostic. React components exist for the interactive
          pieces (Modal, Tabs, Dropdown) but they&apos;re opt-in.
        </li>
      </ul>

      <h2 id="philosophy-differences">Philosophy differences</h2>
      <p>
        The mental model shifts in four places. Everything else is close
        enough that muscle memory carries over.
      </p>
      <table className="cia-table">
        <thead>
          <tr>
            <th>Concern</th>
            <th>Bootstrap</th>
            <th>css-is-awesome</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Theming</td>
            <td>
              <code>$primary</code> Sass variable + full recompile
            </td>
            <td>
              <code>--ai</code> CSS custom property + hot swap
            </td>
          </tr>
          <tr>
            <td>JS components</td>
            <td>jQuery-era bundle + <code>data-bs-*</code> attributes</td>
            <td>React components (or none — plain HTML works)</td>
          </tr>
          <tr>
            <td>Utilities</td>
            <td>
              <code>.mt-3 .px-4 .d-flex</code> — unprefixed, global
            </td>
            <td>
              <code>.cia-*</code> namespaced, mixin-first
            </td>
          </tr>
          <tr>
            <td>Grid</td>
            <td>
              12-column <code>.row .col-md-6</code>
            </td>
            <td>
              Native CSS Grid + flex mixins (<code>@include m.grid(2)</code>)
            </td>
          </tr>
        </tbody>
      </table>

      <h2 id="equivalents-table">Equivalents table</h2>
      <p>
        Day-to-day, these are the substitutions you&apos;ll reach for. When
        both a React component and a mixin are listed, pick whichever layer
        your project already lives on.
      </p>
      <table className="cia-table">
        <thead>
          <tr>
            <th>Bootstrap</th>
            <th>css-is-awesome</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>.btn .btn-primary</code>
            </td>
            <td>
              <code>&lt;Button variant=&quot;primary&quot;&gt;</code> or{" "}
              <code>@include m.button-primary</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>.card</code>
            </td>
            <td>
              <code>&lt;Card title=&quot;...&quot;&gt;</code> (SCSS component
              styles live in <code>scss/components/_cards.scss</code>)
            </td>
          </tr>
          <tr>
            <td>
              <code>.container</code>, <code>.container-fluid</code>
            </td>
            <td>
              <code>@include m.container</code> (default xl) /{" "}
              <code>@include m.container(full)</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>.row .col-md-6</code>
            </td>
            <td>
              <code>@include m.grid(2)</code> or{" "}
              <code>display: grid; grid-template-columns: 1fr 1fr</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>.d-flex .justify-content-center .align-items-center</code>
            </td>
            <td>
              <code>.cia-flex-center</code> (or{" "}
              <code>@include m.flex-center</code>)
            </td>
          </tr>
          <tr>
            <td>
              <code>.mt-3 .px-4</code>
            </td>
            <td>
              <code>.cia-mt-md .cia-px-md</code> (t-shirt scale — see{" "}
              <a href="/docs/utilities">utilities</a>)
            </td>
          </tr>
          <tr>
            <td>
              <code>.text-primary .bg-light</code>
            </td>
            <td>
              <code>
                style=&#123;&#123; color: &quot;var(--ai)&quot;, background:
                &quot;var(--surface-subtle)&quot; &#125;&#125;
              </code>{" "}
              — or a semantic utility
            </td>
          </tr>
          <tr>
            <td>
              <code>.alert .alert-success</code>
            </td>
            <td>
              <code>&lt;Alert status=&quot;success&quot;&gt;</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>.badge .bg-success</code>
            </td>
            <td>
              <code>&lt;Badge status=&quot;success&quot;&gt;</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>.modal</code> + <code>data-bs-toggle</code>
            </td>
            <td>
              <code>&lt;Modal&gt;</code> (React, controlled)
            </td>
          </tr>
          <tr>
            <td>
              <code>.nav .nav-tabs</code>
            </td>
            <td>
              <code>&lt;Tabs&gt;</code> (React)
            </td>
          </tr>
          <tr>
            <td>
              <code>.form-control</code>, <code>.form-label</code>
            </td>
            <td>
              <code>&lt;Input&gt;</code> + <code>&lt;Label&gt;</code>, or{" "}
              <code>&lt;FormField&gt;</code> for the combined pattern
            </td>
          </tr>
        </tbody>
      </table>

      <h3 id="button-side-by-side">Side-by-side: button</h3>
      <p>Same output, two markup styles. Bootstrap first.</p>
      <Example>
        <Example.Code>
          <span className="tok-com">{"<!-- Bootstrap -->"}</span>
          {"\n"}
          <span className="tok-sel">{"<button"}</span>{" "}
          <span className="tok-prop">type</span>=
          <span className="tok-val">&quot;button&quot;</span>{" "}
          <span className="tok-prop">class</span>=
          <span className="tok-val">&quot;btn btn-primary&quot;</span>
          <span className="tok-sel">{">"}</span>
          {"\n"}  Save changes
          {"\n"}
          <span className="tok-sel">{"</button>"}</span>
        </Example.Code>
      </Example>
      <Example>
        <Example.Code>
          <span className="tok-com">{"{/* css-is-awesome (React) */}"}</span>
          {"\n"}
          <span className="tok-sel">{"<Button"}</span>{" "}
          <span className="tok-prop">variant</span>=
          <span className="tok-val">&quot;primary&quot;</span>
          <span className="tok-sel">{">"}</span>Save changes
          <span className="tok-sel">{"</Button>"}</span>
          {"\n"}
          {"\n"}
          <span className="tok-com">{"/* css-is-awesome (SCSS) */"}</span>
          {"\n"}
          <span className="tok-sel">.save-btn</span> {"{"}
          {"\n"}  <span className="tok-prop">@include</span>{" "}
          <span className="tok-val">m.button-primary</span>;
          {"\n"}
          {"}"}
        </Example.Code>
      </Example>

      <h3 id="grid-side-by-side">Side-by-side: two-column layout</h3>
      <p>
        Bootstrap leans on a 12-column abstraction. cia uses CSS Grid
        directly — the mixin is a shortcut, not a different system.
      </p>
      <Example>
        <Example.Code>
          <span className="tok-com">{"<!-- Bootstrap -->"}</span>
          {"\n"}
          <span className="tok-sel">{"<div"}</span>{" "}
          <span className="tok-prop">class</span>=
          <span className="tok-val">&quot;row&quot;</span>
          <span className="tok-sel">{">"}</span>
          {"\n"}  <span className="tok-sel">{"<div"}</span>{" "}
          <span className="tok-prop">class</span>=
          <span className="tok-val">&quot;col-md-6&quot;</span>
          <span className="tok-sel">{">"}</span>Left
          <span className="tok-sel">{"</div>"}</span>
          {"\n"}  <span className="tok-sel">{"<div"}</span>{" "}
          <span className="tok-prop">class</span>=
          <span className="tok-val">&quot;col-md-6&quot;</span>
          <span className="tok-sel">{">"}</span>Right
          <span className="tok-sel">{"</div>"}</span>
          {"\n"}
          <span className="tok-sel">{"</div>"}</span>
        </Example.Code>
      </Example>
      <Example>
        <Example.Code>
          <span className="tok-com">{"/* css-is-awesome */"}</span>
          {"\n"}
          <span className="tok-sel">.two-col</span> {"{"}
          {"\n"}  <span className="tok-prop">@include</span>{" "}
          <span className="tok-val">m.grid(2)</span>;
          {"\n"}
          {"}"}
          {"\n"}
          {"\n"}
          <span className="tok-com">{"{/* or inline */}"}</span>
          {"\n"}
          <span className="tok-sel">{"<div"}</span>{" "}
          <span className="tok-prop">style</span>=
          <span className="tok-val">
            {
              "{{ display: \"grid\", gridTemplateColumns: \"1fr 1fr\", gap: \"1rem\" }}"
            }
          </span>
          <span className="tok-sel">{">"}</span>
          {"\n"}  <span className="tok-sel">{"<div>"}</span>Left
          <span className="tok-sel">{"</div>"}</span>
          {"\n"}  <span className="tok-sel">{"<div>"}</span>Right
          <span className="tok-sel">{"</div>"}</span>
          {"\n"}
          <span className="tok-sel">{"</div>"}</span>
        </Example.Code>
      </Example>

      <h2 id="step-by-step">Step-by-step migration</h2>
      <p>
        Treat this as a gradual rollout, not a rewrite. Bootstrap and cia
        can coexist in the same page while you convert.
      </p>
      <ol>
        <li>
          <strong>Install cia alongside Bootstrap.</strong> Don&apos;t rip
          Bootstrap out on day one. Add cia&apos;s theme + base stylesheets
          after Bootstrap&apos;s so cia wins specificity ties. See{" "}
          <a href="/docs/install">/docs/install</a>.
        </li>
        <li>
          <strong>Pick a theme file.</strong> One{" "}
          <code>&lt;link&gt;</code> swap gives you cia&apos;s entire design
          language. Preview themes before committing — see{" "}
          <a href="/docs/tokens">/docs/tokens</a>.
        </li>
        <li>
          <strong>Convert one component type at a time.</strong> Start with
          buttons — highest visibility, lowest risk, and the fastest way to
          sanity-check your theme. Alerts, badges, and cards are natural
          next stops.
        </li>
        <li>
          <strong>Replace Bootstrap utilities as you touch files.</strong>{" "}
          <code>.mt-3</code> becomes <code>.cia-mt-md</code>,{" "}
          <code>.d-flex</code> becomes <code>.cia-flex</code>. A regex
          codemod handles the bulk of this — don&apos;t do it by hand.
        </li>
        <li>
          <strong>Swap Bootstrap JS for React (or nothing).</strong>{" "}
          Modals, tabs, dropdowns, tooltips — every Bootstrap JS plugin has
          a cia React equivalent. Forms and buttons often need no JS at
          all.
        </li>
        <li>
          <strong>Remove Bootstrap last.</strong> Delete the Bootstrap{" "}
          <code>&lt;link&gt;</code>, drop <code>bootstrap</code> from{" "}
          <code>package.json</code>, and run{" "}
          <code>npm run validate-themes</code> to confirm nothing still
          references Bootstrap-only variables.
        </li>
      </ol>

      <h2 id="gotchas">Gotchas</h2>
      <ul>
        <li>
          <strong>No bundled reset.</strong> Bootstrap ships Reboot
          (a <code>normalize.css</code> fork) as part of its base. cia
          does not. If you were relying on Bootstrap&apos;s cross-browser
          reset, add <code>normalize.css</code> (or your own) before cia.
        </li>
        <li>
          <strong>
            <code>.d-none</code> is not <code>.cia-hidden</code>.
          </strong>{" "}
          The classes look equivalent, but their responsive variants
          differ — Bootstrap uses <code>.d-md-none</code>, cia uses{" "}
          <code>.cia-md:hidden</code>. Check breakpoint prefixes when you
          codemod.
        </li>
        <li>
          <strong>No 12-column grid.</strong> cia never ships a{" "}
          <code>.row/.col-*</code> system. Use CSS Grid with{" "}
          <code>grid-template-columns</code>, or the{" "}
          <code>@include m.grid(n)</code> mixin for common column counts.
        </li>
        <li>
          <strong>Color tokens are named, not numbered.</strong> cia uses{" "}
          <code>--ai</code> (indigo accent), <code>--shu</code> (vermilion),{" "}
          <code>--ink</code>, <code>--paper</code> — not{" "}
          <code>$primary</code>, <code>$danger</code>,{" "}
          <code>$secondary</code>. Semantic aliases like{" "}
          <code>--success-text</code> and <code>--error-subtle</code> exist
          for status colors.
        </li>
        <li>
          <strong>Icons are separate.</strong> Bootstrap Icons are not
          part of cia. Bring your own icon system (Lucide, Phosphor, or
          SVG sprites). See <a href="/docs/tokens">/docs/tokens</a> for
          the sizing tokens icons should respect.
        </li>
      </ul>

      <h2 id="further-reading">Further reading</h2>
      <ul>
        <li>
          <a href="/docs/tokens">/docs/tokens</a> — the full token
          vocabulary, and how to build a theme file.
        </li>
        <li>
          <a href="/docs/mixins">/docs/mixins</a> — every mixin with a
          signature and a live example.
        </li>
        <li>
          <a href="/docs/utilities">/docs/utilities</a> — the{" "}
          <code>.cia-*</code> class reference, including responsive
          variants.
        </li>
      </ul>
    </>
  );
}
