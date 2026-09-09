import Link from "next/link";
import Example from "@/components/Example";

export default function DocsPrintPage() {
  return (
    <>
      <h1>Print</h1>
      <p className="lead">
        Print is a themeable surface in css-is-awesome, not an afterthought.
        One line sets up a clean, legible <strong>Print → Save as PDF</strong>{" "}
        for any theme — dark themes included — and four tokens let a theme, or a
        single project, give paper its own identity. Zero JavaScript: the page{" "}
        <em>is</em> the PDF source and the browser is the generator.
      </p>

      <h2 id="palette">The print palette</h2>
      <p>
        <code>cia.print-base</code> defines four custom properties that describe
        the printed page. Their default is clean ink-on-white with light grays,
        which every theme inherits with no work:
      </p>
      <Example>
        <Example.Code>{`--print-ink     /* body text, links, code text   — default #000 */
--print-paper   /* backgrounds                   — default #fff */
--print-line    /* borders, rules, hairlines     — default #999 */
--print-muted   /* printed URLs, captions        — default #666 */`}</Example.Code>
      </Example>

      <h2 id="how">How print colour works</h2>
      <p>
        Inside <code>@media print</code>, <code>print-base</code> forces{" "}
        <code>color-scheme: light</code> (so paired <code>light-dark()</code>{" "}
        themes print their light branch) and then <strong>rebinds the theme&rsquo;s
        own colour tokens onto the palette</strong> — <code>--ink</code>,{" "}
        <code>--surface-*</code>, <code>--border-*</code> and{" "}
        <code>--code-*</code> all resolve to the <code>--print-*</code> values.
        The effect: every element that reads a theme token prints as ink on
        paper, so a dark-only theme like Terminal is legible with no flag, and
        overriding a single <code>--print-*</code> token re-inks the whole page.
      </p>
      <p>
        This replaces the old <code>$legible</code> flag, which is now a{" "}
        <strong>deprecated no-op</strong> — the rebind supersedes it, and passing
        it emits a build warning. The other flags remain:{" "}
        <code>$link-urls</code> and <code>$link-origin</code> print each link&rsquo;s
        full destination via <code>attr(href)</code>, and{" "}
        <code>$page-numbers</code> puts sheet numbers in the <code>@page</code>{" "}
        footer.
      </p>

      <h2 id="setup">Setup</h2>
      <p>
        Include <code>print-base</code> <strong>once at the root</strong> of a
        global stylesheet — it emits its own <code>:root</code> block plus{" "}
        <code>@page</code>, so it can&rsquo;t live inside a component module or a
        selector. Then hide chrome and reveal paper-only content with{" "}
        <code>print-hidden</code> / <code>print-only</code>.
      </p>
      <Example>
        <Example.Code>{`@use 'css-is-awesome/api' as cia;

// Once, in a GLOBAL stylesheet. Optional flags:
//   ($size, $margin, $freeze-animations, $link-urls, $link-origin, $page-numbers)
@include cia.print-base($link-urls: true, $page-numbers: true);

.site-nav   { @include cia.print-hidden; } // drop chrome on paper
.print-note { @include cia.print-only; }   // reveal paper-only content`}</Example.Code>
      </Example>
      <p>
        Full mixin reference in{" "}
        <Link href="/docs/mixins#print">Mixins → Print / PDF</Link>.
      </p>

      <h2 id="theme">A theme&rsquo;s own paper look</h2>
      <p>
        The default is clean ink-on-white, and most themes want exactly that on
        paper — nobody wants a neon dashboard&rsquo;s glow on a printout. A theme
        that <em>does</em> want a paper identity overrides the palette in its own{" "}
        <code>@media print</code> block — one file, per the theme architecture.
        The shipped <strong>Press</strong> theme does this: newsprint stock,
        warm ink, press-red masthead rules.
      </p>
      <Example>
        <Example.Code>{`// inside a theme's own file — Press's newsprint print identity
@media print {
  --print-paper: #FBFAF6;  // faint warm stock
  --print-ink:   #0A0A0A;  // warm near-black
  --print-line:  #D93025;  // press red rules
  --print-muted: #6B6963;
}`}</Example.Code>
      </Example>
      <p>
        A <strong>shareable</strong> paper style that isn&rsquo;t tied to one theme —
        a corporate letterhead palette — ships instead as a print-only overlay
        you drop onto any theme, the same mechanism paired light/dark themes use:
      </p>
      <Example>
        <Example.Code>{`<link rel="stylesheet" href="/themes/letterhead/print.css" media="print">`}</Example.Code>
      </Example>

      <h2 id="letterhead">The letterhead</h2>
      <p>
        A letterhead — a branded header on the paper that isn&rsquo;t on screen — is
        markup you add, not a theme. It&rsquo;s a print-only block styled with{" "}
        <code>cia.print-only</code> and the <code>--print-*</code> palette, so it
        appears on paper only and matches whatever the print colours are. The
        full pattern, with framework examples, is the{" "}
        <Link href="/docs/recipes/letterhead">letterhead recipe</Link>.
      </p>

      <h2 id="editor">Preview &amp; edit in the theme editor</h2>
      <p>
        Because <code>--print-*</code> tokens only act in <code>@media print</code>,
        editing them live shows nothing on screen — so the{" "}
        <Link href="/themes">theme editor</Link> has a <strong>🖨 Print</strong>{" "}
        button that opens a paper preview. It simulates the printed page on
        screen (the same token rebind, applied live), lets you edit the four
        palette colours and toggle a letterhead, and copies the ready-to-paste{" "}
        <code>@media print</code> block for your theme. It opens seeded from
        that theme&rsquo;s own <code>@media print</code> override when it has
        one (Press opens straight into newsprint), and remembers your edits
        per theme family the next time you open it.
      </p>

      <h2 id="see">See it work</h2>
      <p>
        The <Link href="/examples/print-to-pdf">print-to-pdf example</Link> is a
        real invoice you <code>Ctrl+P</code>: the site chrome drops, an ACME
        letterhead appears, the invoice fills the sheet, links print as full
        URLs, a sheet number appears, and a build-time print-only QR code links
        the paper back to the live page. Walkthroughs: the{" "}
        <Link href="/docs/recipes/print-to-pdf">print-to-pdf</Link> and{" "}
        <Link href="/docs/recipes/print-spec">print-spec</Link> recipes.
      </p>
    </>
  );
}
