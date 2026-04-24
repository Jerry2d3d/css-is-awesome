import Example from "@/components/Example";
import Badge from "@/components/Badge";

export default function InstallPage() {
  return (
    <>
      <h1>Install css-is-awesome</h1>
      <p className="lead">
        One design system, four install tiers — CDN for quick HTML, npm + SCSS for builds, a framework
        integration for React/Next, or a single theme file you can airdrop into any project.
      </p>

      <h2 id="pick-your-path">Pick your path</h2>
      <p>Match your scenario to an install tier. Each tier ships the same tokens and components — only the delivery differs.</p>
      <ul>
        <li><strong>HTML file, no build</strong> — reach for the <a href="#cdn">CDN</a>. Two <code>&lt;link&gt;</code> tags, zero tooling.</li>
        <li><strong>Sass build pipeline</strong> — use <a href="#npm-scss">npm + SCSS</a>. You get tokens, base, and mixins as first-class <code>@use</code> entries.</li>
        <li><strong>React / Next.js project</strong> — follow the <a href="#react-next">framework integration</a>. Import in <code>app/layout.tsx</code>, wire the <code>data-theme</code> attribute.</li>
        <li><strong>Single file airdrop</strong> — <a href="#download">download a theme file</a> and drop it next to your existing stylesheet.</li>
      </ul>

      <h2 id="cdn">CDN</h2>
      <p>The fastest path. Add two stylesheets to your <code>&lt;head&gt;</code> — theme first so base can read its tokens.</p>
      <Example>
        <Example.Code><span className="tok-com">{"<!-- in your <head> -->"}</span>
{"\n"}<span className="tok-sel">{"<link"}</span> <span className="tok-prop">rel</span>=<span className="tok-val">"stylesheet"</span> <span className="tok-prop">href</span>=<span className="tok-val">"https://cdn.css-is-awesome.dev/v1/theme.css"</span><span className="tok-sel">{">"}</span>
{"\n"}<span className="tok-sel">{"<link"}</span> <span className="tok-prop">rel</span>=<span className="tok-val">"stylesheet"</span> <span className="tok-prop">href</span>=<span className="tok-val">"https://cdn.css-is-awesome.dev/v1/base.css"</span><span className="tok-sel">{">"}</span></Example.Code>
      </Example>
      <p>Verify by dropping a button into the body — if it renders with the theme&rsquo;s primary color, you&rsquo;re wired up.</p>
      <Example>
        <Example.Code><span className="tok-sel">{"<body>"}</span>
{"\n"}  <span className="tok-sel">{"<button"}</span> <span className="tok-prop">class</span>=<span className="tok-val">"btn btn-primary"</span><span className="tok-sel">{">"}</span>Verify<span className="tok-sel">{"</button>"}</span>
{"\n"}<span className="tok-sel">{"</body>"}</span></Example.Code>
      </Example>
      <p><em>Note:</em> the CDN URL is a placeholder pending public launch. Until then, download the same files from <a href="#download">the theme downloads</a> below and self-host.</p>

      <h2 id="npm-scss">npm + SCSS</h2>
      <p>For Sass-driven projects. Install the package, then <code>@use</code> the entry points from your stylesheet. Order matters — tokens must load before base so base can resolve them.</p>
      <Example>
        <Example.Code><span className="tok-com">{"# install"}</span>
{"\n"}<span className="tok-sel">npm</span> <span className="tok-val">install css-is-awesome</span></Example.Code>
      </Example>
      <Example>
        <Example.Code><span className="tok-com">{"// app.scss — your entry point"}</span>
{"\n"}<span className="tok-sel">@use</span> <span className="tok-val">'css-is-awesome/tokens'</span>;   <span className="tok-com">{"/* 1. tokens first  */"}</span>
{"\n"}<span className="tok-sel">@use</span> <span className="tok-val">'css-is-awesome/base'</span>;     <span className="tok-com">{"/* 2. then base      */"}</span>
{"\n"}<span className="tok-sel">@use</span> <span className="tok-val">'css-is-awesome/mixins'</span> <span className="tok-prop">as</span> <span className="tok-val">m</span>;  <span className="tok-com">{"/* 3. mixins for your code */"}</span>
{"\n"}
{"\n"}<span className="tok-com">{"/* now author with mixins */"}</span>
{"\n"}<span className="tok-sel">.hero</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.surface(paper)</span>;
{"\n"}  <span className="tok-prop">padding</span>: <span className="tok-val">m.space(6)</span>;
{"\n"}{"}"}</Example.Code>
      </Example>
      <p>If you skip <code>tokens</code> or load it after <code>base</code>, every <code>var(--…)</code> in base falls back to its default — you&rsquo;ll see unstyled or inverted colors. Load order is the one rule.</p>

      <h2 id="react-next">React + Next.js</h2>
      <p>Import the stylesheets once in your root <code>app/layout.tsx</code> and set the active theme on the <code>&lt;html&gt;</code> element. Components read tokens via <code>var(--…)</code>, so you can mix and match anywhere in your tree.</p>
      <Example>
        <Example.Code><span className="tok-com">{"// app/layout.tsx"}</span>
{"\n"}<span className="tok-sel">import</span> <span className="tok-val">"css-is-awesome/theme.css"</span>;
{"\n"}<span className="tok-sel">import</span> <span className="tok-val">"css-is-awesome/base.css"</span>;
{"\n"}
{"\n"}<span className="tok-sel">export default function</span> <span className="tok-val">RootLayout</span>({"{ children }"}) {"{"}
{"\n"}  <span className="tok-sel">return</span> (
{"\n"}    <span className="tok-sel">{"<html"}</span> <span className="tok-prop">lang</span>=<span className="tok-val">"en"</span> <span className="tok-prop">data-theme</span>=<span className="tok-val">"sketchbook"</span><span className="tok-sel">{">"}</span>
{"\n"}      <span className="tok-sel">{"<body>"}</span>{"{children}"}<span className="tok-sel">{"</body>"}</span>
{"\n"}    <span className="tok-sel">{"</html>"}</span>
{"\n"}  );
{"\n"}{"}"}</Example.Code>
      </Example>
      <p>Once the theme is active, any component can pull a token straight off CSS custom properties — no hooks, no context.</p>
      <Example>
        <Example.Code><span className="tok-sel">{"<div"}</span> <span className="tok-prop">style</span>={"{{"} <span className="tok-prop">color</span>: <span className="tok-val">"var(--ink)"</span> {"}}"}<span className="tok-sel">{">"}</span>
{"\n"}  Ink-colored text, regardless of which theme is active.
{"\n"}<span className="tok-sel">{"</div>"}</span></Example.Code>
      </Example>
      <p>To switch themes at runtime, flip <code>document.documentElement.dataset.theme</code> — every token updates in one paint.</p>

      <h2 id="download">Download a theme file</h2>
      <p>Every shipped theme is a single <code>theme.css</code> file. Grab one, place it in your project, and link to it. This path also works for any custom theme you self-host — the file is just tokens on <code>:root</code>.</p>
      <ul>
        <li><a href="/theme.css" download="theme-sketchbook.css">sketchbook</a> &mdash; warm paper, sumi ink, indigo accent</li>
        <li><a href="/themes/press/theme.css" download>press</a> &mdash; editorial newsprint</li>
        <li><a href="/themes/graphite/theme.css" download>graphite</a> &mdash; neutral grayscale utility</li>
        <li><a href="/themes/glass/theme.css" download>glass</a> &mdash; translucent surfaces, soft light</li>
        <li><a href="/themes/cupertino/theme.css" download>cupertino</a> &mdash; Apple-flavored system look</li>
        <li><a href="/themes/terminal/theme.css" download>terminal</a> &mdash; monospace green-on-black</li>
      </ul>
      <p>Drop the file into your project (for example <code>public/themes/</code> or <code>assets/css/</code>) and reference it with a standard <code>&lt;link&gt;</code>.</p>
      <Example>
        <Example.Code><span className="tok-sel">{"<link"}</span> <span className="tok-prop">rel</span>=<span className="tok-val">"stylesheet"</span> <span className="tok-prop">href</span>=<span className="tok-val">"./path/to/theme.css"</span><span className="tok-sel">{">"}</span>
{"\n"}<span className="tok-sel">{"<link"}</span> <span className="tok-prop">rel</span>=<span className="tok-val">"stylesheet"</span> <span className="tok-prop">href</span>=<span className="tok-val">"./path/to/base.css"</span><span className="tok-sel">{">"}</span></Example.Code>
      </Example>

      <h2 id="verify">Verify</h2>
      <p>However you installed, a styled success badge is the quickest smoke test. If this renders as a filled pill with the theme&rsquo;s success color, you&rsquo;re done.</p>
      <Example>
        <Example.Preview style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Badge status="success">Installed</Badge>
        </Example.Preview>
        <Example.Code><span className="tok-sel">import</span> <span className="tok-val">Badge</span> <span className="tok-sel">from</span> <span className="tok-val">"@/components/Badge"</span>;
{"\n"}
{"\n"}<span className="tok-sel">{"<Badge"}</span> <span className="tok-prop">status</span>=<span className="tok-val">"success"</span><span className="tok-sel">{">"}</span>Installed<span className="tok-sel">{"</Badge>"}</span></Example.Code>
      </Example>
    </>
  );
}
