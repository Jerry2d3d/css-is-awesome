export default function DocsPage() {
  return (
    <>
      <header className="docs-header">
        <div className="docs-header__inner">
          <a className="docs-header__brand" href="/">
            <span className="logo--sm" aria-hidden="true">
              <span>CSS</span><span>IS</span><span>AWES</span>
            </span>
            CSS is Awesome
          </a>
          <nav className="docs-header__nav">
            <a href="/">Home</a>
            <a href="/docs" className="is-active">Docs</a>
            <a href="/examples">Examples</a>
            <a href="/blog">Blog</a>
            <a href="/about">About</a>
          </nav>
        </div>
      </header>

      <div className="docs-shell">
        <aside className="docs-sidebar" aria-label="Docs navigation">
          <h4>Getting started</h4>
          <ul>
            <li><a href="#introduction" className="is-active">Introduction</a></li>
            <li><a href="#install">Install</a></li>
            <li><a href="#tokens">Design tokens</a></li>
          </ul>
          <h4>Layout</h4>
          <ul>
            <li><a href="#grid">Grid</a></li>
            <li><a href="#overflow">Overflow</a></li>
          </ul>
          <h4>Components</h4>
          <ul>
            <li><a href="#buttons">Buttons</a></li>
            <li><a href="#cards">Cards</a></li>
            <li><a href="#nav">Navigation</a></li>
          </ul>
        </aside>

        <article className="docs-content">
          <h1 id="introduction">The sketchbook, documented.</h1>
          <p className="lead">Warm paper, sumi ink, and an indigo accent. Chunky serif display + handwritten script where it adds character. One stylesheet — one theme file — zero build step.</p>

          <h2 id="install">Install</h2>
          <p>Drop the stylesheets into your page. Theme first, then base — so the base can read the tokens.</p>
          <div className="example">
            <pre className="example__code"><span className="tok-com">{"<!-- in your <head> -->"}</span>
{"\n"}<span className="tok-sel">{"<link"}</span> <span className="tok-prop">rel</span>=<span className="tok-val">"stylesheet"</span> <span className="tok-prop">href</span>=<span className="tok-val">"theme.css"</span><span className="tok-sel">{">"}</span>
{"\n"}<span className="tok-sel">{"<link"}</span> <span className="tok-prop">rel</span>=<span className="tok-val">"stylesheet"</span> <span className="tok-prop">href</span>=<span className="tok-val">"styles.css"</span><span className="tok-sel">{">"}</span></pre>
          </div>

          <h2 id="tokens">Design tokens</h2>
          <p>Every visual decision lives in <code>theme.css</code>. Replace that file and the entire system reskins. The base stylesheet never hard-codes a color.</p>
          <div className="example">
            <pre className="example__code"><span className="tok-com">{"/* theme.css */"}</span>
{"\n"}<span className="tok-sel">:root</span> {"{"}
{"\n"}  <span className="tok-prop">--paper</span>:         <span className="tok-val">#F7F3EA</span>;
{"\n"}  <span className="tok-prop">--ink</span>:           <span className="tok-val">#2A241E</span>;
{"\n"}  <span className="tok-prop">--ai</span>:            <span className="tok-val">#1F3A5F</span>;   <span className="tok-com">{"/* indigo accent */"}</span>
{"\n"}  <span className="tok-prop">--shu</span>:           <span className="tok-val">#C1272D</span>;   <span className="tok-com">{"/* vermilion seal */"}</span>
{"\n"}  <span className="tok-prop">--font-display</span>: <span className="tok-val">'DM Serif Display'</span>;
{"\n"}  <span className="tok-prop">--font-script</span>:  <span className="tok-val">'Caveat'</span>;       <span className="tok-com">{"/* hand-written accents */"}</span>
{"\n"}{"}"}</pre>
          </div>

          <h2 id="grid">Grid</h2>
          <p>The logo is the reference implementation — a three-row grid in a fixed square. Visible pencil construction lines frame the process.</p>
          <div className="example">
            <div className="example__preview" style={{ display: "flex", justifyContent: "center" }}>
              <div className="logo-stage">
                <div className="logo" style={{ ["--logo-size" as string]: "200px" } as React.CSSProperties}>
                  <span>CSS</span><span>IS</span><span className="overflow">AWESOME</span>
                </div>
                <span className="logo-stage__caption" aria-hidden="true">draft 01</span>
              </div>
            </div>
            <pre className="example__code"><span className="tok-sel">.logo</span> {"{"}
{"\n"}  <span className="tok-prop">display</span>: <span className="tok-val">grid</span>;
{"\n"}  <span className="tok-prop">grid-template-rows</span>: <span className="tok-val">1fr 1fr 1fr</span>;
{"\n"}  <span className="tok-prop">aspect-ratio</span>: <span className="tok-val">1 / 1</span>;
{"\n"}  <span className="tok-prop">border</span>: <span className="tok-val">2px solid var(--ink)</span>;
{"\n"}  <span className="tok-prop">overflow</span>: <span className="tok-val">visible</span>;  <span className="tok-com">{"/* the whole point */"}</span>
{"\n"}{"}"}</pre>
          </div>

          <h3 id="overflow">On purpose</h3>
          <p>Most design hides imperfection. This one frames it — the "draft 01" caption is a feature, not an afterthought.</p>
          <div className="example">
            <div className="example__preview">
              <div className="grid-demo">
                <div>One</div><div>Two</div><div>Three</div>
              </div>
            </div>
          </div>

          <h2 id="buttons">Buttons</h2>
          <p>Three variants: primary, outline, ghost. Warm paper base, ink on hover.</p>
          <div className="example">
            <div className="example__preview" style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button className="btn btn--primary">Primary</button>
              <button className="btn btn--outline">Outline</button>
              <button className="btn btn--ghost">Ghost</button>
              <span className="seal">Approved</span>
            </div>
          </div>

          <h2 id="cards">Cards</h2>
          <p>Soft-bordered paper slips. The display serif handles their titles.</p>
          <div className="example">
            <div className="example__preview" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "16px" }}>
              <div className="card"><h4>Hand-drawn</h4><p>Script accents on connector words add life.</p></div>
              <div className="card"><h4>Warm</h4><p>Paper texture under every surface.</p></div>
              <div className="card"><h4>Honest</h4><p>Overflow stays visible. So do the construction lines.</p></div>
            </div>
          </div>

          <h2 id="nav">Navigation</h2>
          <p>A brush-underline active state — drawn, not boxed.</p>
          <div className="example">
            <div className="example__preview" style={{ display: "flex", justifyContent: "center" }}>
              <nav className="main-nav">
                <a href="#" className="is-active">Home</a>
                <a href="#">Docs</a>
                <a href="#">Examples</a>
              </nav>
            </div>
          </div>
        </article>

        <nav className="docs-toc" aria-label="On this page">
          <h5>on this page</h5>
          <ul>
            <li><a href="#introduction">Introduction</a></li>
            <li><a href="#install">Install</a></li>
            <li><a href="#tokens">Tokens</a></li>
            <li><a href="#grid">Grid</a></li>
            <li><a href="#buttons">Buttons</a></li>
            <li><a href="#cards">Cards</a></li>
            <li><a href="#nav">Navigation</a></li>
          </ul>
        </nav>
      </div>
    </>
  );
}
