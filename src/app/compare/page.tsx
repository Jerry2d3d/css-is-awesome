import styles from "./page.module.scss";
import SiteHeader from "@/components/SiteHeader";
import Seal from "@/components/Seal";

type Row = {
  feature: string;
  cia: string | boolean;
  tailwind: string | boolean;
  bootstrap: string | boolean;
  note?: string;
};

const ROWS: Row[] = [
  { feature: "Installation",       cia: "1 <link> tag", tailwind: "Build step required", bootstrap: "1 <link> tag" },
  { feature: "JavaScript shipped in package", cia: "0 KB", tailwind: "0 KB (CSS-only)", bootstrap: "~25 KB (modals, dropdowns, tabs)", note: "cia npm package contains zero .js/.mjs files. JS-driven features ship as separate add-on packages." },
  { feature: "Gzipped core (tokens + resets)",  cia: "2.7 KB",       tailwind: "~10 KB (utilities JIT)", bootstrap: "~25 KB" },
  { feature: "Tokens-only bundle",  cia: "2.3 KB",     tailwind: "n/a",                     bootstrap: "n/a",                note: "scss/tokens.scss compiles to a 2.3 KB :root-vars-only file. Useful for consumers who want cia tokens with their own opinions about everything else." },
  { feature: "Full bundle gzipped", cia: "8.2 KB",      tailwind: "varies (JIT)",            bootstrap: "~29 KB CSS + 25 KB JS" },
  { feature: "Mixin API",          cia: "primary API",  tailwind: false,                     bootstrap: "available",          note: "cia is mixin-first; classes are an opt-in convenience layer. Tailwind rejects mixins on philosophy." },
  { feature: "Utility classes",    cia: "opt-in",       tailwind: true,                      bootstrap: true,                note: "cia utilities default to off — Sass consumers add `@use ... with ($utilities: true)` to opt in. Pre-built dist file still ships every utility for CDN consumers." },
  { feature: "Zero-JS interactive components", cia: "6 (Accordion · Modal · Tooltip · Dropdown · Tabs · CopyButton)", tailwind: "0 (need Headless UI)", bootstrap: false, note: "cia ships native-primitive components — <details name>, <dialog>, [popover], radio+:has(). Browser handles state, no JS." },
  { feature: "Runtime theming (swap one file)", cia: true, tailwind: false, bootstrap: false, note: "Only cia lets you swap the entire visual identity by replacing one CSS file at runtime" },
  { feature: "Pair two brands by mode (light=A, dark=B)", cia: "2 <link> tags", tailwind: false, bootstrap: false, note: "Native <link media> trick. No mainstream design system has this. See /docs/themes/pairing." },
  { feature: "Theme files shipped",cia: "9 themes (one file each, light+dark inside)", tailwind: "0 (config only)", bootstrap: "2 (light / dark)" },
  { feature: "In-browser theme editor",          cia: "live preview + downloadable theme.css", tailwind: false, bootstrap: false, note: "Edit any of the 123 tokens with color pickers / sliders / inputs, see every component reskin live, download a contract-conformant theme.css. Visit /themes." },
  { feature: "Typed theme contract + validator", cia: "123 tokens · CI gate",      tailwind: "untyped config",      bootstrap: false, note: "scripts/theme-validator.js fails the build if any theme misses a contract token. No equivalent in Tailwind or Bootstrap." },
  { feature: "Theme-driven animations",          cia: "reads --duration-* / --ease per theme", tailwind: "fixed timing utilities", bootstrap: "fixed timing utilities", note: "Same keyframes feel snappy under Terminal, floaty under Glass — zero code change. See /docs/animation." },
  { feature: "Icon system",                      cia: "49-glyph core + drop-in + per-theme override", tailwind: false, bootstrap: "separate Bootstrap Icons package", note: "Lucide-vendored core pack at public/icons/core/. Drop a new SVG in to add it; declare a CSS var to override per theme." },
  { feature: "Requires a build step",            cia: false, tailwind: true,  bootstrap: false },
  { feature: "JavaScript dependency",            cia: false, tailwind: false, bootstrap: true, note: "Bootstrap's dropdowns, modals, tabs need bootstrap.js" },
  { feature: "Who picks the class names in your HTML", cia: "you do (mixin-first)", tailwind: "compose utility tokens", bootstrap: "BEM-style names baked in", note: "Under v0.8 mixin-first, cia consumers write their own selectors (.checkout-cta, .faq-item) and @include the mixin. Bootstrap ships BEM-style component classes (.btn-primary, .card-header). Tailwind stacks utility classes in markup. cia is the only one that doesn't dictate naming." },
  { feature: "Tree-shakeable",     cia: "opt-in core/utils bundles", tailwind: true, bootstrap: "sort of" },
  { feature: "React components shipped (docs site)", cia: "47", tailwind: "0 (utility-only)", bootstrap: "~30" },
  { feature: "Years of battle-testing", cia: "new", tailwind: "5+", bootstrap: "12+" },
  { feature: "GitHub stars",       cia: "handful",     tailwind: "80k+",                    bootstrap: "170k+" },
];

