import styles from "./page.module.scss";
import Link from "next/link";
import DraftStamp from "@/components/DraftStamp";
import Logo from "@/components/Logo";
import StatChip from "@/components/StatChip";

export default function Home() {
  return (
    <>
      <DraftStamp>v0.8 · Mixin-first</DraftStamp>

      <main className={styles.landing}>
        <div className={styles.inner}>
          <Logo />

          <div className={styles.wordmark}>
            <h1 className={styles.display}>CSS is <em>Awesome</em></h1>
            <div className={styles.sub}>
              <span>— a tiny design system —</span>
            </div>
          </div>

          <nav className={styles.mainNav} aria-label="Primary">
            <Link href="/" className={styles.isActive}>Home</Link>
            <Link href="/docs">Docs</Link>
            <Link href="/examples">Examples</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/about">About</Link>
          </nav>

          <p className={styles.tagline}>Bring your own selectors. We bring the design system.</p>

          <div className={styles.stats}>
            <StatChip value="0 KB" label="runtime JS" />
            <StatChip value="9" label="themes" />
            <StatChip value="6" label="zero-JS components" />
            <StatChip value="8 KB" label="full bundle (gz)" />
          </div>
        </div>

        <section className={styles.moat} aria-label="The moat — same accordion, less ceremony">
          <p className={styles.moatEyebrow}>— same accordion, less ceremony —</p>
          <div className={styles.moatColumns}>
            <div className={styles.moatCol}>
              <header>
                <strong>cia</strong> · 12 LOC · 0 KB JS
              </header>
              <pre><code>{`<details name="faq" class="cia-accordion">
  <summary>Question</summary>
  <div>Answer</div>
</details>
<details name="faq" class="cia-accordion">
  <summary>Another?</summary>
  <div>Another.</div>
</details>`}</code></pre>
            </div>
            <div className={styles.moatCol}>
              <header>
                <strong>Tailwind + Headless UI</strong> · 70 LOC · 22 KB JS
              </header>
              <pre><code>{`import { Disclosure } from '@headlessui/react'

<div className="space-y-2">
  <Disclosure>
    <Disclosure.Button className="…">
      Question
    </Disclosure.Button>
    <Disclosure.Panel className="…">
      Answer
    </Disclosure.Panel>
  </Disclosure>
  {/* …another Disclosure, manual close-others state */}
</div>`}</code></pre>
            </div>
          </div>
          <p className={styles.moatNote}>
            Native <code>{`<details name="…">`}</code> auto-closes siblings. Browser does the work.
          </p>
        </section>

        <section className={styles.manifesto} aria-label="Why this exists">
          <p className={styles.manifestoEyebrow}>— why this exists —</p>
          <h2 className={styles.statement}>
            Every design system I tried was <em>buggy</em>.<br />
            Painful to update. <em>Slow</em> to fix.
          </h2>
          <p className={styles.body}>
            This one isn't. It's small enough to read in an afternoon, fast enough to update in a minute, and honest about what it does.
          </p>
          <p className={styles.signoff}>— that's the whole pitch.</p>
        </section>

        <footer className={styles.footer}>
          built with <code>display: grid</code> — drawn by hand
        </footer>
      </main>
    </>
  );
}
