import type { Metadata } from "next";
import Link from "next/link";
import Example from "@/components/Example";

export const metadata: Metadata = {
  title: "Analyzer — css-is-awesome",
  description:
    "cia analyze: a graded, categorized design-system health check for a consumer project's stylesheets.",
};

type Rule = {
  id: string;
  level: "error" | "warn" | "info";
  category: string;
  summary: string;
};

const RULES: Rule[] = [
  { id: "unknown-symbol", level: "error", category: "API", summary: "A cia.* call that doesn't resolve — a typo or a symbol removed since your version." },
  { id: "space-scale", level: "error", category: "Spacing", summary: "space(n) outside 1–9 — the numbered scale, so it emits a unitless number and the browser drops the declaration." },
  { id: "off-contract-token", level: "warn", category: "Contract", summary: "A var(--token) that's a near-miss of a real contract token — likely a typo. Your own custom tokens are left alone." },
  { id: "off-scale-length", level: "warn", category: "Spacing", summary: "A literal border-radius/padding/margin/gap value close to a scale step — probably meant to be that token." },
  { id: "hard-coded-color", level: "warn", category: "Color", summary: "A literal hex color outside a var() fallback or an @media print block — should come from a token." },
  { id: "bem", level: "warn", category: "Naming", summary: "A __ or -- class-name chain — BEM is forbidden in cia projects; use a semantic single-class name." },
  { id: "hand-written-areas", level: "info", category: "Layout", summary: "A hand-written grid-template-areas — the layout mixins (page-layout / layout / area) own the maps." },
  { id: "missing-focus-visible", level: "info", category: "Accessibility", summary: "Interactive :hover/:active styling with no :focus-visible or focus-ring anywhere in the file." },
];

const LEVEL_LABEL: Record<Rule["level"], string> = {
  error: "✗ error",
  warn: "⚠ warn",
  info: "ℹ info",
};

export default function DocsAnalyzerPage() {
  return (
    <>
      <h1>Analyzer</h1>
      <p className="lead">
        <code>npx cia analyze</code> audits a project&rsquo;s stylesheets against
        the <strong>real</strong>, installed css-is-awesome API — not a
        snapshot or a guess — and prints a graded, categorized report with a
        suggested fix on every finding. Zero dependencies, filesystem only,
        same philosophy as the <Link href="/docs/mcp">MCP server</Link>.
      </p>

      <h2 id="run">Run it</h2>
      <Example>
        <Example.Code>{`npx cia analyze              # current directory, graded report
npx cia analyze src/styles   # a specific path
npx cia analyze --json       # machine-readable, for CI tooling
npx cia analyze --strict     # also exit 1 on warnings (default: errors only)
npx cia analyze --verbose    # flat per-file listing instead of the graded view`}</Example.Code>
      </Example>

      <h2 id="score">The health score</h2>
      <p>
        <code>health = 100 − errors×10 − warnings×2 − info×1</code>, floored
        at 0. It&rsquo;s a within-version trend, not a cross-version constant —
        adding a rule can move a clean-ish project&rsquo;s number on upgrade,
        which is why new rules land mostly at <code>warn</code>/<code>info</code>{" "}
        weight rather than <code>error</code>.
      </p>

      <h2 id="rules">Rules</h2>
      <table>
        <thead>
          <tr>
            <th>Rule</th>
            <th>Level</th>
            <th>Category</th>
            <th>What it catches</th>
          </tr>
        </thead>
        <tbody>
          {RULES.map((r) => (
            <tr key={r.id}>
              <td>
                <code>{r.id}</code>
              </td>
              <td>{LEVEL_LABEL[r.level]}</td>
              <td>{r.category}</td>
              <td>{r.summary}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        <code>error</code> fails the build; <code>warn</code> fails only under{" "}
        <code>--strict</code>; <code>info</code> never fails it — it&rsquo;s a
        hint, not a gate.
      </p>

      <h2 id="off-scale-length">A note on off-scale-length</h2>
      <p>
        This rule suggests the <strong>nearest named step</strong> (e.g.{" "}
        <code>--radius-md</code>), not an exact value — themes are free to set
        their own numbers for every step (Terminal sets every{" "}
        <code>--radius-*</code> to <code>0</code>, deliberately), so the
        suggestion is a hint toward using a token at all, not a claim about
        what your active theme&rsquo;s pixel value actually is. A literal{" "}
        <code>0</code> is never flagged — it&rsquo;s unambiguous.
      </p>

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
            <td>
              <code>--json</code>
            </td>
            <td>
              Machine-readable report: <code>counts</code>, <code>health</code>,
              and <code>results</code> with <code>category</code> and{" "}
              <code>suggestion</code> on every finding (additive fields).
            </td>
          </tr>
          <tr>
            <td>
              <code>--verbose</code>
            </td>
            <td>The flat per-file listing instead of the graded, categorized report.</td>
          </tr>
          <tr>
            <td>
              <code>--strict</code>
            </td>
            <td>
              Exit 1 on warnings too (default: only <code>error</code>-level
              findings fail the build).
            </td>
          </tr>
          <tr>
            <td>
              <code>--namespace &lt;ns&gt;</code>
            </td>
            <td>
              Extra namespace(s) to treat as cia, comma-separated — for when{" "}
              <code>@use &apos;css-is-awesome&apos;</code> is aliased through
              an intermediate file the auto-detector can&rsquo;t see through.
            </td>
          </tr>
        </tbody>
      </table>

      <h2 id="see">See it work</h2>
      <p>
        <code>npx cia add &lt;recipe&gt;</code> copies a pattern from the{" "}
        <Link href="/docs/recipes">recipes book</Link> into a project so you
        own it; <code>npx cia analyze</code> is the health check that keeps
        the result honest as the project grows. Run <code>npx cia --help</code>{" "}
        for every verb, or read the <Link href="/docs/mcp">MCP server</Link>{" "}
        page for the AI-agent side of the same API.
      </p>
    </>
  );
}
