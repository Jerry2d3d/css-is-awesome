import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Testing — css-is-awesome",
  description:
    "How cia is tested: twelve checks covering lint, theme-artifact drift, token contracts, published-package resolution, and 100% call coverage of the SCSS API and MCP tools.",
};

export default function TestingPage() {
  return (
    <>
      <h1>Testing</h1>
      <p className="lead">
        A design system fails in ways a unit test rarely sees: a renamed mixin,
        a theme missing a token, an import that works in the repo and breaks on
        install. cia runs twelve checks, and every one of them exists because
        something in that list actually happened.
      </p>

      <h2 id="the-suite">The suite</h2>
      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Check</th>
              <th>What it proves</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>lint</code></td>
              <td>ESLint across the docs site</td>
            </tr>
            <tr>
              <td><code>lint:scss</code></td>
              <td>stylelint across the SCSS library</td>
            </tr>
            <tr>
              <td><code>check:theme-drift</code></td>
              <td>
                Theme artifacts match their SCSS sources.{" "}
                <code>validate-themes</code> reads the <strong>committed CSS</strong>,
                not the SCSS sources, and theme building was in no CI step — so a
                fix could land in <code>scss/themes/*.scss</code>, never be
                rebuilt, and CI would validate the stale output and report
                success. The drift gate rebuilds into a scratch copy and diffs,
                so source and artifacts cannot silently diverge. Runs before
                every check that reads the artifacts.
              </td>
            </tr>
            <tr>
              <td><code>validate-themes</code></td>
              <td>
                Every theme declares all 127 required contract tokens, and every
                one of the 22 audited pairs meets WCAG 2.2 AA contrast. Checks{" "}
                <strong>both</strong> <code>light-dark()</code> branches and
                keeps the worse result — a token that is two colours cannot pass
                by being legible in only one mode. Fails the build by default.
              </td>
            </tr>
            <tr>
              <td><code>validate-icons</code></td>
              <td>The 49-glyph core pack is intact (extras are allowed)</td>
            </tr>
            <tr>
              <td><code>validate-api</code></td>
              <td>
                The <code>css-is-awesome/api</code> barrel still emits zero CSS
                until a mixin is called
              </td>
            </tr>
            <tr>
              <td><code>validate-package</code></td>
              <td>
                Packs the tarball, installs it into a temp project, and compiles
                all ten documented <code>@use</code> specifiers
              </td>
            </tr>
            <tr>
              <td><code>coverage:api</code></td>
              <td>
                Calls <strong>every</strong> public mixin and function — 174 of
                them — and asserts the output is usable
              </td>
            </tr>
            <tr>
              <td><code>coverage:mcp</code></td>
              <td>
                Spawns the MCP server over stdio and calls all 30 tools
              </td>
            </tr>
            <tr>
              <td><code>size-budget</code></td>
              <td>
                Fails when a gzipped bundle outgrows its budget, and names the
                docs that quote the number. Raising a budget is a deliberate
                edit in the same commit as the growth — the figures had drifted
                to be overstated by up to 2&times; while nothing measured them.
              </td>
            </tr>
            <tr>
              <td><code>validate-recipes</code></td>
              <td>
                Compiles every SCSS block in the recipes and asserts every{" "}
                <code>cia.*</code> symbol still exists, so a mixin rename fails
                here rather than in a consumer&rsquo;s editor — a recipe that
                teaches a call which no longer exists is worse than no recipe.
              </td>
            </tr>
            <tr>
              <td><code>test</code></td>
              <td>
                Playwright — 240 tests across three engines: route smoke, axe
                accessibility, per-theme visual snapshots, theme-editor
                behaviour. 74 functional tests run in Chromium, Firefox and
                WebKit; the 18 visual-snapshot tests are Chromium-only by
                design.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>All twelve run in CI on every pull request.</p>

      <h2 id="coverage">Call-and-assert coverage</h2>
      <p>
        SCSS has no conventional line-coverage tooling, so cia measures
        something more useful for a design system: <strong>is every part of the
        public API actually callable?</strong> The harness parses every public{" "}
        <code>@mixin</code> and <code>@function</code> out of the source,
        generates a fixture that calls it, compiles it, and asserts the result —
        it compiles, no <code>null</code> leaks into the CSS, functions return a
        value, mixins emit.
      </p>
      <p>
        <strong>174 of 174 SCSS units and 30 of 30 MCP tools.</strong> CI fails
        below 98%. A mixin with no fixture counts as uncovered and lowers the
        number, so skipping a test is visible rather than invisible.
      </p>

      <h3 id="what-100-means">What 100% does and doesn&rsquo;t mean</h3>
      <p>
        It means every public mixin and function is invoked by a test and
        produces sane output. It catches renames, broken signatures, undefined
        variables and bad refactors — it found a real one on its first run, an
        undefined <code>$icon-size</code> that broke four icon mixins whenever
        they were called without an explicit size.
      </p>
      <p>
        It does <strong>not</strong> mean the CSS is visually correct. That is a
        deliberate trade: golden-file snapshots of ~180 mixins would catch
        silent output drift, but a single token change would churn dozens of
        snapshot files and train everyone to approve diffs without reading them.
        Visual correctness is covered by the per-theme Playwright snapshots
        instead, at page level.
      </p>

      <h2 id="gaps">Known gaps</h2>
      <p>Stated plainly, because a test suite that hides its blind spots is worse than a small one:</p>
      <ul>
        <li>
          <strong>Accessibility runs on routes, not components.</strong> axe
          checks a set of pages; individual component states are not swept.
        </li>
      </ul>
      <p>
        Cross-engine coverage used to head this list. It no longer does: the
        functional, smoke and a11y specs run in Chromium, Firefox and WebKit.
        That mattered because cia leans on <code>light-dark()</code>,{" "}
        <code>:has()</code>, <code>[popover]</code>,{" "}
        <code>&lt;details name&gt;</code> and <code>mask</code> — exactly the
        surface where engines diverge, and exactly why it was worth closing.
      </p>
      <p>
        <code>visual.spec.ts</code> is the deliberate exception. It owns the PNG
        baselines and Firefox and WebKit <code>testIgnore</code> it, because
        Desktop Safari&rsquo;s <code>deviceScaleFactor: 2</code> would make its
        screenshots a structurally different artifact rather than a comparable
        one. That is a decision about what a baseline is, not a gap in coverage.
      </p>

      <h2 id="running">Running it locally</h2>
      <pre><code>{`npm run lint && npm run lint:scss
npm run check:theme-drift # artifacts vs sources
npm run validate-themes
npm run validate-package
npm run coverage          # api + mcp
npm test                  # Playwright (needs \`npm run build\` first)`}</code></pre>
      <p>
        Visual snapshots are keyed by platform, so a local run generates its own
        baselines rather than fighting CI&rsquo;s. See{" "}
        <Link href="/docs/a11y">Accessibility</Link> for the contrast contract
        that <code>validate-themes</code> enforces — 22 foreground/background
        pairs per theme, up from 17 once the five <code>--code-*</code> pairs
        were added. Those five surfaced 33 real failures across nine themes, all
        since fixed.
      </p>
      <p>
        The contrast validator itself had the same shape of bug the gates exist
        to catch: it ignored unquoted{" "}
        <code>[data-theme=dark]</code> selectors and silently audited only{" "}
        <code>:root</code>, so a failing theme reported a pass. Fixed.
      </p>
    </>
  );
}
