import "./page.scss";
import Link from "next/link";
import DraftStamp from "@/components/DraftStamp";
import Logo from "@/components/Logo";
import StatChip from "@/components/StatChip";

export default function Home() {
  return (
    <>
      <DraftStamp>v0.1 · Draft</DraftStamp>

      <main className="landing">
        <div className="landing__inner">
          <div className="landing__wordmark">
            <h1 className="landing__display">CSS is <em>Awesome</em></h1>
            <div className="landing__sub">
              <span>— a tiny design system —</span>
            </div>
          </div>

          <Logo />

          <nav className="main-nav" aria-label="Primary">
            <Link href="/" className="is-active">Home</Link>
            <Link href="/docs">Docs</Link>
            <Link href="/examples">Examples</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/about">About</Link>
          </nav>

          <p className="landing__tagline">Tokens, mixins, and one very honest joke. Tiny enough to read in an afternoon. Flexible enough to skin however you like.</p>

          <div className="landing__stats">
            <StatChip value="5" label="themes" />
            <StatChip value="800+" label="LOC mixin API" />
            <StatChip value="0" label="runtime deps" />
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
