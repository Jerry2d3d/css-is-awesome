import type { Metadata } from "next";
import Link from "next/link";
import { getRecipe } from "@/lib/recipes";
import demo from "./demo.module.scss";

export const metadata: Metadata = {
  title: "RTL — css-is-awesome",
  description:
    "cia's right-to-left support: what mirrors for free from logical properties, what needs an explicit dir=\"rtl\" override, and a live LTR/RTL demo of the components this epic's audit touched.",
};

export default function DocsRtlPage() {
  const recipe = getRecipe("rtl-layout");

  return (
    <>
      <h1>RTL</h1>
      <p className="lead">
        cia has used CSS logical properties since v0.7, so most layout
        mirrors the moment you set <code>dir=&quot;rtl&quot;</code> — no RTL
        variant classes, no per-component prop. The source is audited on
        every PR (<code>scripts/audit-logical-properties.mjs</code>) so that
        stays true. A few things — <code>background-position</code>,{" "}
        <code>transform</code> — have no logical-property equivalent and get
        an explicit <code>[dir=&quot;rtl&quot;]</code> override instead; this
        page shows exactly which.
      </p>

      <h2 id="demo">Live demo</h2>
      <p>
        The same four components, same markup, same mixins — one panel{" "}
        <code>dir=&quot;ltr&quot;</code>, one <code>dir=&quot;rtl&quot;</code>.
        These are the exact components the audit touched: the breadcrumb
        separator, the avatar-stack overlap, a select&rsquo;s dropdown
        chevron, and a switch&rsquo;s knob + slide direction.
      </p>

      <div className={demo.stage}>
        <div className={demo.panel} dir="ltr">
          <p className={demo.panelLabel}>dir=&quot;ltr&quot;</p>

          <div className={demo.row}>
            <nav className={demo.breadcrumb} aria-label="Breadcrumb (LTR)">
              <a href="#demo">Docs</a>
              <a href="#demo">Patterns</a>
              <a href="#demo" aria-current="page">RTL</a>
            </nav>
          </div>

          <div className={demo.row}>
            <div className={demo.avatarGroup}>
              <span className={demo.avatar} style={{ background: "var(--action-primary-default)" }} />
              <span className={demo.avatar} style={{ background: "var(--brand-primary)" }} />
              <span className={demo.avatar} style={{ background: "var(--shu)" }} />
            </div>
          </div>

          <div className={demo.row}>
            <select className={demo.select} defaultValue="cairo" aria-label="City (LTR)">
              <option value="cairo">Cairo</option>
              <option value="beirut">Beirut</option>
              <option value="amman">Amman</option>
            </select>
          </div>

          <div className={demo.row}>
            <input type="checkbox" className={demo.switch} defaultChecked aria-label="Notifications (LTR)" />
          </div>
        </div>

        <div className={demo.panel} dir="rtl">
          <p className={demo.panelLabel}>dir=&quot;rtl&quot;</p>

          <div className={demo.row}>
            <nav className={demo.breadcrumb} aria-label="مسار التنقل" lang="ar">
              <a href="#demo">المستندات</a>
              <a href="#demo">الأنماط</a>
              <a href="#demo" aria-current="page">RTL</a>
            </nav>
          </div>

          <div className={demo.row}>
            <div className={demo.avatarGroup}>
              <span className={demo.avatar} style={{ background: "var(--action-primary-default)" }} />
              <span className={demo.avatar} style={{ background: "var(--brand-primary)" }} />
              <span className={demo.avatar} style={{ background: "var(--shu)" }} />
            </div>
          </div>

          <div className={demo.row}>
            <select className={demo.select} defaultValue="cairo" aria-label="المدينة" lang="ar">
              <option value="cairo">القاهرة</option>
              <option value="beirut">بيروت</option>
              <option value="amman">عمّان</option>
            </select>
          </div>

          <div className={demo.row}>
            <input type="checkbox" className={demo.switch} defaultChecked aria-label="الإشعارات" lang="ar" />
          </div>
        </div>
      </div>
      <p>
        Notice: the breadcrumb separators and avatar overlap flip sides on
        their own (logical properties). The select&rsquo;s chevron and the
        switch&rsquo;s knob/slide direction flip too — those needed the
        explicit <code>[dir=&quot;rtl&quot;]</code> overrides described below.
      </p>

      <h2 id="recipe">The recipe</h2>
      {recipe && (
        <div className="recipe-body" dangerouslySetInnerHTML={{ __html: recipe.html }} />
      )}
      <p>
        Also at <Link href="/docs/recipes/rtl-layout">/docs/recipes/rtl-layout</Link>.
      </p>
    </>
  );
}
