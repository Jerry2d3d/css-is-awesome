import Example from "@/components/Example";
import Badge from "@/components/Badge";
import { asset } from "@/lib/asset";

export default function InstallPage() {
  return (
    <>
      <h1>Install css-is-awesome</h1>
      <p className="lead">
        cia is mixin-first. The primary API is <code>@use 'css-is-awesome/api' as cia;</code> +{" "}
        <code>@include cia.btn(primary)</code> on whatever selector you choose. Utility classes are an
        opt-in convenience for non-Sass consumers — the npm package ships zero JavaScript.
      </p>

      <h2 id="quick-start">Quick start (Sass)</h2>
      <p>The 30-second path. One install, one <code>@use</code>, write your own selectors against the mixin API.</p>
      <Example>
        <Example.Code><span className="tok-com">{"# install"}</span>
{"\n"}<span className="tok-sel">npm</span> <span className="tok-val">install css-is-awesome</span></Example.Code>
      </Example>
      <Example>
        <Example.Code><span className="tok-com">{"// app.scss"}</span>
{"\n"}<span className="tok-sel">@use</span> <span className="tok-val">'css-is-awesome'</span> <span className="tok-prop">as</span> <span className="tok-val">cia</span>;
{"\n"}
{"\n"}<span className="tok-sel">.checkout-cta</span> {"{"} <span className="tok-prop">@include</span> <span className="tok-val">cia.btn(primary)</span>; {"}"}
{"\n"}<span className="tok-sel">.faq-item</span>     {"{"} <span className="tok-prop">@include</span> <span className="tok-val">cia.accordion</span>; {"}"}
{"\n"}<span className="tok-sel">.modal</span>        {"{"} <span className="tok-prop">@include</span> <span className="tok-val">cia.modal</span>; {"}"}</Example.Code>
      </Example>
      <Example>
        <Example.Code><span className="tok-com">{"<!-- one theme file — no markup change required -->"}</span>
{"\n"}<span className="tok-sel">{"<link"}</span> <span className="tok-prop">rel</span>=<span className="tok-val">"stylesheet"</span> <span className="tok-prop">href</span>=<span className="tok-val">"/cia/themes/boilerplate.css"</span><span className="tok-sel">{">"}</span></Example.Code>
      </Example>
      <p>
        That&rsquo;s the whole pitch. One <code>{`<link>`}</code> for the theme, one <code>@use</code> for the mixins, your own selectors do the wiring.
      </p>
      <p>
        Every shipped theme file emits <code>:root, :root[data-theme=&quot;name&quot;]</code>, so
        dropping a single file in as your <code>theme.css</code> reskins the page on its own —{" "}
        <strong><code>data-theme</code> is optional in the single-file case</strong>. Swap the file
        for a different theme and nothing else has to change.
      </p>
      <p>
        The attribute is <strong>required for the multi-theme bundle</strong> (<code>public/theme.css</code>,
        which carries all 24 themes in one file). There the <code>data-theme</code> value on{" "}
        <code>&lt;html&gt;</code> is the only thing that distinguishes one theme from the next.
      </p>
      <Example>
        <Example.Code><span className="tok-com">{"<!-- the 24-theme bundle: the attribute picks which theme applies -->"}</span>
{"\n"}<span className="tok-sel">{"<link"}</span> <span className="tok-prop">rel</span>=<span className="tok-val">"stylesheet"</span> <span className="tok-prop">href</span>=<span className="tok-val">"/cia/theme.css"</span><span className="tok-sel">{">"}</span>
{"\n"}<span className="tok-sel">{"<html"}</span> <span className="tok-prop">data-theme</span>=<span className="tok-val">"boilerplate"</span><span className="tok-sel">{">"}</span></Example.Code>
      </Example>

      <h2 id="pick-your-path">Pick your path</h2>
      <p>Four delivery shapes. Each ships the same tokens and components — only the consumption differs.</p>
      <ul>
        <li><strong>Sass build pipeline (recommended)</strong> — see the <a href="#quick-start">quick start</a> above and the <a href="#npm-scss">full npm + SCSS</a> section. The primary cia experience.</li>
        <li><strong>React / Next.js project</strong> — same as Sass; see the <a href="#react-next">framework integration</a> notes for <code>app/layout.tsx</code> wiring.</li>
        <li><strong>HTML file, no build</strong> — reach for the <a href="#cdn">CDN</a>. Two <code>&lt;link&gt;</code> tags, zero tooling. Utility classes available.</li>
        <li><strong>Single file airdrop</strong> — <a href="#download">download a theme file</a> and drop it next to your existing stylesheet. No attribute, no markup change.</li>
      </ul>

      <h2 id="cdn">CDN</h2>
      <p>The fastest path. Two <code>&lt;link&gt;</code> tags via jsDelivr (auto-mirrored from npm). Theme first so the library can read its tokens.</p>
      <Example>
        <Example.Code><span className="tok-com">{"<!-- in your <head> -->"}</span>
{"\n"}<span className="tok-sel">{"<link"}</span> <span className="tok-prop">rel</span>=<span className="tok-val">"stylesheet"</span>
{"\n"}      <span className="tok-prop">href</span>=<span className="tok-val">"https://cdn.jsdelivr.net/npm/css-is-awesome@1/public/theme.css"</span><span className="tok-sel">{">"}</span>
{"\n"}<span className="tok-sel">{"<link"}</span> <span className="tok-prop">rel</span>=<span className="tok-val">"stylesheet"</span>
{"\n"}      <span className="tok-prop">href</span>=<span className="tok-val">"https://cdn.jsdelivr.net/npm/css-is-awesome@1/dist/css-is-awesome.min.css"</span><span className="tok-sel">{">"}</span></Example.Code>
      </Example>
      <p>
        <code>public/theme.css</code> is the bundle — all 24 themes in one file — so set{" "}
        <code>&lt;html data-theme=&quot;…&quot;&gt;</code> to pick one. If you only need a single theme,
        link <code>public/themes/&lt;name&gt;/theme.css</code> instead and skip the attribute entirely.
      </p>
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
{"\n"}<span className="tok-sel">curl</span> <span className="tok-val">https://cdn.jsdelivr.net/npm/css-is-awesome@1/dist/css-is-awesome.min.css.sha384</span>
{"\n"}<span className="tok-sel">curl</span> <span className="tok-val">https://cdn.jsdelivr.net/npm/css-is-awesome@1/public/theme.css.sha384</span></Example.Code>
      </Example>
      <Example>
        <Example.Code><span className="tok-com">{"<!-- pinned <link> tags with integrity + crossorigin -->"}</span>
{"\n"}<span className="tok-sel">{"<link"}</span> <span className="tok-prop">rel</span>=<span className="tok-val">"stylesheet"</span>
{"\n"}      <span className="tok-prop">href</span>=<span className="tok-val">"https://cdn.jsdelivr.net/npm/css-is-awesome@1/public/theme.css"</span>
{"\n"}      <span className="tok-prop">integrity</span>=<span className="tok-val">"sha384-…paste from above…"</span>
{"\n"}      <span className="tok-prop">crossorigin</span>=<span className="tok-val">"anonymous"</span><span className="tok-sel">{">"}</span>
{"\n"}<span className="tok-sel">{"<link"}</span> <span className="tok-prop">rel</span>=<span className="tok-val">"stylesheet"</span>
{"\n"}      <span className="tok-prop">href</span>=<span className="tok-val">"https://cdn.jsdelivr.net/npm/css-is-awesome@1/dist/css-is-awesome.min.css"</span>
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
        <Example.Code><span className="tok-com">{"// Card.module.scss — zero-emit barrel, you control the output"}</span>
{"\n"}<span className="tok-sel">@use</span> <span className="tok-val">'css-is-awesome/api'</span> <span className="tok-prop">as</span> <span className="tok-val">cia</span>;
{"\n"}
{"\n"}<span className="tok-sel">.hero-cta</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">cia.btn(primary, $px: 6, $r: full)</span>;
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">cia.elevation(2)</span>;
{"\n"}{"}"}</Example.Code>
      </Example>
      <p>
        Available subpaths: <code>scss/main</code>, <code>scss/mixins</code>, <code>scss/utilities</code>, <code>scss/animations</code>, <code>scss/icons</code>, <code>scss/layout</code>, <code>scss/system</code>, <code>scss/theme</code>, <code>scss/components/&lt;name&gt;</code> (buttons, data, feedback, forms, navigation, overlay), and <code>scss/recipes/&lt;name&gt;</code> (e.g. <code>bare-tags</code>). The <code>scss/main</code> entry already pulls in everything, so don&rsquo;t re-include components you&rsquo;ve already loaded through it.
      </p>

      <h2 id="react-next">React + Next.js</h2>
      <p>Import the stylesheets once in your root <code>app/layout.tsx</code>. This example uses the bundle, so it sets the active theme on the <code>&lt;html&gt;</code> element; a single-theme import needs no attribute. Components read tokens via <code>var(--…)</code>, so you can mix and match anywhere in your tree.</p>
      <Example>
        <Example.Code><span className="tok-com">{"// app/layout.tsx"}</span>
{"\n"}<span className="tok-sel">import</span> <span className="tok-val">"css-is-awesome/theme"</span>;       <span className="tok-com">{"// 1. tokens (all 24 themes, one file)"}</span>
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
      <p>
        Every shipped theme is a single <code>theme.css</code> file. Grab one, place it in your
        project, and link to it — the file emits <code>:root</code> as well as its own{" "}
        <code>[data-theme]</code> selector, so it takes effect with no markup change. This path also
        works for any custom theme you self-host.
      </p>
      <p>
        24 files ship, in eight families of three: the base name auto-switches light and dark via{" "}
        <code>light-dark()</code>, while <code>-light</code> and <code>-dark</code> pin a single
        mode. (Terminal is the exception — <code>terminal</code> is dark-only by design and{" "}
        <code>terminal-light</code> is a separate daylight identity.)
      </p>
      <ul>
        <li>
          <a href={asset("/themes/boilerplate/theme.css")} download>boilerplate</a> &mdash; neutral starter, system fonts, clean blue accent
          {" ("}<a href={asset("/themes/boilerplate-light/theme.css")} download>light</a>{" · "}<a href={asset("/themes/boilerplate-dark/theme.css")} download>dark</a>{")"}
        </li>
        <li>
          <a href={asset("/themes/sketchbook/theme.css")} download>sketchbook</a> &mdash; warm paper, sumi ink, indigo accent (brand default)
          {" ("}<a href={asset("/themes/sketchbook-light/theme.css")} download>light</a>{" · "}<a href={asset("/themes/sketchbook-dark/theme.css")} download>dark</a>{")"}
        </li>
        <li>
          <a href={asset("/themes/press/theme.css")} download>press</a> &mdash; editorial newsprint, Playfair serif
          {" ("}<a href={asset("/themes/press-light/theme.css")} download>light</a>{" · "}<a href={asset("/themes/press-dark/theme.css")} download>dark</a>{")"}
        </li>
        <li>
          <a href={asset("/themes/prism/theme.css")} download>prism</a> &mdash; Vercel/Linear/Radix aesthetic, refined blue
          {" ("}<a href={asset("/themes/prism-light/theme.css")} download>light</a>{" · "}<a href={asset("/themes/prism-dark/theme.css")} download>dark</a>{")"}
        </li>
        <li>
          <a href={asset("/themes/cupertino/theme.css")} download>cupertino</a> &mdash; macOS AppKit, SF Pro, system blue
          {" ("}<a href={asset("/themes/cupertino-light/theme.css")} download>light</a>{" · "}<a href={asset("/themes/cupertino-dark/theme.css")} download>dark</a>{")"}
        </li>
        <li>
          <a href={asset("/themes/glass/theme.css")} download>glass</a> &mdash; visionOS glassmorphism, iOS indigo
          {" ("}<a href={asset("/themes/glass-light/theme.css")} download>light</a>{" · "}<a href={asset("/themes/glass-dark/theme.css")} download>dark</a>{")"}
        </li>
        <li>
          <a href={asset("/themes/graphite/theme.css")} download>graphite</a> &mdash; brushed silver / machined dark aluminum
          {" ("}<a href={asset("/themes/graphite-light/theme.css")} download>light</a>{" · "}<a href={asset("/themes/graphite-dark/theme.css")} download>dark</a>{")"}
        </li>
        <li>
          <a href={asset("/themes/terminal/theme.css")} download>terminal</a> &mdash; VT100 phosphor green, dark-only
          {" ("}<a href={asset("/themes/terminal-light/theme.css")} download>terminal-light</a>{" · "}<a href={asset("/themes/terminal-dark/theme.css")} download>terminal-dark</a>{")"}
        </li>
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
