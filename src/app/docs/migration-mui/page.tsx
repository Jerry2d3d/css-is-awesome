import Link from "next/link";
import Example from "@/components/Example";

export default function MigrationMuiPage() {
  return (
    <>
      <h1>Migrating from MUI</h1>
      <p className="lead">
        <code>cia migrate mui</code> reads a MUI (Material UI, v5+) theme
        object you already have and writes a starting cia theme.scss with the
        same real values — one CLI command, not a rewrite from scratch.
      </p>

      <h2 id="scope">What this actually does</h2>
      <p>
        This is a <strong>token</strong> migration, not a component
        migration. It reads plain values off your{" "}
        <code>createTheme({"{...}"})</code> result — colors, spacing, border
        radius, font family — and maps them onto cia&apos;s own token
        contract. It never imports <code>@mui/material</code> and never
        touches your <code>&lt;Button&gt;</code>/<code>&lt;Card&gt;</code>/etc.
        components — cia has no React component library to translate them to
        (see <Link href="/docs/recipes">the recipes book</Link> for cia&apos;s
        actual framework story: copy-and-own patterns, not a component
        package). Migrating your component markup is a separate, manual step
        that happens after the theme is in place.
      </p>

      <h2 id="usage">Usage</h2>
      <Example>
        <Example.Code>
          <span className="tok-com">{"# writes ./cia-themes/migrated.scss"}</span>
          {"\n"}
          <span className="tok-sel">npx</span> <span className="tok-val">cia migrate mui ./src/theme.ts</span>
          {"\n"}
          {"\n"}
          <span className="tok-com">{"# name the output theme"}</span>
          {"\n"}
          <span className="tok-sel">npx</span> <span className="tok-val">cia migrate mui ./src/theme.ts --name acme</span>
          {"\n"}
          {"\n"}
          <span className="tok-com">{"# pipe-safe: dump the mapping + confidence report as JSON instead of writing a file"}</span>
          {"\n"}
          <span className="tok-sel">npx</span> <span className="tok-val">cia migrate mui ./src/theme.ts --json | jq</span> <span className="tok-val">&apos;.cia.report&apos;</span>
        </Example.Code>
      </Example>
      <p>
        <code>path</code> is any module — <code>.js</code>, <code>.ts</code>,{" "}
        <code>.mjs</code>, <code>.cjs</code> — that exports a MUI theme: a
        default export, a named <code>theme</code> export, or the result of{" "}
        <code>createTheme({"{...}"})</code> assigned directly. TypeScript
        files are loaded via <code>jiti</code> (no separate build step
        needed).
      </p>

      <h2 id="mapping">What gets mapped</h2>
      <table className="cia-table">
        <thead>
          <tr>
            <th>MUI</th>
            <th>cia token</th>
            <th>Confidence</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>palette.primary.main</code></td>
            <td><code>--action-primary-default</code></td>
            <td>HIGH</td>
          </tr>
          <tr>
            <td><code>palette.secondary.main</code></td>
            <td><code>--action-secondary-default</code></td>
            <td>HIGH</td>
          </tr>
          <tr>
            <td><code>palette.error/warning/info/success.main</code></td>
            <td>the matching <code>--&lt;status&gt;-default</code></td>
            <td>HIGH</td>
          </tr>
          <tr>
            <td><code>palette.text.primary</code> / <code>.secondary</code></td>
            <td><code>--text-primary</code> / <code>--text-secondary</code></td>
            <td>HIGH</td>
          </tr>
          <tr>
            <td><code>palette.background.default</code></td>
            <td><code>--background-default</code></td>
            <td>HIGH</td>
          </tr>
          <tr>
            <td><code>palette.background.paper</code></td>
            <td><code>--surface-default</code></td>
            <td>MEDIUM</td>
          </tr>
          <tr>
            <td><code>spacing</code> (number, function, or array)</td>
            <td>the closest <code>--space-N</code> per sampled factor 1-9</td>
            <td>varies</td>
          </tr>
          <tr>
            <td><code>shape.borderRadius</code></td>
            <td>the closest <code>--radius-*</code></td>
            <td>varies</td>
          </tr>
          <tr>
            <td><code>typography.fontFamily</code></td>
            <td><code>--font-sans</code></td>
            <td>HIGH</td>
          </tr>
        </tbody>
      </table>
      <p>
        <strong>
          Not mapped: <code>shadows[0..24]</code>, per-heading{" "}
          <code>typography.h1..h6.fontSize</code>, <code>breakpoints</code>.
        </strong>{" "}
        MUI&apos;s 24-elevation shadow system has no natural match against
        cia&apos;s 5 named shadow steps (<code>shadow-sm</code> through{" "}
        <code>shadow-2xl</code>) — forcing an automatic mapping there would be
        arbitrary, not more correct, so it&apos;s surfaced once as an
        informational note instead. cia&apos;s breakpoints are a fixed system
        scale, not themed per project, so they&apos;re not migrated at all.
      </p>
      <p>
        <strong>Hover and active states aren&apos;t read from MUI&apos;s{" "}
        <code>.dark</code>/<code>.light</code> shades.</strong> Once a{" "}
        <code>-default</code> token is set, cia derives its hover/active
        states automatically via <code>m.states()</code> (
        <code>color-mix(in oklch, ...)</code>) — the same mechanism the
        Tailwind and Bootstrap migrators already rely on. Mapping MUI&apos;s
        own shade values on top would create two competing hover mechanisms
        in one theme.
      </p>

      <h2 id="example">Example</h2>
      <p>A MUI theme with a primary color, a border radius, and a font:</p>
      <Example>
        <Example.Code>
          <span className="tok-com">{"// src/theme.ts"}</span>
          {"\n"}
          <span className="tok-sel">export const</span> <span className="tok-val">theme</span> = <span className="tok-val">createTheme</span>({"{"}
          {"\n"}  <span className="tok-prop">palette</span>: {"{"}
          {"\n"}    <span className="tok-prop">primary</span>: {"{"} <span className="tok-prop">main</span>: <span className="tok-val">&quot;#3A5FCD&quot;</span> {"}"},
          {"\n"}    <span className="tok-prop">error</span>: {"{"} <span className="tok-prop">main</span>: <span className="tok-val">&quot;#D32F2F&quot;</span> {"}"},
          {"\n"}  {"}"},
          {"\n"}  <span className="tok-prop">shape</span>: {"{"} <span className="tok-prop">borderRadius</span>: <span className="tok-val">6</span> {"}"},
          {"\n"}  <span className="tok-prop">typography</span>: {"{"} <span className="tok-prop">fontFamily</span>: <span className="tok-val">&apos;&quot;Inter&quot;, system-ui, sans-serif&apos;</span> {"}"},
          {"\n"}
          {"}"});
        </Example.Code>
      </Example>
      <p><code>npx cia migrate mui ./src/theme.ts</code> writes:</p>
      <Example>
        <Example.Code>
          <span className="tok-com">{"// migrated theme — generated by `cia migrate mui`"}</span>
          {"\n"}
          <span className="tok-com">{"// Mapping confidence — HIGH: 3 · MEDIUM: 0 · LOW: 0 · UNMAPPED: 1"}</span>
          {"\n"}
          {"\n"}
          <span className="tok-sel">@use</span> <span className="tok-val">&apos;css-is-awesome/scss/mixins&apos;</span> <span className="tok-prop">as</span> <span className="tok-val">m</span>;
          {"\n"}
          {"\n"}
          <span className="tok-sel">@include</span> <span className="tok-val">m.theme(&apos;migrated&apos;)</span> {"{"}
          {"\n"}  <span className="tok-prop">--action-primary-default</span>: <span className="tok-val">#3A5FCD</span>;
          {"\n"}  <span className="tok-prop">--error-default</span>: <span className="tok-val">#D32F2F</span>;
          {"\n"}  <span className="tok-prop">--radius-md</span>: <span className="tok-val">0.375rem</span>;
          {"\n"}  <span className="tok-prop">--font-sans</span>: <span className="tok-val">&quot;Inter&quot;, system-ui, sans-serif</span>;
          {"\n"}
          {"\n"}  <span className="tok-sel">@include</span> <span className="tok-val">m.states(action-primary)</span>;
          {"\n"}  <span className="tok-sel">@include</span> <span className="tok-val">m.states(error)</span>;
          {"\n"}
          {"}"}
        </Example.Code>
      </Example>

      <h2 id="next-steps">Next steps</h2>
      <ol>
        <li>
          Review the file — <code>MEDIUM</code>/<code>LOW</code>/
          <code>UNMAPPED</code> entries are flagged inline, and a fresh
          migration will always be a partial theme: it only has the tokens
          your MUI config actually defined. The rest of cia&apos;s 127
          required tokens need filling in — see{" "}
          <Link href="/docs/authoring/themes">Authoring a theme</Link> for
          the full contract and the validator loop.
        </li>
        <li>
          <code>@use</code> the file from your app&apos;s SCSS entry, set{" "}
          <code>&lt;html data-theme=&quot;migrated&quot;&gt;</code>, and run{" "}
          your build.
        </li>
        <li>
          Run <code>npm run validate-themes</code> (or{" "}
          <code>node scripts/theme-validator.js &lt;your-file&gt;</code> on
          its own) to confirm WCAG 2.2 AA contrast once the required tokens
          are filled in.
        </li>
        <li>
          Migrate component markup separately, on your own timeline — see{" "}
          <Link href="/docs/recipes">the recipes book</Link> for the patterns cia
          documents (dialog, combobox, data-table, forms, and more), each
          with real framework examples to adapt.
        </li>
      </ol>

      <h2 id="further-reading">Further reading</h2>
      <ul>
        <li>
          <Link href="/docs/authoring/themes">/docs/authoring/themes</Link> —
          the full token contract and the validator loop.
        </li>
        <li>
          <Link href="/docs/migration-chakra">/docs/migration-chakra</Link> — the
          same tool, for Chakra UI.
        </li>
        <li>
          <Link href="/docs/migration-tailwind">/docs/migration-tailwind</Link>,{" "}
          <Link href="/docs/migration-bootstrap">/docs/migration-bootstrap</Link> —
          the two other <code>cia migrate</code> tools.
        </li>
      </ul>
    </>
  );
}
