import Link from "next/link";
import Example from "@/components/Example";

export default function MigrationChakraPage() {
  return (
    <>
      <h1>Migrating from Chakra UI</h1>
      <p className="lead">
        <code>cia migrate chakra</code> reads a Chakra UI (v2)
        theme object you already have and writes a starting cia theme.scss
        with the same real values — one CLI command, not a rewrite from
        scratch.
      </p>

      <h2 id="scope">What this actually does</h2>
      <p>
        This is a <strong>token</strong> migration, not a component
        migration. It reads plain values off your{" "}
        <code>extendTheme({"{...}"})</code> result — colors, spacing,
        border radii, fonts, font sizes — and maps them onto cia&apos;s own
        token contract. It never imports <code>@chakra-ui/react</code> and
        never touches your Chakra components — cia has no React component
        library to translate them to (see{" "}
        <Link href="/docs/recipes">the recipes book</Link> for cia&apos;s actual
        framework story: copy-and-own patterns, not a component package).
        Migrating your component markup is a separate, manual step that
        happens after the theme is in place. Scoped to Chakra v2&apos;s theme
        shape — v2 is still the dominant version as of this writing; v3
        changed the shape significantly and isn&apos;t handled here.
      </p>

      <h2 id="usage">Usage</h2>
      <Example>
        <Example.Code>
          <span className="tok-com">{"# writes ./cia-themes/migrated.scss"}</span>
          {"\n"}
          <span className="tok-sel">npx</span> <span className="tok-val">cia migrate chakra ./src/theme.ts</span>
          {"\n"}
          {"\n"}
          <span className="tok-com">{"# name the output theme"}</span>
          {"\n"}
          <span className="tok-sel">npx</span> <span className="tok-val">cia migrate chakra ./src/theme.ts --name acme</span>
          {"\n"}
          {"\n"}
          <span className="tok-com">{"# pipe-safe: dump the mapping + confidence report as JSON instead of writing a file"}</span>
          {"\n"}
          <span className="tok-sel">npx</span> <span className="tok-val">cia migrate chakra ./src/theme.ts --json | jq</span> <span className="tok-val">&apos;.cia.report&apos;</span>
        </Example.Code>
      </Example>
      <p>
        <code>path</code> is any module — <code>.js</code>, <code>.ts</code>,{" "}
        <code>.mjs</code>, <code>.cjs</code> — that exports a Chakra theme: a
        default export, a named <code>theme</code> export, or the result of{" "}
        <code>extendTheme({"{...}"})</code> assigned directly. TypeScript
        files are loaded via <code>jiti</code> (no separate build step
        needed).
      </p>

      <h2 id="mapping">What gets mapped</h2>
      <p>
        Chakra&apos;s theme shape lines up closely with Tailwind&apos;s —{" "}
        <code>colors</code> is the same <code>{"{shade: hex}"}</code>{" "}
        palette-object shape, so the same color-mapping engine (and its{" "}
        <code>brand</code>/<code>primary</code>-named-primary,{" "}
        <code>red</code>/<code>green</code>/<code>orange</code>/
        <code>blue</code>-for-status heuristics) applies unmodified:
      </p>
      <table className="cia-table">
        <thead>
          <tr>
            <th>Chakra</th>
            <th>cia token</th>
            <th>Confidence</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>colors.brand.500</code> (or <code>primary</code>/<code>accent</code>/<code>theme</code>)</td>
            <td><code>--action-primary-default</code></td>
            <td>HIGH</td>
          </tr>
          <tr>
            <td><code>colors.red/green/orange/blue.500</code></td>
            <td>the matching <code>--&lt;status&gt;-default</code></td>
            <td>MEDIUM</td>
          </tr>
          <tr>
            <td><code>space.*</code></td>
            <td>the closest <code>--space-N</code> per entry</td>
            <td>varies</td>
          </tr>
          <tr>
            <td><code>radii.*</code></td>
            <td>the closest <code>--radius-*</code></td>
            <td>varies</td>
          </tr>
          <tr>
            <td><code>fontSizes.*</code></td>
            <td>the closest <code>--font-size-N</code></td>
            <td>varies</td>
          </tr>
          <tr>
            <td><code>fonts.heading</code></td>
            <td><code>--font-display</code></td>
            <td>HIGH</td>
          </tr>
          <tr>
            <td><code>fonts.body</code></td>
            <td><code>--font-sans</code></td>
            <td>HIGH</td>
          </tr>
        </tbody>
      </table>
      <p>
        <strong>Not mapped: <code>shadows.*</code>, <code>breakpoints.*</code>,{" "}
        <code>zIndices.*</code>.</strong> None have a clean 1:1 cia analog —
        cia&apos;s shadow set is 5 named steps, and its breakpoints and
        z-layers are a fixed system scale, not themed per project. Each
        surfaces as one informational note rather than an arbitrary
        per-field guess.
      </p>

      <h2 id="example">Example</h2>
      <p>A Chakra theme with a brand color scale, a spacing customization, and a font:</p>
      <Example>
        <Example.Code>
          <span className="tok-com">{"// src/theme.ts"}</span>
          {"\n"}
          <span className="tok-sel">export const</span> <span className="tok-val">theme</span> = <span className="tok-val">extendTheme</span>({"{"}
          {"\n"}  <span className="tok-prop">colors</span>: {"{"}
          {"\n"}    <span className="tok-prop">brand</span>: {"{"} <span className="tok-prop">50</span>: <span className="tok-val">&quot;#EEF1FC&quot;</span>, <span className="tok-prop">500</span>: <span className="tok-val">&quot;#3A5FCD&quot;</span>, <span className="tok-prop">900</span>: <span className="tok-val">&quot;#1A2C63&quot;</span> {"}"},
          {"\n"}  {"}"},
          {"\n"}  <span className="tok-prop">fonts</span>: {"{"} <span className="tok-prop">heading</span>: <span className="tok-val">&apos;&quot;Inter&quot;, sans-serif&apos;</span>, <span className="tok-prop">body</span>: <span className="tok-val">&apos;&quot;Inter&quot;, sans-serif&apos;</span> {"}"},
          {"\n"}
          {"}"});
        </Example.Code>
      </Example>
      <p><code>npx cia migrate chakra ./src/theme.ts</code> writes:</p>
      <Example>
        <Example.Code>
          <span className="tok-com">{"// migrated theme — generated by `cia migrate chakra`"}</span>
          {"\n"}
          <span className="tok-com">{"// Mapping confidence — HIGH: 3 · MEDIUM: 0 · LOW: 0 · UNMAPPED: 0"}</span>
          {"\n"}
          {"\n"}
          <span className="tok-sel">@use</span> <span className="tok-val">&apos;css-is-awesome/scss/mixins&apos;</span> <span className="tok-prop">as</span> <span className="tok-val">m</span>;
          {"\n"}
          {"\n"}
          <span className="tok-sel">@include</span> <span className="tok-val">m.theme(&apos;migrated&apos;)</span> {"{"}
          {"\n"}  <span className="tok-prop">--action-primary-default</span>: <span className="tok-val">#3A5FCD</span>;
          {"\n"}  <span className="tok-prop">--font-display</span>: <span className="tok-val">&quot;Inter&quot;, sans-serif</span>;
          {"\n"}  <span className="tok-prop">--font-sans</span>: <span className="tok-val">&quot;Inter&quot;, sans-serif</span>;
          {"\n"}
          {"\n"}  <span className="tok-sel">@include</span> <span className="tok-val">m.states(action-primary)</span>;
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
          your Chakra config actually defined. The rest of cia&apos;s 127
          required tokens need filling in — see{" "}
          <Link href="/docs/authoring/themes">Authoring a theme</Link> for
          the full contract and the validator loop.
        </li>
        <li>
          <code>@use</code> the file from your app&apos;s SCSS entry, set{" "}
          <code>&lt;html data-theme=&quot;migrated&quot;&gt;</code>, and run
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
          <Link href="/docs/migration-mui">/docs/migration-mui</Link> — the same
          tool, for MUI.
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
