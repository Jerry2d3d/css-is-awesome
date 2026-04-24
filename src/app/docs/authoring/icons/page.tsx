import Link from "next/link";
import Example from "@/components/Example";
import Button from "@/components/Button";

export default function DocsAuthoringIconsPage() {
  return (
    <>
      <h1>Authoring icons</h1>
      <p className="lead">
        Icons in css-is-awesome are inline SVGs tinted by <code>currentColor</code>,
        so every glyph re-skins with the active theme automatically — no icon
        font, no sprite sheet, no runtime tint pipeline.
      </p>

      <h2 id="approach">Approach</h2>
      <p>
        The icon system is folder-based and mixin-first. Drop an SVG into{" "}
        <code>public/icons/</code>, reference it with{" "}
        <code>@include m.svg(name)</code>, and it inherits the parent&apos;s{" "}
        <code>color</code>. The same file is also usable as a plain inline{" "}
        <code>&lt;svg&gt;</code> in React components — that is the pattern the
        docs site itself follows. The principles are the same either way:
      </p>
      <ul>
        <li>
          Every shipped icon paints with <code>stroke="currentColor"</code>{" "}
          (and <code>fill="none"</code>), so text color drives icon color. No
          hardcoded hex values live in the SVG source.
        </li>
        <li>
          The default icon size is <code>24px</code> — both the SCSS config
          (<code>$theme-icon-size</code> in <code>scss/theme/_icons.scss</code>)
          and every shipped SVG uses a <code>24 × 24</code> viewBox. Size is set
          per call site via <code>width</code> / <code>height</code> (or via the
          mixin&apos;s <code>$size</code> argument).
        </li>
        <li>
          Decorative icons get <code>aria-hidden=&quot;true&quot;</code>.
          Meaningful icons use <code>role=&quot;img&quot;</code> plus{" "}
          <code>&lt;title&gt;</code>. Icon-only buttons put the accessible name
          on the <code>&lt;button&gt;</code> itself.
        </li>
        <li>
          No icon font in the default path — the SCSS layer ships an opt-in
          Font Awesome integration for projects already on FA, but the
          recommended default is inline SVG. Inline SVG avoids the
          accessibility and tree-shaking penalties of icon fonts.
        </li>
      </ul>

      <h2 id="using-icons">Using icons</h2>
      <p>
        There is no <code>&lt;Icon&gt;</code> React component in the docs site
        — components inline the SVG directly (see{" "}
        <code>src/components/SearchBar/SearchBar.tsx</code> for the canonical
        example). The same pattern works in any app. From SCSS, the mixin API
        in <code>scss/_icons.scss</code> is the primary surface:
      </p>
      <Example>
        <Example.Code><span className="tok-com">{"// SCSS — inline icon that tints with text color"}</span>
{"\n"}<span className="tok-sel">@use</span> <span className="tok-val">&apos;cia/scss/mixins&apos;</span> <span className="tok-sel">as</span> <span className="tok-prop">m</span>;
{"\n"}
{"\n"}<span className="tok-sel">.btn-close</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.svg(close)</span>;   <span className="tok-com">{"// resolves to /icons/x.svg via alias"}</span>
{"\n"}  <span className="tok-prop">color</span>: <span className="tok-val">var(--color-danger)</span>;
{"\n"}{"}"}
{"\n"}
{"\n"}<span className="tok-sel">.btn-save</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.svg-text(check)</span>;  <span className="tok-com">{"// icon + label, 0.5em gap"}</span>
{"\n"}{"}"}
{"\n"}
{"\n"}<span className="tok-sel">.logo</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.svg-bg(brand-mark, 48px)</span>; <span className="tok-com">{"// multi-color, no tint"}</span>
{"\n"}{"}"}</Example.Code>
      </Example>
      <p>
        From React, inline the SVG and let <code>currentColor</code> do the
        work. This is exactly how the real <code>SearchBar</code> component
        renders its magnifier:
      </p>
      <Example>
        <Example.Preview style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <span style={{ display: "inline-flex", color: "var(--color-text, currentColor)" }} aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
              <circle cx="10.5" cy="10.5" r="7.5" />
              <path d="M16 16l5 5" />
            </svg>
          </span>
          <span style={{ color: "var(--color-danger, #c33)", display: "inline-flex" }} aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" width="24" height="24">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </span>
        </Example.Preview>
        <Example.Code><span className="tok-com">{"// Decorative: aria-hidden, inherits parent color"}</span>
{"\n"}<span className="tok-sel">{"<span"}</span> <span className="tok-prop">aria-hidden</span>=<span className="tok-val">&quot;true&quot;</span><span className="tok-sel">{">"}</span>
{"\n"}  <span className="tok-sel">{"<svg"}</span> <span className="tok-prop">viewBox</span>=<span className="tok-val">&quot;0 0 24 24&quot;</span> <span className="tok-prop">fill</span>=<span className="tok-val">&quot;none&quot;</span> <span className="tok-prop">stroke</span>=<span className="tok-val">&quot;currentColor&quot;</span>
{"\n"}       <span className="tok-prop">stroke-width</span>=<span className="tok-val">&quot;1.6&quot;</span> <span className="tok-prop">width</span>=<span className="tok-val">&quot;24&quot;</span> <span className="tok-prop">height</span>=<span className="tok-val">&quot;24&quot;</span><span className="tok-sel">{">"}</span>
{"\n"}    <span className="tok-sel">{"<circle"}</span> <span className="tok-prop">cx</span>=<span className="tok-val">&quot;10.5&quot;</span> <span className="tok-prop">cy</span>=<span className="tok-val">&quot;10.5&quot;</span> <span className="tok-prop">r</span>=<span className="tok-val">&quot;7.5&quot;</span> <span className="tok-sel">{"/>"}</span>
{"\n"}    <span className="tok-sel">{"<path"}</span> <span className="tok-prop">d</span>=<span className="tok-val">&quot;M16 16l5 5&quot;</span> <span className="tok-sel">{"/>"}</span>
{"\n"}  <span className="tok-sel">{"</svg>"}</span>
{"\n"}<span className="tok-sel">{"</span>"}</span></Example.Code>
      </Example>

      <h2 id="authoring-a-new-icon">Authoring a new icon</h2>
      <ol>
        <li>
          <strong>Start with a <code>24×24</code> viewBox.</strong> Every icon
          in <code>public/icons/</code> uses{" "}
          <code>viewBox=&quot;0 0 24 24&quot;</code>. Matching the existing
          grid keeps strokes and optical weight consistent across the pack.
        </li>
        <li>
          <strong>Use <code>fill=&quot;none&quot;</code>,{" "}
          <code>stroke=&quot;currentColor&quot;</code>,{" "}
          <code>stroke-width=&quot;1.6&quot;</code>.</strong> The shipped icons
          use strokes between <code>1.6</code> and <code>1.8</code> with{" "}
          <code>stroke-linecap=&quot;round&quot;</code> and{" "}
          <code>stroke-linejoin=&quot;round&quot;</code>. Stick to that palette
          unless you have a reason — mixed stroke weights look ragged in a
          toolbar.
        </li>
        <li>
          <strong>Keep paths minimal.</strong> Icons render at 16–24px most of
          the time. Decorative detail (fine hatching, thin highlights, micro
          curves) is lost below 24px. Collapse compound shapes to single paths
          where possible — the shipped <code>check.svg</code> is a single{" "}
          <code>&lt;path d=&quot;M4 12l5 5L20 6&quot; /&gt;</code>.
        </li>
        <li>
          <strong>Name icons by semantic role.</strong> Use{" "}
          <code>check</code>, <code>close</code>, <code>chevron-down</code> —
          not <code>little-x</code> or <code>blue-arrow</code>. When the
          visual metaphor changes, only the file changes; every call site
          stays correct. Use <code>$theme-icon-svg-alias</code> in{" "}
          <code>scss/theme/_icons.scss</code> when you want a semantic call
          site (<code>delete</code>) to resolve to a neutral filename
          (<code>trash.svg</code>) — the default map already ships{" "}
          <code>delete → trash</code> and <code>close → x</code>.
        </li>
        <li>
          <strong>Drop the file into <code>public/icons/</code> and wire it
          in.</strong> No registry, no import list. From SCSS:{" "}
          <code>@include m.svg(my-icon)</code> now works. From React, import
          the raw SVG markup or copy/paste it inline. For a full authoring
          reference, see <code>public/icons/README.md</code>.
        </li>
      </ol>

      <h2 id="sizing-and-color">Sizing and color</h2>
      <p>
        Size is set at the call site via <code>width</code> / <code>height</code>{" "}
        (or the <code>$size</code> argument on the mixins). Color is never set
        on the SVG — it reads <code>currentColor</code> and follows whatever{" "}
        <code>color</code> the parent has. That is the entire coupling between
        icons and themes: when the theme picker changes the foreground color
        token, every icon on the page re-tints in the same frame.
      </p>
      <Example>
        <Example.Preview style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <Button variant="primary">
            <span style={{ display: "inline-flex", marginRight: 8 }} aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <path d="M4 12l5 5L20 6" />
              </svg>
            </span>
            Save
          </Button>
          <Button variant="outline">
            Continue
            <span style={{ display: "inline-flex", marginLeft: 8 }} aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <path d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </span>
          </Button>
        </Example.Preview>
        <Example.Code><span className="tok-com">{"// The SVG stroke is currentColor, so it inherits the button's ink."}</span>
{"\n"}<span className="tok-com">{"// Re-skin via the theme picker — the icon re-colors on the same frame."}</span>
{"\n"}<span className="tok-sel">{"<button"}</span> <span className="tok-prop">class</span>=<span className="tok-val">&quot;cia-btn cia-btn--primary&quot;</span><span className="tok-sel">{">"}</span>
{"\n"}  <span className="tok-sel">{"<span"}</span> <span className="tok-prop">aria-hidden</span>=<span className="tok-val">&quot;true&quot;</span><span className="tok-sel">{">"}</span>
{"\n"}    <span className="tok-sel">{"<svg"}</span> <span className="tok-prop">viewBox</span>=<span className="tok-val">&quot;0 0 24 24&quot;</span> <span className="tok-prop">fill</span>=<span className="tok-val">&quot;none&quot;</span> <span className="tok-prop">stroke</span>=<span className="tok-val">&quot;currentColor&quot;</span>
{"\n"}         <span className="tok-prop">stroke-width</span>=<span className="tok-val">&quot;1.8&quot;</span> <span className="tok-prop">width</span>=<span className="tok-val">&quot;16&quot;</span> <span className="tok-prop">height</span>=<span className="tok-val">&quot;16&quot;</span><span className="tok-sel">{">"}</span>
{"\n"}      <span className="tok-sel">{"<path"}</span> <span className="tok-prop">d</span>=<span className="tok-val">&quot;M4 12l5 5L20 6&quot;</span> <span className="tok-sel">{"/>"}</span>
{"\n"}    <span className="tok-sel">{"</svg>"}</span>
{"\n"}  <span className="tok-sel">{"</span>"}</span>
{"\n"}  Save
{"\n"}<span className="tok-sel">{"</button>"}</span></Example.Code>
      </Example>
      <p>
        If you need an icon that must <em>not</em> tint — a brand mark, a
        multi-color illustration — use <code>m.svg-bg</code> instead of{" "}
        <code>m.svg</code>. It renders the file as a plain{" "}
        <code>background-image</code>, preserving the baked-in palette.
      </p>

      <h2 id="a11y-checklist">Accessibility checklist</h2>
      <ul>
        <li>
          <strong>Decorative icons.</strong> Add{" "}
          <code>aria-hidden=&quot;true&quot;</code> to the{" "}
          <code>&lt;svg&gt;</code> (or its wrapping <code>&lt;span&gt;</code>)
          and skip <code>&lt;title&gt;</code>. Screen readers ignore them; the
          adjacent text carries the meaning.
        </li>
        <li>
          <strong>Meaningful icons.</strong> Add{" "}
          <code>role=&quot;img&quot;</code> plus a{" "}
          <code>&lt;title&gt;</code> child (or a visually-hidden sibling{" "}
          <code>&lt;span&gt;</code>). Assistive tech announces the title as
          the icon&apos;s accessible name.
        </li>
        <li>
          <strong>Icon-only buttons.</strong> Put{" "}
          <code>aria-label=&quot;Close&quot;</code> on the{" "}
          <code>&lt;button&gt;</code> — not on the SVG. The button is the
          interactive element; it owns the label.
        </li>
        <li>
          <strong>Touch targets.</strong> An icon rendered at 16–24px needs a
          minimum <code>44 × 44px</code> click area around it. Pad the button,
          don&apos;t shrink the hit box — that is a WCAG 2.5.5 requirement and
          a finger-on-phone reality.
        </li>
      </ul>

      <h2 id="third-party">Third-party icon packs</h2>
      <p>
        css-is-awesome has no runtime dependency on a third-party pack — the
        shipped <code>public/icons/*.svg</code> are hand-authored. If your
        team already uses Heroicons, Lucide, Phosphor, or Feather, all four
        emit inline SVG with <code>stroke=&quot;currentColor&quot;</code> and
        24×24 viewBoxes, so they drop in with zero conversion. Import the
        React component the pack ships, or copy the raw SVG markup into your
        component and follow the conventions above. The SCSS layer also ships
        an opt-in Font Awesome integration (see <code>m.fa-icon</code>,{" "}
        <code>m.fa-text</code>, <code>m.fa-spin</code> in{" "}
        <code>scss/_icons.scss</code>) for teams already on a Font Awesome
        kit — it is disabled by default.
      </p>

      <h2 id="further-reading">Further reading</h2>
      <ul>
        <li>
          <Link href="/docs/tokens#palette">Tokens → Palette</Link> — the color
          tokens <code>currentColor</code> ultimately inherits from.
        </li>
        <li>
          <Link href="/docs/a11y">Accessibility</Link> — labels, focus, and
          touch-target rules that apply beyond icons.
        </li>
        <li>
          <code>public/icons/README.md</code> — the in-repo authoring
          reference covering the SVG mixin API, aliases, per-theme icon
          packs, and troubleshooting.
        </li>
      </ul>
    </>
  );
}
