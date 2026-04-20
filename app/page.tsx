export default function Home() {
  return (
    <>
      <div className="draft-stamp" aria-hidden="true">v0.1 · Draft</div>

      <main className="landing">
        <div className="landing__inner">
          <div className="landing__wordmark">
            <h1 className="landing__display">CSS is <em>Awesome</em></h1>
            <div className="landing__sub">
              <span>— a tiny design system —</span>
            </div>
          </div>

          <div className="logo-stage">
            <div className="logo" aria-label="CSS is Awesome">
              <span>CSS</span>
              <span>IS</span>
              <span className="overflow">AWESOME</span>
            </div>
            <span className="logo-stage__caption" aria-hidden="true">overflow intentional</span>
          </div>

          <nav className="main-nav" aria-label="Primary">
            <a href="index.html" className="is-active">Home</a>
            <a href="docs.html">Docs</a>
            <a href="examples.html">Examples</a>
            <a href="blog.html">Blog</a>
            <a href="about.html">About</a>
          </nav>

          <p className="landing__tagline">Tokens, mixins, and one very honest joke. Tiny enough to read in an afternoon. Flexible enough to skin however you like.</p>

          <div className="landing__stats">
            <span className="stat-chip"><strong>5</strong> themes</span>
            <span className="stat-chip"><strong>800+</strong> LOC mixin API</span>
            <span className="stat-chip"><strong>0</strong> runtime deps</span>
          </div>
        </div>

        <section className="manifesto" aria-label="Why this exists">
          <p className="manifesto__eyebrow">— why this exists —</p>
          <h2 className="manifesto__statement">
            Every design system I tried was <em>buggy</em>.<br />
            Painful to update. <em>Slow</em> to fix.
          </h2>
          <p className="manifesto__body">
            This one isn't. It's small enough to read in an afternoon, fast enough to update in a minute, and honest about what it does.
          </p>
          <p className="manifesto__signoff">— that's the whole pitch.</p>
        </section>

        <footer className="landing__footer">
          built with <code>display: grid</code> — drawn by hand
        </footer>
      </main>
    </>
  );
}
