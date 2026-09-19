import type { Metadata } from "next";
import Link from "next/link";
import Example from "@/components/Example";

export const metadata: Metadata = {
  title: "Install wizard — css-is-awesome",
  description:
    "npm create cia — a guided installer that detects your framework, picks a theme, wires the two-import SCSS model and connects the MCP server in one command.",
};

// Captured from a real `--dry-run --yes` run against a Next.js fixture. Kept as
// plain text on purpose: the wizard's output IS the documentation of what it
// touches, and a screenshot would go stale the first time a line changes.
const DRY_RUN = `┌  create-cia  (dry run — nothing will be changed)
│
●  Detected: Next.js
│
◇  Plan
│  would run    npm install css-is-awesome   — the design system
│  would run    npm install -D sass css-is-awesome-mcp   — SCSS compiler + tooling (dev only)
│  would write  app/styles/cia.scss   — root stylesheet — the \`@use 'css-is-awesome'\` half of the two-import model
│  would edit   app/layout.tsx   — import the theme + root stylesheet, set data-theme="boilerplate" on <html>
│  would merge  .mcp.json   — connect AI agents (Claude Code, Cursor, …) to cia's real API via css-is-awesome-mcp
│
◇  Summary (dry run)
│  Framework        Next.js
│  Package manager  npm
│  Theme            boilerplate
│  Packages         css-is-awesome, sass, css-is-awesome-mcp
│  SCSS entry       app/styles/cia.scss
│  Layout           app/layout.tsx
│  MCP              .mcp.json → npx css-is-awesome-mcp
│
└  Dry run complete — nothing was changed.`;

