import "./page.scss";
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
  { feature: "Gzipped core size",  cia: "~2 KB",        tailwind: "~10 KB (utilities JIT)", bootstrap: "~25 KB" },
  { feature: "Full bundle gzipped",cia: "~10 KB",       tailwind: "varies (JIT)",            bootstrap: "~29 KB CSS + 25 KB JS" },
  { feature: "Mixin API",          cia: true,           tailwind: false,                     bootstrap: true,                note: "Tailwind rejects mixins on philosophy" },
  { feature: "Utility classes",    cia: true,           tailwind: true,                      bootstrap: true,                note: "All three ship utility class sets" },
  { feature: "Runtime theming (swap one file)", cia: true, tailwind: false, bootstrap: false, note: "Only cia lets you swap the entire visual identity by replacing one CSS file at runtime" },
  { feature: "Theme files shipped",cia: "6",            tailwind: "0 (config only)",         bootstrap: "2 (light / dark)" },
  { feature: "Requires a build step",            cia: false, tailwind: true,  bootstrap: false },
  { feature: "JavaScript dependency",            cia: false, tailwind: false, bootstrap: true, note: "Bootstrap's dropdowns, modals, tabs need bootstrap.js" },
  { feature: "Readable class names in your HTML",cia: true,  tailwind: "debatable", bootstrap: true, note: "cia and Bootstrap use semantic BEM-style; Tailwind stacks utilities" },
  { feature: "Tree-shakeable",     cia: "opt-in core/utils bundles", tailwind: true, bootstrap: "sort of" },
  { feature: "Component count",    cia: "~12 atoms + ~8 molecules", tailwind: "0 (utility-only)", bootstrap: "~30" },
  { feature: "Years of battle-testing", cia: "new", tailwind: "5+", bootstrap: "12+" },
  { feature: "GitHub stars",       cia: "handful",     tailwind: "80k+",                    bootstrap: "170k+" },
];

function Cell({ v }: { v: string | boolean }) {
  if (v === true)  return <span className="cmp-cell cmp-cell--yes">Yes</span>;
  if (v === false) return <span className="cmp-cell cmp-cell--no">No</span>;
  return <span className="cmp-cell">{v}</span>;
}

export default function ComparePage() {
  return (
    <>
      <SiteHeader current="compare" />
      <main className="compare-shell">
        <section className="compare-hero">
          <p className="compare-hero__eyebrow">honest comparison</p>
          <h1>css-is-awesome vs Tailwind vs Bootstrap</h1>
          <p className="lead">
            Three good tools. Different jobs. Here is where each one actually wins —
            and where cia is the only one that does the thing.
          </p>
        </section>

        <section className="compare-table-wrap">
          <table className="compare-table">
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
                    {row.note && <span className="compare-note">{row.note}</span>}
                  </th>
                  <td><Cell v={row.cia} /></td>
                  <td><Cell v={row.tailwind} /></td>
                  <td><Cell v={row.bootstrap} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="compare-verdict">
          <h2>Where each one wins</h2>
          <div className="compare-verdict__grid">
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