type Tier = {
  name: string;
  size: string;
  contains: string;
};

const BUNDLE_TIERS: Tier[] = [
  { name: "core",      size: "2.4 KB gzipped", contains: "Tokens (CSS custom properties) + resets. The minimum to use the system." },
  { name: "utilities", size: "11.5 KB gzipped", contains: "All cia-* utility classes (spacing, typography, layout, color, etc.)." },
  { name: "full",      size: "15.2 KB gzipped", contains: "Core + utilities + every component recipe in one file." },
];

function Cell({ v }: { v: string | boolean }) {
  if (v === true)  return <span className={`${styles.cell} ${styles.cellYes}`}>Yes</span>;
  if (v === false) return <span className={`${styles.cell} ${styles.cellNo}`}>No</span>;
  return <span className={styles.cell}>{v}</span>;
}

export default function ComparePage() {
  return (
    <>
      <SiteHeader current="compare" />
      <main className={styles.shell}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>honest comparison</p>
          <h1>css-is-awesome vs Tailwind vs Bootstrap</h1>
          <p className="lead">
            Three good tools. Different jobs. Here is where each one actually wins —
            and where cia is the only one that does the thing.
          </p>
        </section>

        <section className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Feature</th>
                <th>css-is-awesome</th>
                <th>Tailwind</th>
                <th>Bootstrap</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr key={i}>
                  <th scope="row">
                    {row.feature}
                    {row.note && <span className={styles.note}>{row.note}</span>}
                  </th>
                  <td><Cell v={row.cia} /></td>
                  <td><Cell v={row.tailwind} /></td>
                  <td><Cell v={row.bootstrap} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className={styles.tableWrap}>
          <h2 className={styles.subhead}>Bundle tiers</h2>
          <p className={styles.subleadCenter}>
            Pick the smallest tier that covers your needs. Tier choice is a
            <code> &lt;link&gt; </code>
            URL change — no rebuild.
          </p>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tier</th>
                <th>Size</th>
                <th>What you get</th>
              </tr>
            </thead>
            <tbody>
              {BUNDLE_TIERS.map((t) => (
                <tr key={t.name}>
                  <th scope="row"><code>{t.name}</code></th>
                  <td>{t.size}</td>
                  <td>{t.contains}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className={styles.verdict}>
          <h2>Where each one wins</h2>
          <div className={styles.verdictGrid}>
            <article>
              <h3>Pick Bootstrap if</h3>
              <p>You want prebuilt components with a decade of battle-testing, and you don&apos;t mind the weight.</p>
            </article>
            <article>
              <h3>Pick Tailwind if</h3>
              <p>You want maximum control via utility classes, you&apos;re fine with a build step, and a huge ecosystem matters.</p>
            </article>
            <article>
              <h3>Pick css-is-awesome if</h3>
              <p>You want a tiny, honest SCSS system with a mixin API, and you want to reskin your site by swapping one CSS file.</p>
              <p style={{ marginTop: "0.5rem" }}><Seal>The differentiator</Seal></p>
            </article>
          </div>
        </section>
      </main>
    </>
  );
}