export default function InstallWizardPage() {
  return (
    <>
      <h1>Install wizard</h1>
      <p className="lead">
        <code>npm create cia@latest</code> asks two questions, then wires cia into the project you are
        already in: the right SCSS entry for your framework, a theme, and (optionally) the MCP server so
        your AI agent reads cia&rsquo;s real API instead of guessing. It never scaffolds a new app and
        never overwrites a file you already have.
      </p>

      <h2 id="run-it">Run it</h2>
      <p>
        From the root of an existing project (anything with a <code>package.json</code>). Use{" "}
        <code>--dry-run</code> first if you want to see the plan without touching disk.
      </p>
      <Example>
        <Example.Code>
          <span className="tok-com">{"# guided"}</span>
          {"\n"}
          <span className="tok-sel">npm</span> <span className="tok-val">create cia@latest</span>
          {"\n"}
          {"\n"}
          <span className="tok-com">{"# no prompts — sensible defaults, prints a summary"}</span>
          {"\n"}
          <span className="tok-sel">npm</span> <span className="tok-val">create cia@latest -- --yes</span>
          {"\n"}
          {"\n"}
          <span className="tok-com">{"# show the plan, change nothing"}</span>
          {"\n"}
          <span className="tok-sel">npm</span> <span className="tok-val">create cia@latest -- --dry-run</span>
        </Example.Code>
      </Example>
      <p>
        <code>npx create-cia</code>, <code>pnpm create cia</code>, <code>yarn create cia</code> and{" "}
        <code>bun create cia</code> all work; the wizard detects your package manager from the lockfile
        and uses the same one for the install.
      </p>

      <h2 id="what-it-asks">What it asks</h2>
      <ol>
        <li>
          <strong>Framework</strong> — detected from your dependencies (Next.js, Vite with React, Vue or
          Svelte, Astro, Nuxt, SvelteKit, Remix / React Router, Angular). You confirm the detection; you
          only see the full list when nothing is detected.
        </li>
        <li>
          <strong>Theme</strong> — one of the eight shipped families, default <code>boilerplate</code>.
          Swap it any time afterwards; it is one import line.
        </li>
        <li>
          <strong>MCP server?</strong> — default yes. Adds <code>css-is-awesome-mcp</code> as a dev
          dependency and merges a <code>css-is-awesome</code> entry into <code>.mcp.json</code> without
          touching servers you already have. See <Link href="/docs/mcp">the MCP reference</Link>.
        </li>
      </ol>
      <p>
        There is no accessibility question. Every recipe in the book is graded against WCAG 2.2 AA and
        the theme validator fails a theme that does not pass contrast, so there is no &ldquo;strict
        mode&rdquo; to opt into.
      </p>

      <h2 id="what-it-writes">What it writes</h2>
      <ul>
        <li>
          Installs <code>css-is-awesome</code>, plus <code>sass</code> as a dev dependency when your
          project does not have it yet (the generated SCSS entry needs a compiler; Angular already
          ships one and is skipped).
        </li>
        <li>
          Creates the root stylesheet — <code>app/styles/cia.scss</code> in Next.js,{" "}
          <code>src/styles/cia.scss</code> elsewhere — containing the emitting half of the{" "}
          <Link href="/docs/install#two-imports">two-import model</Link>:{" "}
          <code>@use &apos;css-is-awesome&apos;;</code>. Your components keep using the zero-emit{" "}
          <code>@use &apos;css-is-awesome/api&apos; as cia;</code>.
        </li>
        <li>
          Imports the theme and the root stylesheet from your root layout (<code>app/layout.tsx</code>,{" "}
          <code>src/main.tsx</code> or equivalent) and sets <code>data-theme</code> on{" "}
          <code>&lt;html&gt;</code>. The theme comes in through the package&rsquo;s{" "}
          <code>css-is-awesome/themes/&lt;name&gt;</code> export rather than a{" "}
          <code>&lt;link&gt;</code> into <code>node_modules</code>, because the link form does not
          survive a production build under Next.js or Vite. For frameworks it cannot wire confidently it
          prints the exact lines to paste instead.
        </li>
        <li>Merges the MCP server into <code>.mcp.json</code> if you said yes.</li>
      </ul>
      <p>
        Every write is idempotent: running the wizard twice changes nothing the second time, and an
        existing <code>cia.scss</code> or theme import is left exactly as it is.
      </p>

      <h2 id="dry-run">A dry run, verbatim</h2>
      <p>This is the wizard&rsquo;s own output against a Next.js project, with nothing changed on disk.</p>
      <Example>
        <Example.Code>{DRY_RUN}</Example.Code>
      </Example>

      <h2 id="flags">Flags</h2>
      <table>
        <thead>
          <tr>
            <th>Flag</th>
            <th>Effect</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>[dir]</code></td>
            <td>Project directory (default: the current one).</td>
          </tr>
          <tr>
            <td><code>--yes</code></td>
            <td>Skip every prompt and apply the defaults. Also implied when there is no TTY or <code>CI</code> is set.</td>
          </tr>
          <tr>
            <td><code>--dry-run</code></td>
            <td>Print the plan and summary; install nothing, write nothing.</td>
          </tr>
          <tr>
            <td><code>--theme &lt;name&gt;</code></td>
            <td>Pre-pick a theme family, or a <code>-light</code> / <code>-dark</code> variant.</td>
          </tr>
          <tr>
            <td><code>--framework &lt;name&gt;</code></td>
            <td>Override detection.</td>
          </tr>
          <tr>
            <td><code>--pm npm|pnpm|yarn|bun</code></td>
            <td>Override the package manager detected from the lockfile.</td>
          </tr>
          <tr>
            <td><code>--no-mcp</code></td>
            <td>Skip the MCP server entirely.</td>
          </tr>
        </tbody>
      </table>

      <h2 id="manual">Prefer to do it by hand?</h2>
      <p>
        Everything the wizard does is two imports and one attribute; the{" "}
        <Link href="/docs/install">install page</Link> walks through it. The wizard exists so the first
        five minutes do not depend on reading that page carefully.
      </p>
    </>
  );
}
