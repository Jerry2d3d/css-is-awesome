import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Roadmap — css-is-awesome",
  description:
    "What cia has shipped, what is being worked on now, and what is queued next. Direction, not delivery dates.",
};

export default function RoadmapPage() {
  return (
    <>
      <h1>Roadmap</h1>
      <p className="lead">
        What&rsquo;s shipped, what&rsquo;s being worked on, and what&rsquo;s
        queued. This is a statement of direction, not a delivery schedule.
      </p>

      <h2 id="how-to-read-this">How to read this</h2>
      <p>
        <strong>There are no dates here, deliberately.</strong> cia is built by
        a small team, and a date on a public roadmap becomes a promise that
        distorts the work &mdash; you ship to the date instead of to the
        standard. Items move between sections as things land or get
        reprioritised, and anything in <em>Considering</em> may never ship at
        all. That last part is meant literally.
      </p>
      <p>
        The detailed work items live in{" "}
        <a href="https://github.com/Jerry2d3d/css-is-awesome/tree/main/roadmap/epics">
          <code>roadmap/epics/</code>
        </a>{" "}
        &mdash; user stories, acceptance criteria and the reasoning behind each
        call. If you want to know <em>why</em> something is shaped the way it
        is, that&rsquo;s where it&rsquo;s written down.
      </p>

      <h2 id="shipped">Shipped</h2>
      <p>Available today, gated in CI on every push.</p>
      <ul>
        <li>
          <strong>Published on npm.</strong>{" "}
          <code>npm install css-is-awesome</code> works, and jsDelivr and
          unpkg mirror every release for build-free consumption.{" "}
          <Link href="/docs/install">Install</Link>.
        </li>
        <li>
          <strong>24 themes</strong>, eight families &times; three variants.
          Each builds from exactly one SCSS source, and dropping one in as{" "}
          <code>theme.css</code> restyles a page with no markup change.
        </li>
        <li>
          <strong>Themeable spacing.</strong> Themes own the numbered scale, so
          swapping a theme changes a page&rsquo;s proportions and not just its
          palette.
        </li>
        <li>
          <strong>Accessibility enforced by default.</strong> Every theme is
          audited for WCAG 2.2 AA contrast across 22 token pairs, and a failing
          theme fails the build.{" "}
          <Link href="/docs/a11y">How that works</Link>.
        </li>
        <li>
          <strong>Zero JavaScript in the package.</strong> Installing cia
          downloads CSS and SCSS. Nothing else.
        </li>
        <li>
          <strong>An MCP server</strong> so AI agents can query the real API
          instead of guessing at it.{" "}
          <Link href="/docs/mcp">Tool reference</Link>.
        </li>
        <li>
          <strong>A recipes book</strong> &mdash; five framework-agnostic
          patterns: dialog, combobox, print-to-PDF, mobile-nav and bottom-nav.{" "}
          <Link href="/docs/recipes">Browse them</Link>.
        </li>
        <li>
          <strong>A zero-JS mobile toolkit</strong> &mdash; hamburger, drawer,
          sheet and dock mixins on the native Popover API, plus the playbook
          that ties them together. <Link href="/docs/mobile">Mobile</Link>.
        </li>
        <li>
          <strong>A recipe registry and a health check in the CLI</strong>{" "}
          &mdash; <code>npx cia add &lt;recipe&gt;</code> copies a pattern from
          the book into your project so you own it, and{" "}
          <code>npx cia analyze</code> audits your stylesheets against the
          installed API (dead symbols, the spacing-scale trap, hard-coded
          colors, BEM creep) with CI-ready exit codes.
        </li>
        <li>
          <strong>A dated browser-support matrix</strong> &mdash; the Baseline
          floor the native primitives set, and every progressive enhancement
          with its exact fallback.{" "}
          <Link href="/docs/browser-support">Browser support</Link>.
        </li>
        <li>
          <strong>A theme editor</strong> on this site, with a download that
          drops straight into a project.
        </li>
        <li>
          <strong>Migration tooling</strong> &mdash;{" "}
          <code>npx cia migrate tailwind</code> converts an existing config
          into a cia theme.
        </li>
      </ul>

      <h2 id="now">Working on now</h2>
      <ul>
        <li>
          <strong>Shipping the MCP server as its own installable package</strong>{" "}
          so it takes one line of config and no install step. Today it needs
          dependencies added by hand, which nobody should have to discover.
        </li>
      </ul>

      <h2 id="next">Next up</h2>
      <ul>
        <li>
          <strong>The Figma pipeline</strong> &mdash; Figma → DEV → Output on
          one token vocabulary: export the theme contract as Figma variables
          (each cia theme a variable <em>mode</em>), import a designer&apos;s
          variables back through the validator, a published cia Figma Library
          whose component names mirror the mixins, and a machine-readable
          mapping served over MCP so AI agents translate Figma frames into
          cia calls directly.
        </li>
        <li>
          <strong>More recipes</strong> &mdash; datepicker, data table,
          command palette, multiselect combobox, breadcrumb, pagination, file
          upload, toast, sortable list, colour picker.
        </li>
        <li>
          <strong>A guided installer.</strong> <code>npm create cia</code>{" "}
          &mdash; asks which framework and theme, then wires the SCSS entry
          point for you.
        </li>
        <li>
          <strong>The density knob.</strong> One variable that rescales the
          entire spacing system, so a theme can feel compact or airy from a
          single line.
        </li>
        <li>
          <strong>Stricter accessibility recipes</strong> as an optional add-on
          &mdash; WCAG-strict variants with live-region announcements and full
          focus management.
        </li>
        <li>
          <strong>Proving the codegen pipeline</strong> &mdash; generating React
          components from recipes, to see whether the approach holds up before
          committing to it.
        </li>
      </ul>

      <h2 id="later">Further out</h2>
      <ul>
        <li>
          <strong>RTL audit</strong> &mdash; sweep the source for physical
          properties that should be logical, with tests in a real RTL locale.
        </li>
        <li>
          <strong>Form validation and i18n recipes</strong> &mdash; native
          validation, popular form libraries, date and currency formatting,
          pluralisation.
        </li>
        <li>
          <strong>More migration paths</strong> &mdash; reading MUI and Chakra
          theme objects, and a DTCG bridge for design-token pipelines.
        </li>
        <li>
          <strong>A Figma plugin</strong> for two-way sync between Figma
          variables and cia tokens.
        </li>
        <li>
          <strong>A community theme gallery</strong>, with submissions by pull
          request.
        </li>
        <li>
          <strong>Editor tooling</strong> &mdash; autocomplete and hover docs
          for the mixin API.
        </li>
      </ul>

      <h2 id="considering">Considering &mdash; may not ship</h2>
      <p>
        Ideas we like that haven&rsquo;t earned their place yet. Listed so the
        thinking is visible, not because they&rsquo;re committed.
      </p>
      <ul>
        <li>
          <strong>A visual recipe builder</strong> &mdash; compose a component
          in the browser and export the SCSS. Genuinely useful if it works, and
          a large amount of surface area to maintain if it half-works.
        </li>
        <li>
          <strong>Angular component generation</strong>, if the React codegen
          experiment proves out.
        </li>
      </ul>

      <h2 id="influence">Want to change what&rsquo;s on this list?</h2>
      <p>
        Real usage moves things up faster than anything else. If something here
        is blocking you, or something missing would have saved you an
        afternoon, say so &mdash; that&rsquo;s the signal this list is
        prioritised against.
      </p>
      <p>
        The principles that decide what gets built are in{" "}
        <Link href="/docs/three-tiers">Three tiers</Link> and{" "}
        <Link href="/docs/a11y">Accessibility</Link>. The short version:
        mixins over classes, the consumer names their own selectors, and
        accessibility is a build gate rather than a guideline.
      </p>
    </>
  );
}
