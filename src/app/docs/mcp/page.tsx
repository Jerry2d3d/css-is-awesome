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
        Add cia to your client&rsquo;s <code>.mcp.json</code>:
      </p>
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
      <p>
        Or run it directly via the wired-in <code>bin</code>:
      </p>
      <Example>
        <Example.Code>{`npx css-is-awesome-mcp`}</Example.Code>
      </Example>
      <p>
        The MCP SDK is an <strong>optional peer dependency</strong> — install it
        in the client&rsquo;s project if you want to actually run the server:
      </p>
      <Example>
        <Example.Code>{`npm install -D @modelcontextprotocol/sdk zod`}</Example.Code>
      </Example>

      <h2 id="tools">Tools — 27 across 8 families</h2>
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
            <td>All 9 shipped themes with full token assignments + raw SCSS</td>
          </tr>
          <tr>
            <td>Mixins</td>
            <td>
              <code>list_mixins</code>, <code>get_mixin</code>,{" "}
              <code>search_mixins</code>
            </td>
            <td>
              138 public mixins (core + layout + animation + per-component) with
              signature, doc, body, line range
            </td>
          </tr>
          <tr>
            <td>Functions</td>
            <td>
              <code>list_functions</code>, <code>get_function</code>,{" "}
              <code>search_functions</code>
            </td>
            <td>
              21 public <code>@function</code>s (color, space, radius, shadow,
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
              123 required + 30 optional contract tokens. <code>get_token</code>{" "}
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
              <code>list_components</code>, <code>get_component</code>
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
            <td>Recipe book markdown files under <code>scss/recipes/</code></td>
          </tr>
          <tr>
            <td>Docs</td>
            <td>
              <code>read_llm_txt</code>, <code>read_changelog</code>,{" "}
              <code>read_migration</code>, <code>read_theming</code>,{" "}
              <code>read_agents</code>, <code>read_contract</code>,{" "}
              <code>read_three_tiers</code>, <code>read_readme</code>
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
        The MCP server ships in the cia package itself; its version is cia&rsquo;s
        version. When cia&rsquo;s mixin API changes, the server reports the new
        API on the next read. No separate semver, no client config to update.
      </p>
    </>
  );
}
