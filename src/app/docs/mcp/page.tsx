import Link from "next/link";
import Example from "@/components/Example";

export default function McpPage() {
  return (
    <>
      <h1>MCP server</h1>
      <p className="lead">
        cia ships a Model Context Protocol stdio server at{" "}
        <code>mcp/server.cjs</code>. Any MCP-aware client — Claude Code, Cursor,
        Aider, Gemini, Copilot — can connect to it and discover cia&rsquo;s entire
        surface without grep-walking the repo. Pure filesystem scan; no database,
        no build step.
      </p>

      <h2 id="setup">Setup</h2>
      <p>
        <strong>Recommended — zero install.</strong> Use the dedicated{" "}
        <code>css-is-awesome-mcp</code> package. It depends on{" "}
        <code>css-is-awesome</code> and always resolves your installed
        version&rsquo;s real source, and the MCP SDK ships as a real
        dependency — no separate install step:
      </p>
      <Example>
        <Example.Code>{`{
  "mcpServers": {
    "css-is-awesome": {
      "command": "npx",
      "args": ["css-is-awesome-mcp"]
    }
  }
}`}</Example.Code>
      </Example>
      <p>
        No install command needed — <code>npx</code> fetches and caches the
        package the first time your MCP client runs it. Prefer a pinned
        version in your own lockfile instead? Install it like any other
        dependency:
      </p>
      <Example>
        <Example.Code>{`npm install css-is-awesome-mcp`}</Example.Code>
      </Example>
      <p>
        <code>npx</code> then runs the locally installed copy instead of
        fetching one.
      </p>
      <p>
        <strong>Alternative — the copy already in your <code>node_modules</code>.</strong>{" "}
        cia&rsquo;s own package ships <code>mcp/server.cjs</code> too, for anyone
        who&rsquo;d rather not add a second package. This copy needs its SDK
        installed manually first, since it&rsquo;s an{" "}
        <strong>optional peer dependency</strong> (so a plain CSS-only install
        never pulls JS in):
      </p>
      <Example>
        <Example.Code>{`npm install -D @modelcontextprotocol/sdk zod`}</Example.Code>
      </Example>
      <Example>
        <Example.Code>{`{
  "mcpServers": {
    "css-is-awesome": {
      "command": "node",
      "args": ["node_modules/css-is-awesome/mcp/server.cjs"]
    }
  }
}`}</Example.Code>
      </Example>

      <h2 id="tools">Tools — 32 total: 28 across 8 families + 4 specialty tools</h2>
      <p>
        Every tool returns structured JSON. <code>list_*</code> tools return
        catalogs; <code>get_*</code> tools return a single record;{" "}
        <code>search_*</code> tools run keyword search across the catalog and
        return ranked matches.
      </p>
      <table>
        <thead>
          <tr>
            <th>Family</th>
            <th>Tools</th>
            <th>What it surfaces</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Themes</td>
            <td>
              <code>list_themes</code>, <code>get_theme</code>,{" "}
              <code>search_themes</code>
            </td>
            <td>
              All 24 shipped themes (eight families &times; auto / light / dark)
              with full token assignments + raw SCSS
            </td>
          </tr>
          <tr>
            <td>Mixins</td>
            <td>
              <code>list_mixins</code>, <code>get_mixin</code>,{" "}
              <code>search_mixins</code>
            </td>
            <td>
              150 public mixins (core, layout, animation, icons, generator +
              per-component) with signature, doc, body, line range
            </td>
          </tr>
          <tr>
            <td>Functions</td>
            <td>
              <code>list_functions</code>, <code>get_function</code>,{" "}
              <code>search_functions</code>
            </td>
            <td>
              24 public <code>@function</code>s (color, space, radius, shadow,
              font-size, z, &hellip;)
            </td>
          </tr>
          <tr>
            <td>Tokens</td>
            <td>
              <code>list_tokens</code>, <code>get_token</code>,{" "}
              <code>search_tokens</code>
            </td>
            <td>
              127 required + 36 optional contract tokens. <code>get_token</code>{" "}
              returns sample values across themes plus the list of
              mixins/functions that reference it
            </td>
          </tr>
          <tr>
            <td>Animations</td>
            <td>
              <code>list_animations</code>, <code>get_animation</code>
            </td>
            <td>
              12-slug vocabulary, 3 speeds, 4 hover effects, the{" "}
              <code>animate</code> / <code>animate-on</code> mixin records
            </td>
          </tr>
          <tr>
            <td>Components</td>
            <td>
              <code>list_components</code>, <code>get_component</code>,{" "}
              <code>search_components</code>
            </td>
            <td>
              10 component files (accordion, buttons, copy-button, data,
              feedback, forms, navigation, overlay, stepper, tabs) with all
              their mixins
            </td>
          </tr>
          <tr>
            <td>Recipes</td>
            <td>
              <code>list_recipes</code>, <code>get_recipe</code>
            </td>
            <td>
              Recipes under <code>scss/recipes/</code> — both markdown pattern
              recipes (dialog, combobox, print-to-pdf, print-spec, letterhead,
              mobile-nav, bottom-nav) and opt-in SCSS recipes (e.g. bare-tags,
              consumed via <code>@use</code>)
            </td>
          </tr>
          <tr>
            <td>Docs</td>
            <td>
              <code>read_llm_txt</code>, <code>read_changelog</code>,{" "}
              <code>read_migration</code>, <code>read_theming</code>,{" "}
              <code>read_agents</code>, <code>read_contract</code>,{" "}
              <code>read_three_tiers</code>, <code>read_readme</code>,{" "}
              <code>read_versioning</code>
            </td>
            <td>Full markdown bodies of every top-level doc</td>
          </tr>
        </tbody>
      </table>

      <h2 id="assemble-prompt">
        <code>assemble_prompt</code>
      </h2>
      <p>
        The headline tool. Pass an <code>intent</code> string and get back a
        ready-to-paste context block tailored for the next AI generation call.
        Bundles the relevant mixins, tokens, and docs into one prompt — no need
        to call N separate <code>get_*</code> tools.
      </p>
      <p>Recognized intents:</p>
      <ul>
        <li>
          <code>mixin:&lt;name&gt;</code> — a mixin signature + body + the tokens
          it references (e.g. <code>mixin:btn</code>)
        </li>
        <li>
          <code>component:&lt;name&gt;</code> — every mixin in a component file
          + their referenced tokens (e.g. <code>component:overlay</code>)
        </li>
        <li>
          <code>theme:&lt;name&gt;</code> — the theme&rsquo;s tokens + SCSS
          source (e.g. <code>theme:terminal</code>)
        </li>
        <li>
          <code>derive-theme:&lt;base&gt;</code> — everything needed to
          hand-build a new theme file from an existing one in one round
          trip: the base theme&rsquo;s full source (the correct starting
          template — copy it, edit only what changes), the{" "}
          <code>theme()</code> mixin&rsquo;s wrapper contract, the
          required/optional token checklist, and the rules for doing it
          safely. This server never writes files — the response is
          everything an agent needs to build the content and write it
          itself (e.g. <code>derive-theme:sketchbook</code> to start a new
          theme from Sketchbook)
        </li>
        <li>
          <code>tokens</code> — the full token contract
        </li>
        <li>
          <code>animations</code> — the animation vocabulary + speed map
        </li>
        <li>
          <code>recipe:&lt;name&gt;</code> — a recipe&rsquo;s full markdown +
          referenced mixin signatures
        </li>
        <li>
          <code>overview</code> — a one-shot summary of cia&rsquo;s entire
          surface (themes, mixin count, key conventions)
        </li>
      </ul>

      <h2 id="resolve-size">
        <code>resolve_size</code>
      </h2>
      <p>
        Snap a design px value to cia&apos;s 4px geometric grid. The other
        AI-facing tool besides <code>assemble_prompt</code>. Returns the
        step number, the SCSS call to emit{" "}
        (<code>cia.grid(n)</code> when exactly on-grid; <code>cia.px(value)</code>{" "}
        when off-grid), the equivalent rem, and a human-readable note.
      </p>
      <p>
        <strong>Contract for AI agents:</strong> call this whenever you
        receive a px value from a design tool (Figma, mockup, screenshot)
        and need to express it in cia code. NEVER write raw rem/px literals
        when a cia function applies. See <a href="/docs/composition">the composition decision tree</a> for the full rules.
      </p>
      <Example>
        <Example.Code>{`// AI receives "24px button height" from a Figma design
resolve_size({ px: 24 })
// →  { step: 6, exact: true, rem: 1.5, scssCall: "cia.grid(6)", ... }
//
// AI emits in generated SCSS:
//   .my-btn { height: cia.grid(6); }

// Off-grid case: AI receives "17px hero margin"
resolve_size({ px: 17 })
// →  { step: 4, exact: false, rem: 1, scssCall: "cia.px(17)",
//      alternative: "cia.grid(4)  // snaps to 16px (1rem)", ... }
//
// AI follows the note: prefer the snapped grid value unless the
// design intent specifically requires the off-grid value.`}</Example.Code>
      </Example>

      <h2 id="validate-theme">
        <code>validate_theme</code>
      </h2>
      <p>
        Validate ANY theme CSS against cia&rsquo;s real token contract and
        WCAG contrast audit — the same check{" "}
        <code>npm run validate-themes</code> runs, exposed as a tool call
        instead of a shell command. Not scoped to cia&rsquo;s own shipped
        themes: pass a fully custom theme you (or another agent) just
        built — for example, the output of the{" "}
        <code>derive-theme:&lt;base&gt;</code> <code>assemble_prompt</code>{" "}
        intent above — and get back a real pass/fail before you write it
        anywhere.
      </p>
      <p>
        Pass compiled CSS (a <code>:root</code> or{" "}
        <code>[data-theme=&quot;...&quot;]</code> block) — this does not
        compile Sass, so give it the output, not <code>.scss</code> source.
      </p>
      <Example>
        <Example.Code>{`validate_theme({ css: theCssYouJustBuilt, label: "boilerplatev2" })
// →  { ok: false, mode: "consolidated",
//      themes: [{ name: "boilerplatev2", ok: false,
//        missing: ["--space-unit", "--space-0"], a11y: [...] }] }
//
// ok: false means required tokens are missing, or an a11y pair failed —
// fix and re-validate before writing the file anywhere.`}</Example.Code>
      </Example>

      <h2 id="theme-from-tokens">
        <code>theme_from_tokens</code>
      </h2>
      <p>
        Turn a design-tokens file into a complete, validated cia theme in one
        call. Accepts <strong>DTCG v2025.10</strong> (<code>$value</code> /{" "}
        <code>$type</code> leaves, <code>{"{aliases}"}</code> resolved),{" "}
        <strong>Tokens Studio for Figma</strong> exports (<code>value</code> /{" "}
        <code>type</code> leaves, single set or multi-set with{" "}
        <code>$metadata.tokenSetOrder</code>), or a flat{" "}
        <code>{"{ \"--token\": value }"}</code> map. The format is auto-detected.
      </p>
      <p>
        There is no minimum content. Every required contract token the file does
        not supply is inherited from a shipped base theme (default{" "}
        <code>boilerplate</code>) and listed in <code>report.inherited</code>, so
        the output is always contract-complete; paths that are not cia tokens are
        emitted verbatim and listed in <code>report.unmapped</code>, never
        dropped. Pass <code>dark</code> (same format), or a single file with
        paired <code>color-light</code> / <code>color-dark</code> groups, and the
        differing colours become <code>light-dark()</code>. The result carries
        the same <code>validation</code> object <code>validate_theme</code>{" "}
        returns, run on the CSS before you write it anywhere. Same function as{" "}
        <code>npx cia theme from-tokens</code>, and reachable in-process as{" "}
        <code>handlers.theme_from_tokens</code>.
      </p>
      <Example>
        <Example.Code>{`theme_from_tokens({
  name: "acme",
  tokens: {                                   // DTCG v2025.10
    color: { brand: { primary: { $value: "#3a5fcd" } },
             text:  { primary: { $value: "#0f172a" } } },
    space: { "4": { $type: "dimension", $value: { value: 16, unit: "px" } } }
  }
})
// →  { css: ':root, :root[data-theme="acme"] { color-scheme: light; --action-primary-active: …',
//      report: { format: "dtcg", base: "boilerplate", darkMode: false,
//                fromTokens: ["--brand-primary", "--space-4", "--text-primary"],
//                inherited: [ …the other 124 required tokens… ], unmapped: [] },
//      validation: { ok: true, mode: "consolidated", themes: [ … ], a11ySummary: { fail: 0, … } } }`}</Example.Code>
      </Example>
      <p>
        Path rules: an explicit table covers Figma-style names that do not spell
        the cia token (<code>typography.font.body</code> →{" "}
        <code>--font-sans</code>); otherwise a leading <code>color.</code> is
        stripped, common group names are rewritten (<code>spacing.</code> →{" "}
        <code>space.</code>, <code>border-radius.</code> → <code>radius.</code>,{" "}
        <code>zIndex.</code> → <code>z.</code>), and the segments are joined with{" "}
        <code>-</code> — so <code>space.4</code> → <code>--space-4</code> and{" "}
        <code>brand.primary</code> → <code>--brand-primary</code>. Full contract in
        the <Link href="/docs/authoring/themes#from-design-tokens">theme authoring guide</Link>.
      </p>

      <h2 id="security">Security + portability</h2>
      <p>
        Discovery is pure filesystem scan. The server reads files inside the
        cia package directory and never writes anything. Safe to run from any
        clone or installed <code>node_modules/css-is-awesome/</code>. No
        network, no telemetry, no eval. The MCP transport is stdio — your
        client connects over a pipe, not a port.
      </p>

      <h2 id="versioning">Versioning</h2>
      <p>
        Two ways to run this server, two versioning stories. The in-repo copy
        (<code>mcp/server.cjs</code>) ships inside the cia package itself, so
        its <code>serverInfo.version</code> is cia&rsquo;s own version — when
        cia&rsquo;s mixin API changes, it reports the new API on the next
        read, no separate semver, no client config to update.
      </p>
      <p>
        The dedicated{" "}
        <code>css-is-awesome-mcp</code> package tracks its own, independent
        release cadence instead (packaging fixes don&rsquo;t need a cia
        release, and vice versa) — its{" "}
        <code>serverInfo.version</code> reports its own version, not
        cia&rsquo;s. It always resolves whatever version of{" "}
        <code>css-is-awesome</code> you actually have installed as a real
        dependency, so the mixin data it serves is never stale even though
        the version number reported is a different one.
      </p>
    </>
  );
}
