import Link from "next/link";
import Example from "@/components/Example";

export default function FaqPage() {
  return (
    <>
      <h1>Frequently asked questions</h1>
      <p className="lead">
        Short answers to the questions people actually ask — philosophy,
        theming, integration, versioning, and how to get involved.
      </p>

      <h2 id="why-not-tailwind">Why not just use Tailwind?</h2>
      <p>
        Tailwind and css-is-awesome optimise for different things. Tailwind
        ships atomic utilities you compose in markup; the tokens live in a
        config you recompile. cia ships <strong>tokens + mixins</strong>:
        the design language is a small set of CSS custom properties, and
        the primary API is SCSS mixins you compose in stylesheets. That
        means you get runtime re-skinning via one{" "}
        <code>data-theme</code> attribute and semantic class names instead
        of a utility stack.
      </p>
      <p>
        The tradeoff: Tailwind&apos;s atomic classes don&apos;t re-skin at
        runtime, and the markup carries every design decision. cia&apos;s
        mixins keep markup semantic but require SCSS at author time.
        Neither is a knock on the other — pick based on whether your
        project wants its design system in HTML or in CSS. See{" "}
        <Link href="/docs/migration-tailwind">/docs/migration-tailwind</Link>{" "}
        for a deeper comparison.
      </p>

      <h2 id="why-not-bootstrap">Why not just use Bootstrap?</h2>
      <p>
        Bootstrap is <strong>component-first</strong>: you get{" "}
        <code>.btn</code>, <code>.card</code>, <code>.alert</code>, and a
        Sass variable layer beneath them. css-is-awesome is{" "}
        <strong>token-first</strong>: components are assembled from the
        same token vocabulary, and theming is a single attribute swap
        instead of a Sass recompile.
      </p>
      <p>
        If you already live in Bootstrap and just want a reskin, a Sass
        override works fine. If you want the design language to be the
        primitive and components to fall out of it, cia is the smaller,
        flatter system. See{" "}
        <Link href="/docs/migration-bootstrap">
          /docs/migration-bootstrap
        </Link>{" "}
        for side-by-side equivalents.
      </p>

      <h2 id="why-scss">Why SCSS over Tailwind / plain CSS / CSS Modules?</h2>
      <p>
        SCSS gives us <strong>mixins</strong>, which are the primary API.
        Plain CSS custom properties alone aren&apos;t composable — you
        can&apos;t <code>@include button(primary)</code> in vanilla CSS.
        Tailwind is atomic — the composition unit is a class in markup,
        not a mixin in a stylesheet. CSS Modules scope styles per file
        but give you no vocabulary to compose across files.
      </p>
      <p>
        SCSS plus tokens plus mixins is the durable combination: tokens
        are the runtime contract, mixins are the authoring contract. The
        React layer uses <strong>CSS Modules on top</strong> for
        component-scoped styles, so you get file-local scoping and a
        system-wide vocabulary at the same time.
      </p>

      <h2 id="mixin-first-meaning">What does &quot;mixin-first&quot; mean exactly?</h2>
      <p>
        It means the recommended way to style a thing is{" "}
        <code>@include m.button(primary)</code>, not{" "}
        <code>class=&quot;btn btn-primary&quot;</code> in markup. You
        compose styles semantically in SCSS instead of stacking utility
        classes in HTML.
      </p>
      <Example>
        <Example.Code><span className="tok-com">{"/* mixin-first (recommended) — author your own class, variant is a mixin arg */"}</span>
{"\n"}<span className="tok-sel">.save-btn</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">b.btn(primary)</span>;
{"\n"}{"}"}
{"\n"}
{"\n"}<span className="tok-com">{"<!-- utilities exist as escape hatches, not the default -->"}</span>
{"\n"}<span className="tok-sel">{"<button"}</span> <span className="tok-prop">class</span>=<span className="tok-val">"cia-btn-primary"</span><span className="tok-sel">{">"}</span>Save<span className="tok-sel">{"</button>"}</span></Example.Code>
      </Example>
      <p>
        The <code>.cia-*</code> utility classes exist as escape hatches
        for prototypes, one-offs, and projects that can&apos;t consume
        SCSS. They&apos;re not the recommended default.
      </p>

      <h2 id="how-theming-works">How does the one-file theme swap actually work?</h2>
      <p>
        Every theme is a single CSS file that declares the same 127 required
        custom properties with theme-specific values, under{" "}
        <code>:root, :root[data-theme=&quot;name&quot;]</code>. Because of the
        bare <code>:root</code>, dropping one file in as your{" "}
        <code>theme.css</code> reskins the page with{" "}
        <strong>no markup change at all</strong> — the{" "}
        <code>data-theme</code> attribute is optional in that case.
      </p>
      <p>
        The attribute matters for the <strong>bundle</strong>: the shipped{" "}
        <code>public/theme.css</code> carries all 24 themes in one file, with
        the bare <code>:root</code> stripped, so <code>data-theme</code> on{" "}
        <code>&lt;html&gt;</code> is the only thing choosing between them. Flip
        it and the whole application reskins.
      </p>
      <p>
        Persistence is a cookie read server-side before first paint, so
        the correct theme is baked into the initial HTML — no flash of
        unthemed content, no rebuild, no bundler step.
      </p>

      <h2 id="adding-new-theme">Can I make my own theme?</h2>
      <p>
        Yes. Every theme declares the same 127 required tokens (plus up to 36
        optional ones) documented in the{" "}
        <Link href="/docs/authoring/themes">/docs/authoring/themes</Link>{" "}
        contract. Fork the contract, set values for every required slot,
        run the validator (<code>node scripts/theme-validator.js</code>),
        and drop the file in. If you skip a token the validator tells
        you which one.
      </p>
      <p>
        Spacing is part of that: themes own the numbered scale{" "}
        <code>--space-0</code>&hellip;<code>--space-9</code>, so a theme can
        re-proportion the page and not just recolour it.
      </p>

      <h2 id="how-many-themes-ship">How many themes ship?</h2>
      <p>
        24 theme files, in eight families:{" "}
        <strong>Sketchbook</strong> (default warm paper),{" "}
        <strong>Boilerplate</strong> (neutral starter),{" "}
        <strong>Press</strong> (editorial newsprint),{" "}
        <strong>Prism</strong> (modern-app zinc),{" "}
        <strong>Graphite</strong> (dark aluminium),{" "}
        <strong>Glass</strong> (visionOS-style frosted),{" "}
        <strong>Cupertino</strong> (macOS / Apple HIG), and{" "}
        <strong>Terminal</strong> (CRT phosphor).
      </p>
      <p>
        Each family ships three files: the base name auto-switches light and
        dark via <code>light-dark()</code>, while the <code>-light</code> and{" "}
        <code>-dark</code> variants pin a single mode. Preview the families in
        the <Link href="/themes">Themes gallery</Link>.
      </p>

      <h2 id="custom-brand-colors">How do I use my brand colors?</h2>
      <p>
        Override the relevant tokens in your own theme file.{" "}
        <code>--ai</code> drives primary actions (links, primary
        buttons, focus rings); <code>--shu</code> drives emphasis and
        danger; <code>--ochre</code> drives marginalia and accents.
        Replace those three and most of the visible brand moves with
        you.
      </p>
      <p>
        If you want more than a colour swap, fork a shipped theme whose
        feel is closest to yours and change the palette. See{" "}
        <Link href="/docs/tokens">/docs/tokens</Link> for the full
        vocabulary.
      </p>

      <h2 id="ssr-support">Does it work with SSR / Next.js / Remix?</h2>
      <p>
        Yes. The default pattern is a static export. The{" "}
        <code>data-theme</code> attribute is set server-side (or via an
        inline script that reads a cookie before first paint), which
        means the initial HTML already carries the right theme and there
        is no hydration mismatch.
      </p>
      <p>
        For Next.js App Router specifically, see{" "}
        <Link href="/docs/install#react-next">
          /docs/install#react-next
        </Link>
        .
      </p>

      <h2 id="bundle-size">What does it cost my bundle?</h2>
      <p>
        For the CSS-only consumer: one <code>theme.css</code> plus one
        base stylesheet. No runtime JavaScript. The consolidated{" "}
        <code>theme.css</code> that ships all 24 built-in themes is about
        162 KB uncompressed / 18 KB gzipped — that is the price of carrying
        every theme at once.
      </p>
      <p>
        Almost nobody needs that. If you only need one theme, use the per-theme
        file at <code>public/themes/&lt;name&gt;/theme.css</code> — roughly
        6.5 KB uncompressed, 2.4 KB gzipped — and because it emits a bare{" "}
        <code>:root</code> it needs no <code>data-theme</code> attribute to take
        effect.
      </p>

      <h2 id="javascript-required">Is JavaScript required?</h2>
      <p>
        Not for styling. Plain HTML plus the two stylesheets renders a
        fully themed page with working buttons, cards, forms, tables,
        and the whole utility layer.
      </p>
      <p>
        JavaScript is only required for the React components that
        manage focus or state — Dropdown, Modal, Tabs, and friends. A
        zero-JS page works great; you just skip the React library.
      </p>

      <h2 id="typescript-support">Does it have TypeScript types?</h2>
      <p>
        Yes. Every React component in the companion library ships with
        its prop types. Token names as a TypeScript union are on the
        roadmap — see <Link href="/docs">the intro</Link> for status.
      </p>

      <h2 id="upgrade-policy">How do you handle breaking changes?</h2>
      <p>
        As of 1.0 we follow SemVer strictly: breaking changes only ever
        land in a MAJOR release. Every breaking change lands with a loud
        entry in <code>CHANGELOG.md</code> and, where we can, a codemod.
      </p>
      <p>
        Post-1.0 we follow SemVer strictly. Breaking changes require a
        MAJOR bump, full stop. See <code>VERSIONING.md</code> at the
        repo root for the exact policy.
      </p>

      <h2 id="license">What&apos;s the license?</h2>
      <p>MIT. Use it, fork it, ship it in commercial work.</p>

      <h2 id="state-of-project">Is this production ready?</h2>
      <p>
        Not yet. We&apos;re pre-1.0 and the mixin API is still
        settling. The token contract is locked (127 required slots plus 36
        optional, validated on every theme), but expect mixin signatures to move
        before 1.0.
      </p>
      <p>
        That said, we eat our own dogfood: every pixel on this docs
        site — the buttons, cards, type scale, the theme picker — is
        built with cia. Once the mixin API is locked we tag 1.0. See{" "}
        <code>ROADMAP.md</code> at the repo root for current status.
      </p>

      <h2 id="contributing">Can I contribute?</h2>
      <p>
        Yes. See <code>CONTRIBUTING.md</code> at the repo root for
        setup, style, and the PR checklist. Themes, bug fixes, and
        docs improvements are especially welcome.
      </p>

      <h2 id="found-a-bug">I found a bug. What now?</h2>
      <p>
        Open an issue using the Bug Report template at{" "}
        <code>.github/ISSUE_TEMPLATE/bug_report.yml</code>. Include a
        minimal reproduction, the theme you were on, and the browser —
        the template asks for those anyway.
      </p>
      <p>
        For security issues, don&apos;t file a public issue. Email{" "}
        <a href="mailto:jhansenportfolio@gmail.com">
          jhansenportfolio@gmail.com
        </a>{" "}
        directly.
      </p>
    </>
  );
}
