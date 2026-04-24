import Example from "@/components/Example";

export default function MigrationTailwindPage() {
  return (
    <>
      <h1>Migrating from Tailwind</h1>
      <p className="lead">
        Tailwind gives you atomic utilities; css-is-awesome gives you
        mixin-first composition and token-driven themes — fewer classes in
        your markup, one data-theme swap for the whole app.
      </p>

      <h2 id="why-migrate">Why migrate</h2>
      <p>
        Tailwind is a great atomic engine, and plenty of teams ship great
        products with it. If that&apos;s you, stay. The reasons to move off
        are almost always the same four: themes that need a rebuild,
        markup that drifts toward class soup, a consumer-side build
        pipeline, and JavaScript you didn&apos;t ask for.
      </p>
      <ul>
        <li>
          <strong>Token-driven theming.</strong> One{" "}
          <code>data-theme</code> flip reskins everything — no rebuild,
          no JIT pass, no PostCSS. Tailwind&apos;s equivalent is editing{" "}
          <code>tailwind.config.js</code> and recompiling the entire
          stylesheet.
        </li>
        <li>
          <strong>Mixin-first composition.</strong> You compose styles in
          SCSS with <code>@include</code>, keeping markup semantic
          (<code>&lt;Button variant=&quot;primary&quot;&gt;</code>) instead
          of stacking a dozen atomic classes on every element.
        </li>
        <li>
          <strong>Smaller runtime footprint.</strong> Consumers ship plain
          CSS. No JIT, no PostCSS, no content-scanning build step — cia
          is valid CSS on delivery.
        </li>
        <li>
          <strong>Zero JavaScript by default.</strong> Tailwind leans on
          Headless UI, Radix, or Alpine for interactivity. cia ships its
          own React components (Modal, Tabs, Dropdown) and they&apos;re
          opt-in — plain HTML + CSS works on its own.
        </li>
      </ul>

      <h2 id="philosophy-differences">Philosophy differences</h2>
      <p>
        The mental model shifts in four places. Layouts, sizing, and
        color semantics carry over once you remap them.
      </p>
      <table className="cia-table">
        <thead>
          <tr>
            <th>Concern</th>
            <th>Tailwind</th>
            <th>css-is-awesome</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Theming</td>
            <td>
              <code>tailwind.config.js</code> + rebuild
            </td>
            <td>
              <code>data-theme</code> attribute + CSS custom properties
            </td>
          </tr>
          <tr>
            <td>Composition</td>
            <td>Atomic classes stacked on every element</td>
            <td>
              Mixin <code>@include</code> in SCSS, or a small set of{" "}
              <code>.cia-*</code> utilities
            </td>
          </tr>
          <tr>
            <td>Build pipeline</td>
            <td>JIT / PurgeCSS scans templates at build time</td>
            <td>No build step on the consumer side — cia ships CSS</td>
          </tr>
          <tr>
            <td>Dark mode</td>
            <td>
              <code>dark:</code> variant on every affected class
            </td>
            <td>
              <code>data-theme=&quot;graphite&quot;</code> swaps one
              attribute for the whole app
            </td>
          </tr>
          <tr>
            <td>Directive</td>
            <td>
              <code>@apply btn-class text-sm</code> (Tailwind class list)
            </td>
            <td>
              <code>@include m.button-primary</code> (mixin name)
            </td>
          </tr>
        </tbody>
      </table>

      <h2 id="equivalents-table">Equivalents table</h2>
      <p>
        These are the substitutions you&apos;ll reach for daily. When a
        row lists both a utility and a mixin, pick whichever layer your
        project lives on — markup or SCSS.
      </p>
      <table className="cia-table">
        <thead>
          <tr>
            <th>Tailwind</th>
            <th>css-is-awesome</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>class=&quot;flex items-center justify-center&quot;</code>
            </td>
            <td>
              <code>class=&quot;cia-flex-center&quot;</code> or{" "}
              <code>@include m.flex-center</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>class=&quot;grid grid-cols-2 gap-4&quot;</code>
            </td>
            <td>
              <code>
                class=&quot;cia-grid cia-grid-cols-2 cia-gap-md&quot;
              </code>{" "}
              or <code>@include m.grid(2)</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>class=&quot;p-4&quot;</code> /{" "}
              <code>class=&quot;px-6 py-3&quot;</code>
            </td>
            <td>
              <code>class=&quot;cia-p-md&quot;</code> /{" "}
              <code>class=&quot;cia-px-lg cia-py-sm&quot;</code> (t-shirt
              scale — see{" "}
              <a href="/docs/utilities">utilities</a>)
            </td>
          </tr>
          <tr>
            <td>
              <code>class=&quot;text-gray-700&quot;</code>
            </td>
            <td>
              <code>
                style=&#123;&#123; color: &quot;var(--ink-soft)&quot;
                &#125;&#125;
              </code>{" "}
              — or <code>.cia-text-text-secondary</code> for the closest
              semantic utility
            </td>
          </tr>
          <tr>
            <td>
              <code>class=&quot;bg-blue-500&quot;</code>
            </td>
            <td>
              <code>
                style=&#123;&#123; background: &quot;var(--ai)&quot;
                &#125;&#125;
              </code>{" "}
              (cia&apos;s indigo accent token)
            </td>
          </tr>
          <tr>
            <td>
              <code>class=&quot;rounded-lg shadow-md&quot;</code>
            </td>
            <td>
              <code>
                style=&#123;&#123; borderRadius:
                &quot;var(--radius-lg)&quot;, boxShadow:
                &quot;var(--shadow-md)&quot; &#125;&#125;
              </code>{" "}
              or <code>class=&quot;cia-rounded-lg cia-shadow-md&quot;</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>class=&quot;hidden md:block&quot;</code>
            </td>
            <td>
              <code>
                class=&quot;cia-hidden cia-md:block&quot;
              </code>{" "}
              (cia responsive prefix is <code>cia-&lt;bp&gt;:</code>,
              breakpoint keys are <code>sm md lg xl 2xl</code>)
            </td>
          </tr>
          <tr>
            <td>
              <code>@apply flex items-center gap-2</code>
            </td>
            <td>
              <code>@include m.inline(2)</code> — or any other mixin.{" "}
              <code>@include</code> takes a mixin name, not a class list.
            </td>
          </tr>
          <tr>
            <td>Headless UI <code>&lt;Menu&gt;</code></td>
            <td>
              <code>&lt;Dropdown&gt;</code> from cia
            </td>
          </tr>
          <tr>
            <td>Headless UI <code>&lt;Dialog&gt;</code></td>
            <td>
              <code>&lt;Modal&gt;</code> from cia
            </td>
          </tr>
        </tbody>
      </table>

      <h2 id="component-mapping">Component mapping</h2>
      <p>
        Tailwind leaves behavior to you; most teams pull in Headless UI,
        Radix, or Alpine. cia ships the React layer in-core, so you can
        delete a dependency as you migrate.
      </p>
      <ul>
        <li>
          <strong>
            Tailwind + Headless UI <code>&lt;Menu&gt;</code>
          </strong>{" "}
          → <code>&lt;Dropdown&gt;</code> from cia. Controlled or
          uncontrolled, keyboard-accessible out of the box.
        </li>
        <li>
          <strong>
            Tailwind + Headless UI <code>&lt;Dialog&gt;</code>
          </strong>{" "}
          → <code>&lt;Modal&gt;</code> from cia. Focus trap, escape to
          close, and overlay styling are built in.
        </li>
        <li>
          <strong>
            Tailwind <code>&lt;Transition&gt;</code> wrappers
          </strong>{" "}
          → built into cia overlays. Motion tokens
          (<code>--motion-duration-*</code>, <code>--motion-ease-*</code>)
          drive enter/exit; no wrapper component needed.
        </li>
        <li>
          <strong>
            Tailwind plugin ecosystem (<code>@tailwindcss/forms</code>,{" "}
            <code>@tailwindcss/typography</code>)
          </strong>{" "}
          → cia ships forms and typography in-core. Use{" "}
          <code>&lt;Input&gt;</code>, <code>&lt;FormField&gt;</code>, and
          the <code>@include m.type(heading-1)</code> scale directly.
        </li>
      </ul>

      <h2 id="before-after">Before &amp; after</h2>
      <p>
        Same output, two markup styles. Tailwind first, then cia.
      </p>

      <h3 id="button-before-after">Button</h3>
      <Example>
        <Example.Code>
          <span className="tok-com">{"<!-- Tailwind -->"}</span>
          {"\n"}
          <span className="tok-sel">{"<button"}</span>{" "}
          <span className="tok-prop">type</span>=
          <span className="tok-val">&quot;button&quot;</span>{" "}
          <span className="tok-prop">class</span>=
          <span className="tok-val">
            &quot;bg-blue-500 hover:bg-blue-600 text-white font-medium
            px-4 py-2 rounded-md&quot;
          </span>
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

      <h3 id="card-before-after">Card</h3>
      <Example>
        <Example.Code>
          <span className="tok-com">{"<!-- Tailwind -->"}</span>
          {"\n"}
          <span className="tok-sel">{"<div"}</span>{" "}
          <span className="tok-prop">class</span>=
          <span className="tok-val">
            &quot;bg-white rounded-lg shadow-md p-6 border
            border-gray-200&quot;
          </span>
          <span className="tok-sel">{">"}</span>
          {"\n"}  <span className="tok-sel">{"<h3"}</span>{" "}
          <span className="tok-prop">class</span>=
          <span className="tok-val">
            &quot;text-lg font-semibold text-gray-900 mb-2&quot;
          </span>
          <span className="tok-sel">{">"}</span>Title
          <span className="tok-sel">{"</h3>"}</span>
          {"\n"}  <span className="tok-sel">{"<p"}</span>{" "}
          <span className="tok-prop">class</span>=
          <span className="tok-val">&quot;text-gray-700&quot;</span>
          <span className="tok-sel">{">"}</span>Body copy here.
          <span className="tok-sel">{"</p>"}</span>
          {"\n"}
          <span className="tok-sel">{"</div>"}</span>
        </Example.Code>
      </Example>
      <Example>
        <Example.Code>
          <span className="tok-com">{"{/* css-is-awesome (React) */}"}</span>
          {"\n"}
          <span className="tok-sel">{"<Card"}</span>{" "}
          <span className="tok-prop">title</span>=
          <span className="tok-val">&quot;Title&quot;</span>
          <span className="tok-sel">{">"}</span>
          {"\n"}  Body copy here.
          {"\n"}
          <span className="tok-sel">{"</Card>"}</span>
          {"\n"}
          {"\n"}
          <span className="tok-com">{"/* css-is-awesome (SCSS) */"}</span>
          {"\n"}
          <span className="tok-sel">.profile-card</span> {"{"}
          {"\n"}  <span className="tok-prop">@include</span>{" "}
          <span className="tok-val">m.card-base</span>;
          {"\n"}
          {"}"}
        </Example.Code>
      </Example>

      <h2 id="step-by-step">Step-by-step migration</h2>
      <p>
        Tailwind and cia can coexist in the same page while you convert.
        Don&apos;t do a big-bang rewrite.
      </p>
      <ol>
        <li>
          <strong>Install cia alongside Tailwind.</strong> Keep Tailwind
          where it is and add cia&apos;s theme + base stylesheets. See{" "}
          <a href="/docs/install">/docs/install</a>.
        </li>
        <li>
          <strong>Pick a theme file.</strong>{" "}
          <code>&lt;html data-theme=&quot;press&quot;&gt;</code> reskins
          the whole app without a rebuild. Preview themes before
          committing — see <a href="/docs/tokens">/docs/tokens</a>.
        </li>
        <li>
          <strong>Convert one component type at a time.</strong> Start
          with buttons — highest visibility, lowest risk. Replace{" "}
          <code>
            &lt;button class=&quot;bg-blue-500 px-4 py-2 rounded&quot;&gt;
          </code>{" "}
          with{" "}
          <code>&lt;Button variant=&quot;primary&quot;&gt;</code>.
        </li>
        <li>
          <strong>
            Replace stacked utilities in common layouts.
          </strong>{" "}
          <code>flex items-center justify-center</code> becomes{" "}
          <code>cia-flex-center</code> (markup) or{" "}
          <code>@include m.flex-center</code> (SCSS). A regex codemod
          handles the bulk.
        </li>
        <li>
          <strong>Delete Tailwind plugin imports</strong> for features
          cia handles —{" "}
          <code>@tailwindcss/forms</code> and{" "}
          <code>@tailwindcss/typography</code> both map to core cia.
        </li>
        <li>
          <strong>Remove Tailwind + PostCSS config.</strong> Delete{" "}
          <code>tailwind.config.js</code>, drop{" "}
          <code>tailwind</code> from <code>package.json</code>, remove{" "}
          <code>@tailwind</code> directives from your root CSS, and run{" "}
          <code>npm run validate-themes</code> to confirm nothing
          references Tailwind-only variables.
        </li>
      </ol>

      <h2 id="gotchas">Gotchas</h2>
      <ul>
        <li>
          <strong>
            Tailwind&apos;s <code>dark:</code> variant doesn&apos;t map
            1:1.
          </strong>{" "}
          cia uses the <code>data-theme</code> attribute for any theme
          switch —{" "}
          <code>data-theme=&quot;graphite&quot;</code> is cia&apos;s dark
          mode, but it&apos;s just another theme and the mechanism is
          the same as brand themes.
        </li>
        <li>
          <strong>
            <code>@apply</code> and <code>@include</code> are close, not
            identical.
          </strong>{" "}
          <code>@apply</code> takes a list of Tailwind classes;{" "}
          <code>@include</code> takes a mixin name and (optional)
          arguments. You can&apos;t drop-in replace class lists with
          mixins — pick the mixin that matches the intent.
        </li>
        <li>
          <strong>Tailwind&apos;s JIT purges unused classes.</strong>{" "}
          cia&apos;s utility set is intentionally small and always
          shipped — there&apos;s no content scan, and the full{" "}
          <code>.cia-*</code> surface is in the bundle. If size matters,
          lean on mixins instead of utilities.
        </li>
        <li>
          <strong>
            Tailwind color scale → cia semantic tokens.
          </strong>{" "}
          There&apos;s no 1:1 between <code>gray-500</code> and a cia
          token. Choose by role: <code>--ink</code> for foreground,{" "}
          <code>--text-secondary</code> for muted copy, <code>--ai</code>{" "}
          for the indigo accent, <code>--shu</code> for vermilion. Think
          in roles, not shades.
        </li>
        <li>
          <strong>Breakpoints differ — verify pixel values.</strong>{" "}
          cia&apos;s breakpoints are <code>sm 640px</code>,{" "}
          <code>md 768px</code>, <code>lg 1024px</code>,{" "}
          <code>xl 1280px</code>, <code>2xl 1536px</code>. Tailwind
          defaults match these today, but if you customized your
          Tailwind <code>screens</code>, re-check the mapping before
          assuming a codemod is safe. See{" "}
          <a href="/docs/utilities">/docs/utilities</a> for the source
          list.
        </li>
      </ul>

      <h2 id="further-reading">Further reading</h2>
      <ul>
        <li>
          <a href="/docs/mixins">/docs/mixins</a> — every mixin with a
          signature and a live example.
        </li>
        <li>
          <a href="/docs/tokens">/docs/tokens</a> — the full token
          vocabulary, and how to build a theme file.
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
