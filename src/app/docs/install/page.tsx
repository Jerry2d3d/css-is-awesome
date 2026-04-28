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
        <li><strong>Sass build pipeline</strong> — use <a href="#npm-scss">npm + SCSS</a>. The full mixin API plus per-component partials are exposed as first-class <code>@use</code> entries.</li>
        <li><strong>React / Next.js project</strong> — follow the <a href="#react-next">framework integration</a>. Import in <code>app/layout.tsx</code>, wire the <code>data-theme</code> attribute.</li>
        <li><strong>Single file airdrop</strong> — <a href="#download">download a theme file</a> and drop it next to your existing stylesheet.</li>
      </ul>

      <h2 id="cdn">CDN</h2>
      <p>The fastest path. Two <code>&lt;link&gt;</code> tags via jsDelivr (auto-mirrored from npm). Theme first so the library can read its tokens.</p>
      <Example>
        <Example.Code><span className="tok-com">{"<!-- in your <head> -->"}</span>
{"\n"}<span className="tok-sel">{"<link"}</span> <span className="tok-prop">rel</span>=<span className="tok-val">"stylesheet"</span>
{"\n"}      <span className="tok-prop">href</span>=<span className="tok-val">"https://cdn.jsdelivr.net/npm/css-is-awesome@0.6.0/public/theme.css"</span><span className="tok-sel">{">"}</span>
{"\n"}<span className="tok-sel">{"<link"}</span> <span className="tok-prop">rel</span>=<span className="tok-val">"stylesheet"</span>
{"\n"}      <span className="tok-prop">href</span>=<span className="tok-val">"https://cdn.jsdelivr.net/npm/css-is-awesome@0.6.0/dist/css-is-awesome.min.css"</span><span className="tok-sel">{">"}</span></Example.Code>
      </Example>
      <p>Verify by dropping a button into the body — if it renders with the theme&rsquo;s primary color, you&rsquo;re wired up.</p>
      <Example>
        <Example.Code><span className="tok-sel">{"<body>"}</span>
{"\n"}  <span className="tok-sel">{"<button"}</span> <span className="tok-prop">class</span>=<span className="tok-val">"cia-btn-primary"</span><span className="tok-sel">{">"}</span>Verify<span className="tok-sel">{"</button>"}</span>
{"\n"}<span className="tok-sel">{"</body>"}</span></Example.Code>
      </Example>

      <h3 id="cdn-sri">Subresource Integrity (SRI)</h3>
      <p>
        For security-conscious environments, pin each <code>&lt;link&gt;</code> to a hash. jsDelivr auto-generates an{" "}
        <code>.sha384</code> sidecar for every published file — fetch it once at the version you intend to ship and paste the value into{" "}
        <code>integrity</code>.
      </p>
      <Example>
        <Example.Code><span className="tok-com">{"# fetch the sha384 for the version you're pinning"}</span>
{"\n"}<span className="tok-sel">curl</span> <span className="tok-val">https://cdn.jsdelivr.net/npm/css-is-awesome@0.6.0/dist/css-is-awesome.min.css.sha384</span>
{"\n"}<span className="tok-sel">curl</span> <span className="tok-val">https://cdn.jsdelivr.net/npm/css-is-awesome@0.6.0/public/theme.css.sha384</span></Example.Code>
      </Example>
      <Example>
        <Example.Code><span className="tok-com">{"<!-- pinned <link> tags with integrity + crossorigin -->"}</span>
{"\n"}<span className="tok-sel">{"<link"}</span> <span className="tok-prop">rel</span>=<span className="tok-val">"stylesheet"</span>
{"\n"}      <span className="tok-prop">href</span>=<span className="tok-val">"https://cdn.jsdelivr.net/npm/css-is-awesome@0.6.0/public/theme.css"</span>
{"\n"}      <span className="tok-prop">integrity</span>=<span className="tok-val">"sha384-…paste from above…"</span>
{"\n"}      <span className="tok-prop">crossorigin</span>=<span className="tok-val">"anonymous"</span><span className="tok-sel">{">"}</span>
{"\n"}<span className="tok-sel">{"<link"}</span> <span className="tok-prop">rel</span>=<span className="tok-val">"stylesheet"</span>
{"\n"}      <span className="tok-prop">href</span>=<span className="tok-val">"https://cdn.jsdelivr.net/npm/css-is-awesome@0.6.0/dist/css-is-awesome.min.css"</span>
{"\n"}      <span className="tok-prop">integrity</span>=<span className="tok-val">"sha384-…paste from above…"</span>
{"\n"}      <span className="tok-prop">crossorigin</span>=<span className="tok-val">"anonymous"</span><span className="tok-sel">{">"}</span></Example.Code>
      </Example>
      <p>
        Re-fetch the hash on every version bump — pinned versions intentionally fail to load if the file mutates upstream.
      </p>

      <h2 id="npm-scss">npm + SCSS</h2>
      <p>For Sass-driven projects. Install the package, then <code>@use</code> what you need. The simplest path is to pull the entire system in one line via <code>scss/main</code>; reach for the smaller subpaths when you only want the mixin API.</p>
      <Example>
        <Example.Code><span className="tok-com">{"# install"}</span>
{"\n"}<span className="tok-sel">npm</span> <span className="tok-val">install css-is-awesome</span></Example.Code>
      </Example>
      <Example>
        <Example.Code><span className="tok-com">{"// app.scss — full system, generates CSS at this load point"}</span>
{"\n"}<span className="tok-sel">@use</span> <span className="tok-val">'css-is-awesome/scss/main'</span>;</Example.Code>
      </Example>
      <p>
        That single line emits tokens, base resets, animations, utilities, and component classes. From here, author your own classes against the mixin API.
      </p>
      <Example>
        <Example.Code><span className="tok-com">{"// app.scss — mixin API only, you control the output"}</span>
{"\n"}<span className="tok-sel">@use</span> <span className="tok-val">'css-is-awesome/scss/mixins'</span> <span className="tok-prop">as</span> <span className="tok-val">m</span>;
{"\n"}<span className="tok-sel">@use</span> <span className="tok-val">'css-is-awesome/scss/components/buttons'</span> <span className="tok-prop">as</span> <span className="tok-val">b</span>;
{"\n"}
{"\n"}<span className="tok-sel">.hero-cta</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">b.btn(primary, $px: 6, $r: full)</span>;
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.elevation(2)</span>;
{"\n"}{"}"}</Example.Code>
      </Example>
      <p>
        Available subpaths: <code>scss/main</code>, <code>scss/mixins</code>, <code>scss/utilities</code>, <code>scss/animations</code>, <code>scss/icons</code>, <code>scss/layout</code>, <code>scss/system</code>, <code>scss/theme</code>, <code>scss/components/&lt;name&gt;</code> (buttons, data, feedback, forms, navigation, overlay), and <code>scss/recipes/&lt;name&gt;</code> (e.g. <code>bare-tags</code>). The <code>scss/main</code> entry already pulls in everything, so don&rsquo;t re-include components you&rsquo;ve already loaded through it.
      </p>

      <h2 id="react-next">React + Next.js</h2>
      <p>Import the stylesheets once in your root <code>app/layout.tsx</code> and set the active theme on the <code>&lt;html&gt;</code> element. Components read tokens via <code>var(--…)</code>, so you can mix and match anywhere in your tree.</p>
      <Example>
        <Example.Code><span className="tok-com">{"// app/layout.tsx"}</span>
{"\n"}<span className="tok-sel">import</span> <span className="tok-val">"css-is-awesome/theme"</span>;       <span className="tok-com">{"// 1. tokens (all six themes, one file)"}</span>
{"\n"}<span className="tok-sel">import</span> <span className="tok-val">"css-is-awesome/min.css"</span>;     <span className="tok-com">{"// 2. compiled library (utilities + components)"}</span>
{"\n"}
{"\n"}<span className="tok-sel">export default function</span> <span className="tok-val">RootLayout</span>({"{ children }"}) {"{"}
{"\n"}  <span className="tok-sel">return</span> (
{"\n"}    <span className="tok-sel">{"<html"}</span> <span className="tok-prop">lang</span>=<span className="tok-val">"en"</span> <span className="tok-prop">data-theme</span>=<span className="tok-val">"sketchbook"</span><span className="tok-sel">{">"}</span>
{"\n"}      <span className="tok-sel">{"<body>"}</span>{"{children}"}<span className="tok-sel">{"</body>"}</span>
{"\n"}    <span className="tok-sel">{"</html>"}</span>
{"\n"}  );
{"\n"}{"}"}</Example.Code>
      </Example>
      <p>
        Once the theme is active, any component can pull a token straight off CSS custom properties — no hooks, no context.
      </p>
      <Example>
        <Example.Code><span className="tok-sel">{"<div"}</span> <span className="tok-prop">style</span>={"{{"} <span className="tok-prop">color</span>: <span className="tok-val">"var(--ink)"</span> {"}}"}<span className="tok-sel">{">"}</span>
{"\n"}  Ink-colored text, regardless of which theme is active.
{"\n"}<span className="tok-sel">{"</div>"}</span></Example.Code>
      </Example>
      <p>
        To switch themes at runtime, flip <code>document.documentElement.dataset.theme</code> — every token updates in one paint. Or swap <code>css-is-awesome/min.css</code> for <code>css-is-awesome/core.css</code> (tokens + resets only) when you want to author the rest yourself.
      </p>

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
      <p>Drop the file into your project (for example <code>public/themes/</code> or <code>assets/css/</code>) and reference it with a standard <code>&lt;link&gt;</code>, paired with the compiled library.</p>
      <Example>
        <Example.Code><span className="tok-sel">{"<link"}</span> <span className="tok-prop">rel</span>=<span className="tok-val">"stylesheet"</span> <span className="tok-prop">href</span>=<span className="tok-val">"./path/to/theme.css"</span><span className="tok-sel">{">"}</span>
{"\n"}<span className="tok-sel">{"<link"}</span> <span className="tok-prop">rel</span>=<span className="tok-val">"stylesheet"</span> <span className="tok-prop">href</span>=<span className="tok-val">"./path/to/css-is-awesome.min.css"</span><span className="tok-sel">{">"}</span></Example.Code>
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
