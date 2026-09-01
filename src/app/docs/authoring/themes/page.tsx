import Link from "next/link";
import Example from "@/components/Example";

export default function AuthoringThemesPage() {
  return (
    <>
      <h1>Authoring a theme</h1>
      <p className="lead">
        Since v0.8, a theme is a single SCSS source at{" "}
        <code>scss/themes/&lt;name&gt;.scss</code> that compiles to one CSS file
        at <code>public/themes/&lt;name&gt;/theme.css</code>. Both light and dark
        modes live inside the single file via native <code>light-dark()</code>.
        The validator guarantees a clean one-file swap.
      </p>

      <h2 id="overview">Overview</h2>
      <ul>
        <li>
          Author SCSS source: <code>scss/themes/&lt;name&gt;.scss</code>. Wrap
          everything in <code>@include cia.theme(&apos;name&apos;) {`{...}`}</code>{" "}
          — the mixin emits{" "}
          <code>:root, :root[data-theme=&quot;name&quot;]</code> plus the{" "}
          <code>color-scheme</code> declaration. The bare <code>:root</code> is
          what makes a dropped-in file work with no markup change.
        </li>
        <li>
          Build to CSS: <code>npm run build:css:themes</code> compiles every
          source in <code>scss/themes/</code> to{" "}
          <code>public/themes/&lt;name&gt;/theme.css</code>.
        </li>
        <li>
          Validate: <code>node scripts/theme-validator.js --all</code>. Every
          theme must declare every required token in{" "}
          <code>scripts/theme-contract.json</code>. WCAG 2.2 AA contrast is also
          checked.
        </li>
      </ul>

      <h2 id="quickstart">Quickstart — a new theme</h2>
      <Example>
        <Example.Code><span className="tok-com">{"// scss/themes/midnight.scss"}</span>
{"\n"}<span className="tok-sel">@use</span> <span className="tok-val">'../mixins'</span> <span className="tok-prop">as</span> <span className="tok-val">m</span>;
{"\n"}
{"\n"}<span className="tok-sel">@include</span> <span className="tok-val">m.theme(&apos;midnight&apos;)</span> {"{"}
{"\n"}  <span className="tok-com">{"/* Surfaces — light-dark() handles both modes */"}</span>
{"\n"}  <span className="tok-prop">--background-default</span>: <span className="tok-val">light-dark(#f5f5f7, #0a0a0e)</span>;
{"\n"}  <span className="tok-prop">--surface-default</span>:    <span className="tok-val">light-dark(#ffffff, #14141a)</span>;
{"\n"}  <span className="tok-prop">--text-primary</span>:       <span className="tok-val">light-dark(#0a0a0e, #f5f5f7)</span>;
{"\n"}  <span className="tok-prop">--text-secondary</span>:     <span className="tok-val">light-dark(#54545e, #b5b5bf)</span>;
{"\n"}
{"\n"}  <span className="tok-com">{"/* Primary accent + auto-derived states via color-mix */"}</span>
{"\n"}  <span className="tok-prop">--action-primary-default</span>: <span className="tok-val">light-dark(#3A5FCD, #60a5fa)</span>;
{"\n"}  <span className="tok-sel">@include</span> <span className="tok-val">m.states(action-primary)</span>;
{"\n"}
{"\n"}  <span className="tok-com">{"/* Typography, radius, motion — identical across modes (no light-dark needed) */"}</span>
{"\n"}  <span className="tok-prop">--font-sans</span>: <span className="tok-val">system-ui, sans-serif</span>;
{"\n"}  <span className="tok-prop">--r-md</span>: <span className="tok-val">6px</span>;
{"\n"}  <span className="tok-prop">--duration-fast</span>: <span className="tok-val">120ms</span>;
{"\n"}{"}"}</Example.Code>
      </Example>
      <Example>
        <Example.Code><span className="tok-com">{"# build + validate"}</span>
{"\n"}<span className="tok-sel">npm</span> <span className="tok-val">run build:css:themes</span>
{"\n"}<span className="tok-sel">node</span> <span className="tok-val">scripts/theme-validator.js public/themes/midnight/theme.css</span></Example.Code>
      </Example>
      <h3 id="theme-mixin">The <code>theme()</code> signature</h3>
      <Example>
        <Example.Code><span className="tok-sel">@mixin</span> <span className="tok-val">theme($name, $scheme: light dark, $standalone: true)</span></Example.Code>
      </Example>
      <ul>
        <li>
          <code>$name</code> — the <code>data-theme</code> value.
        </li>
        <li>
          <code>$scheme</code> — the <code>color-scheme</code> value. Pass{" "}
          <code>light</code> or <code>dark</code> for a single-mode theme.
        </li>
        <li>
          <code>$standalone</code> — <code>true</code> (the default) emits{" "}
          <code>:root, :root[data-theme=&quot;name&quot;]</code> so the file works
          on its own. Pass <code>false</code> for the multi-theme bundle, where
          every theme shares one file and a bare <code>:root</code> would make
          them collide — there the attribute is the only thing telling them
          apart. You never hand-write a bundle block:{" "}
          <code>scripts/build-theme-bundle.mjs</code> regenerates{" "}
          <code>public/theme.css</code> from every built theme and strips the
          bare <code>:root</code> as it goes.
        </li>
      </ul>

      <p>
        Three shapes inside a single theme file:
      </p>
      <ul>
        <li><strong>Mode-stable</strong> — declare <code>color-scheme: light</code> (or dark) explicitly and skip <code>light-dark()</code>. Used by Sketchbook (light-only brand) and Terminal (dark-only sacred).</li>
        <li><strong>Symmetric (Pattern B)</strong> — <code>light-dark()</code> per color token; fonts/radii/motion identical across modes. Used by Boilerplate, Prism, Cupertino, Graphite, Press, Sketchbook (both modes).</li>
        <li><strong>Asymmetric (Pattern C)</strong> — one nested <code>@media (prefers-color-scheme: dark)</code> block inside the theme for non-color overrides (different blur, font, or radius per mode). Used by Glass. <code>light-dark()</code> is color-only per spec; non-color values need the nested block.</li>
      </ul>

      <h2 id="token-contract">The token contract</h2>
      <p>
        The machine-readable source of truth is{" "}
        <code>scripts/theme-contract.json</code>. It lists every CSS custom
        property a theme must declare. The validator reads this file — if you
        add a token to the base library, you add it to the contract, and every
        theme then has to declare it.
      </p>
      <p>The tokens fall into these categories:</p>
      <ul>
        <li>
          <strong>Surfaces</strong> — <code>--paper</code>,{" "}
          <code>--paper-raised</code>, <code>--paper-sunk</code>,{" "}
          <code>--paper-glass</code>. The page, card and elevated backgrounds.
        </li>
        <li>
          <strong>Ink</strong> — <code>--ink</code>, <code>--ink-soft</code>,{" "}
          <code>--ink-faint</code>, <code>--graphite</code>,{" "}
          <code>--muted</code>. Body text and its soft-to-faint ramp.
        </li>
        <li>
          <strong>Lines</strong> — <code>--guide</code>,{" "}
          <code>--guide-soft</code>, <code>--hair</code>,{" "}
          <code>--hair-soft</code>. Rules, dividers and borders.
        </li>
        <li>
          <strong>Primary</strong> — <code>--ai</code>, <code>--ai-ink</code>,{" "}
          <code>--ai-wash</code>. The main interactive accent (links,
          primary buttons).
        </li>
        <li>
          <strong>Seal</strong> — <code>--shu</code>, <code>--shu-wash</code>.
          The emphasis accent (badges, important callouts).
        </li>
        <li>
          <strong>Accent</strong> — <code>--ochre</code>,{" "}
          <code>--ochre-wash</code>. Marginalia, pull-quotes, tertiary accent.
        </li>
        <li>
          <strong>Code</strong> — <code>--code-bg</code>, <code>--code-ink</code>,{" "}
          <code>--code-muted</code>, <code>--code-accent</code>,{" "}
          <code>--code-green</code>, <code>--code-blue</code>. Syntax surface
          and its semantic tokens.
        </li>
        <li>
          <strong>Type</strong> — <code>--font-display</code>,{" "}
          <code>--font-serif</code>, <code>--font-sans</code>,{" "}
          <code>--font-mono</code>, <code>--font-script</code>,{" "}
          <code>--font-primary</code>, plus size/weight/line-height tokens.
        </li>
        <li>
          <strong>Radius</strong> — <code>--r-sm/md/lg</code> (library short
          scale) plus <code>--radius-sm/md/lg/xl/full</code> (semantic scale).
          The per-component overrides — <code>--btn-radius</code>,{" "}
          <code>--card-radius</code>, <code>--input-radius</code>,{" "}
          <code>--modal-radius</code>, <code>--badge-radius</code>,{" "}
          <code>--tag-radius</code> — are <em>optional</em>. Leave them out and
          each cascades from the generic radii above.
        </li>
        <li>
          <strong>Shadow</strong> — <code>--shadow-sm</code> through{" "}
          <code>--shadow-2xl</code>.
        </li>
        <li>
          <strong>Blur</strong> — <code>--blur-sm/md/lg</code>. Glass and
          backdrop filters.
        </li>
        <li>
          <strong>Glow</strong> — <code>--glow-sm/md/lg</code>. Focus rings
          and hover auras.
        </li>
        <li>
          <strong>Motion</strong> — <code>--duration-fast/normal/slow</code>,{" "}
          <code>--ease</code>.
        </li>
        <li>
          <strong>Semantic aliases</strong> —{" "}
          <code>--surface-default</code>, <code>--text-primary</code>,{" "}
          <code>--border-default</code>, <code>--action-primary-*</code>,{" "}
          <code>--interactive-hover</code>, <code>--background-*</code>, etc.
          These bridge library names to the native palette.
        </li>
        <li>
          <strong>Feedback / status</strong> —{" "}
          <code>--success-*</code>, <code>--warning-*</code>,{" "}
          <code>--error-*</code>, <code>--info-*</code>,{" "}
          <code>--feedback-*</code>. Every status colour has a{" "}
          <code>default</code>, <code>subtle</code> and <code>text</code>{" "}
          variant.
        </li>
        <li>
          <strong>Spacing</strong> — the numbered scale{" "}
          <code>--space-0</code> through <code>--space-9</code>. Required, and
          owned by the theme: declare it and the whole page re-proportions. The
          six t-shirt names (<code>--space-2xs/xs/sm/md/lg/xl</code>) are{" "}
          <em>optional</em> — the library emits them as <code>var()</code>{" "}
          references (<code>--space-md: var(--space-4)</code>), so they follow
          the numbered scale automatically.
        </li>
        <li>
          <strong>Layering</strong> — the <code>--z-*</code> scale
          (<code>--z-dropdown</code>, <code>--z-modal</code>, etc.).
        </li>
      </ul>
      <p>
        <strong>127 tokens are required; 36 more are optional</strong>, 163 in
        total. The optional set is the per-component radius and shadow
        overrides, the logo hooks, the named durations, the touch-target
        minimum, and the t-shirt spacing aliases.
      </p>
      <p>
        See <Link href="/docs/tokens">/docs/tokens</Link> for the full gallery
        with live swatches and current values for each shipped theme.
      </p>

      <h2 id="file-structure">File structure</h2>
      <p>
        A compiled theme file is a font <code>@import</code> (optional) plus a
        single <code>:root, :root[data-theme=&quot;name&quot;]</code> block that
        sets every required token. Preserve the commented section headers — they
        make the file scannable and keep the contract visually grouped.
      </p>
      <Example>
        <Example.Code><span className="tok-com">{"/* ============================================================"}</span>
{"\n"}<span className="tok-com">{"   THEME — My Brand"}</span>
{"\n"}<span className="tok-com">{"   ============================================================ */"}</span>
{"\n"}
{"\n"}<span className="tok-sel">@import</span> <span className="tok-val">url(&apos;https://fonts.googleapis.com/css2?family=Inter:wght@300..700&display=swap&apos;)</span>;
{"\n"}
{"\n"}<span className="tok-sel">:root, :root[data-theme=<span className="tok-val">&quot;my-brand&quot;</span>]</span> {"{"}
{"\n"}  <span className="tok-com">{"/* Surfaces */"}</span>
{"\n"}  <span className="tok-prop">--paper</span>:        <span className="tok-val">#FFFFFF</span>;
{"\n"}  <span className="tok-prop">--paper-raised</span>: <span className="tok-val">#F7F7F5</span>;
{"\n"}  <span className="tok-prop">--paper-sunk</span>:   <span className="tok-val">#EEEEEA</span>;
{"\n"}  <span className="tok-prop">--paper-glass</span>:  <span className="tok-val">rgba(255,255,255,0.80)</span>;
{"\n"}
{"\n"}  <span className="tok-com">{"/* Ink */"}</span>
{"\n"}  <span className="tok-prop">--ink</span>:       <span className="tok-val">#0A0A0A</span>;
{"\n"}  <span className="tok-prop">--ink-soft</span>:  <span className="tok-val">#4A4A4A</span>;
{"\n"}  <span className="tok-prop">--ink-faint</span>: <span className="tok-val">#8A8A8A</span>;
{"\n"}
{"\n"}  <span className="tok-com">{"/* Lines, Primary, Seal, Accent, Code, Type, */"}</span>
{"\n"}  <span className="tok-com">{"/* Radius, Shadow, Blur, Glow, Motion... */"}</span>
{"\n"}
{"\n"}  <span className="tok-com">{"/* Semantic aliases — bridge to library names */"}</span>
{"\n"}  <span className="tok-prop">--surface-default</span>: <span className="tok-val">var(--paper)</span>;
{"\n"}  <span className="tok-prop">--surface-raised</span>:  <span className="tok-val">var(--paper-raised)</span>;
{"\n"}  <span className="tok-prop">--text-primary</span>:    <span className="tok-val">var(--ink)</span>;
{"\n"}  <span className="tok-prop">--border-default</span>:  <span className="tok-val">var(--hair-soft)</span>;
{"\n"}{"}"}</Example.Code>
      </Example>
      <p>
        In the shipped consolidated file the body is identical, minus the bare{" "}
        <code>:root</code> — inside a bundle every theme would match{" "}
        <code>:root</code> at once and the last one would win, so the attribute
        is the only thing telling them apart. You do not write this by hand:{" "}
        <code>npm run build:css:themes</code> regenerates{" "}
        <code>public/theme.css</code> from every built theme and strips the bare{" "}
        <code>:root</code> for you.
      </p>
      <Example>
        <Example.Code><span className="tok-sel">:root[data-theme=<span className="tok-val">&quot;my-brand&quot;</span>]</span> {"{"}
{"\n"}  <span className="tok-com">{"/* same 127 required token declarations */"}</span>
{"\n"}  <span className="tok-prop">--paper</span>: <span className="tok-val">#FFFFFF</span>;
{"\n"}  <span className="tok-com">{"/* ... */"}</span>
{"\n"}{"}"}</Example.Code>
      </Example>

      <h2 id="step-by-step">Step by step</h2>
      <p>
        Edit the <strong>SCSS source</strong>, never the built CSS.{" "}
        <code>public/themes/*/theme.css</code> is a build artifact, and{" "}
        <code>npm run check:theme-drift</code> fails CI if it stops matching its
        source.
      </p>
      <ol>
        <li>
          Copy <code>scss/themes/press-light.scss</code> (or any shipped theme)
          as a starting point. Press is a good editorial baseline; Cupertino is
          a good rounded/soft baseline; Terminal is a good dark-mode baseline.
        </li>
        <li>
          Rename the file to <code>scss/themes/&lt;your-theme&gt;.scss</code> and
          change the name you pass to <code>m.theme(&apos;…&apos;)</code> to
          match. <code>npm run build:css:themes</code> compiles it to{" "}
          <code>public/themes/&lt;your-theme&gt;/theme.css</code>.
        </li>
        <li>
          Change every token <em>value</em> — leave every token{" "}
          <em>name</em>. Work category by category: start with surfaces
          (<code>--paper</code>, <code>--paper-raised</code>,{" "}
          <code>--paper-sunk</code>), then ink (<code>--ink</code>,{" "}
          <code>--ink-soft</code>, <code>--ink-faint</code>), then the rest of
          the palette, then type, then radii and shadows.
        </li>
        <li>
          Keep the semantic aliases intact:{" "}
          <code>--surface-default: var(--paper)</code>,{" "}
          <code>--text-primary: var(--ink)</code>, etc. These bridge library
          names to your native palette. Change the right-hand side only if
          your mood genuinely requires a different mapping (e.g. you want{" "}
          <code>--surface-default</code> to resolve to{" "}
          <code>--paper-raised</code>).
        </li>
        <li>
          Build, then run the validator against the compiled file:
          <Example>
            <Example.Code><span className="tok-com">$</span> npm run build:css:themes
{"\n"}<span className="tok-com">$</span> node scripts/theme-validator.js public/themes/&lt;your-theme&gt;/theme.css</Example.Code>
          </Example>
          It prints every missing token and every contrast failure. Fix them in
          the SCSS source, rebuild, and re-run until the output reads{" "}
          <code>OK</code>.
        </li>
        <li>
          Once the single file validates, register the theme in the picker.
          Add an entry (id + label) to the <code>THEMES</code> array in{" "}
          <code>src/components/ThemePicker/ThemePicker.tsx</code>, and — if you
          want a tile in the gallery — to the <code>THEMES</code> array in{" "}
          <code>src/app/themes/gallery/page.tsx</code>.
        </li>
        <li>
          Nothing else to do for the bundle:{" "}
          <code>npm run build:css:themes</code> regenerates{" "}
          <code>public/theme.css</code> from every built theme. The per-theme
          file is kept for standalone deploys; the bundle powers the docs site
          picker.
        </li>
      </ol>

      <h2 id="validator">The validator</h2>
      <p>
        <code>scripts/theme-validator.js</code> is zero-dependency Node. It
        auto-detects per-file vs consolidated input and reports missing tokens
        with a non-zero exit code on failure.
      </p>
      <ul>
        <li>
          <code>node scripts/theme-validator.js public/themes/my-theme/theme.css</code>{" "}
          — validate one standalone file. You can pass multiple paths.
        </li>
        <li>
          <code>node scripts/theme-validator.js --all</code> — discover and
          validate every shipped theme (the consolidated{" "}
          <code>public/theme.css</code> plus every{" "}
          <code>public/themes/*/theme.css</code>).
        </li>
        <li>
          <code>node scripts/theme-validator.js --help</code> — print usage.
        </li>
      </ul>
      <p>Exit codes:</p>
      <ul>
        <li>
          <code>0</code> — every validated file / block declares every
          required token.
        </li>
        <li>
          <code>1</code> — one or more files or blocks are missing tokens.
        </li>
        <li>
          <code>2</code> — usage error (file not found, bad args, bad
          contract).
        </li>
      </ul>
      <p>
        Wire <code>npm run validate-themes</code> into your pre-commit or CI
        step and authorship becomes a closed loop: if it passes, it ships.
      </p>

      <h2 id="design-guidance">Design guidance</h2>
      <ul>
        <li>
          Keep <code>--paper</code> and <code>--ink</code> contrasting — WCAG
          AA minimum (4.5:1) for body text, 3:1 for large text. Everything
          else is built on top of this pair.
        </li>
        <li>
          <code>--ai</code> is the primary accent; make it visually distinct
          from <code>--shu</code> (emphasis) and <code>--ochre</code>{" "}
          (marginalia). When all three appear on the same page, the reader
          should immediately know which is the link, which is the badge and
          which is the pull-quote.
        </li>
        <li>
          If your theme is dark-mode, <code>--paper</code> is still your dark
          surface and <code>--ink</code> is still your light text — the
          semantic names stay, the values swap. Do not rename tokens.
        </li>
        <li>
          Status colours (<code>--success-default</code>,{" "}
          <code>--error-default</code>, <code>--warning-default</code>,{" "}
          <code>--info-default</code>) should hit WCAG AA against{" "}
          <code>--paper</code>. Their <code>-text</code> variants are for
          foreground use on <code>-subtle</code> washes.
        </li>
        <li>
          Radii, shadows and motion durations define your theme&apos;s
          &quot;voice&quot; as much as colour does. Editorial themes have
          tight radii (2–4px), near-flat shadows, fast easing. Apple-flavoured
          themes have generous radii (10–14px), layered shadows, slower
          easing. Pick a voice and keep it consistent.
        </li>
      </ul>

      <h2 id="testing">Testing</h2>
      <ul>
        <li>
          Run the validator — <code>node scripts/theme-validator.js</code> on
          your file, then <code>--all</code> to confirm you haven&apos;t
          broken any shipped theme.
        </li>
        <li>
          Swap the attribute on <code>&lt;html data-theme=&quot;&lt;name&gt;&quot;&gt;</code>{" "}
          manually in DevTools and click through every page of the docs site.
          Every component should re-skin; nothing hard-coded should peek
          through. If you see a stray colour, the offender is the base
          library, not the theme — file a bug.
        </li>
        <li>
          Contrast is checked for you: the validator audits{" "}
          <strong>22 foreground/background pairs</strong> per theme — ink on
          paper, link on paper, every status <code>-text</code> on its matching{" "}
          <code>-subtle</code>, and the five <code>--code-*</code> tokens on{" "}
          <code>--code-bg</code> — in <em>both</em> <code>light-dark()</code>{" "}
          branches, keeping the worse result. Failures fail the build.
        </li>
        <li>
          Confirm the artifact still matches its source with{" "}
          <code>npm run check:theme-drift</code>. It rebuilds every theme into a
          scratch copy and diffs, so an edit made to the CSS instead of the SCSS
          shows up immediately.
        </li>
      </ul>

      <h2 id="shipping">Shipping</h2>
      <p>
        For a <strong>standalone deploy</strong>, drop your theme file in
        your own <code>public/themes/&lt;your-theme&gt;/theme.css</code> and
        link it from your HTML before <code>cia.css</code>. No registration and
        no <code>data-theme</code> attribute required — the file emits a bare{" "}
        <code>:root</code> alongside its own attribute selector, and the
        library&rsquo;s defaults sit at zero specificity under{" "}
        <code>:where(:root)</code>, so your theme wins regardless of load order.
      </p>
      <p>
        To <strong>contribute your theme upstream</strong>, open a PR using
        the Theme Submission template at{" "}
        <code>.github/ISSUE_TEMPLATE/theme_submission.yml</code>. See the full
        checklist in <code>CONTRIBUTING-THEMES.md</code> at the repo root —
        it covers validator output, screenshots per page, contrast notes and
        the picker registration diff.
      </p>
    </>
  );
}
