export default function ExamplesPage() {
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
            <a href="/docs">Docs</a>
            <a href="/examples" className="is-active">Examples</a>
            <a href="/blog">Blog</a>
            <a href="/about">About</a>
          </nav>
        </div>
      </header>

      <div className="docs-shell" style={{ gridTemplateColumns: "1fr", maxWidth: "900px" }}>
        <article className="docs-content">
          <h1>Examples</h1>
          <p className="lead">Small pages built with the system. Copy, fork, break, rebuild.</p>

          <h2>Marketing hero</h2>
          <div className="example">
            <div className="example__preview" style={{ textAlign: "center", padding: "56px 24px" }}>
              <div style={{ fontFamily: "var(--font-script)", fontSize: "1.5rem", color: "var(--ink-soft)", marginBottom: "6px" }}>a new way to ship</div>
              <h2 style={{ margin: "0 0 8px", border: 0, padding: 0, fontSize: "2.6rem", fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>Ship honest interfaces.</h2>
              <p style={{ color: "var(--ink-soft)", margin: "0 0 22px", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>A system that fits on one page and never lies about its limits.</p>
              <button className="btn btn--primary">Get started</button>
              <button className="btn btn--ghost">Read docs</button>
            </div>
          </div>

          <h2>Pricing</h2>
          <div className="example">
            <div className="example__preview" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "16px" }}>
              <div className="card"><h4>Free</h4><p>All tokens. All components. $0 forever.</p></div>
              <div className="card" style={{ borderColor: "var(--ai)" }}>
                <h4>Also free</h4>
                <p>Same thing, with an indigo edge.</p>
                <div style={{ marginTop: "12px" }}><span className="seal">Best fit</span></div>
              </div>
              <div className="card"><h4>Still free</h4><p>It's a stylesheet. We couldn't charge if we tried.</p></div>
            </div>
          </div>

          <h2>Form</h2>
          <div className="example">
            <div className="example__preview">
              <form style={{ display: "grid", gap: "14px", maxWidth: "380px" }}>
                <label style={{ fontFamily: "var(--font-serif)", fontSize: "0.95rem", color: "var(--ink)", fontStyle: "italic" }}>
                  Email
                  <input type="email" placeholder="you@example.com"
                    style={{ display: "block", width: "100%", marginTop: "6px" }} />
                </label>
                <label style={{ fontFamily: "var(--font-serif)", fontSize: "0.95rem", color: "var(--ink)", fontStyle: "italic" }}>
                  Message
                  <textarea rows={3} placeholder="Tell us about CSS."
                    style={{ display: "block", width: "100%", marginTop: "6px", resize: "vertical" }}></textarea>
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button type="button" className="btn btn--primary">Send</button>
                  <button type="button" className="btn btn--ghost">Cancel</button>
                </div>
              </form>
            </div>
          </div>

          <h2>Footer</h2>
          <div className="example">
            <div className="example__preview" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--ink-soft)", fontSize: "14px", fontFamily: "var(--font-serif)" }}>
                <span className="logo--sm"><span>CSS</span><span>IS</span><span>AWES</span></span>
                &copy; 2026 CSS is Awesome
              </div>
              <nav style={{ display: "flex", gap: "16px", fontFamily: "var(--font-serif)", fontSize: "14px" }}>
                <a href="#">Docs</a><a href="#">Examples</a><a href="#">GitHub</a>
              </nav>
            </div>
          </div>
        </article>
      </div>
    </>
  );
}
