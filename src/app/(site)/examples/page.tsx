import styles from "./page.module.scss";
import Example from "@/components/Example";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Seal from "@/components/Seal";
import LogoMark from "@/components/LogoMark";

export default function ExamplesPage() {
  return (
    <>

      <div className={styles.shell}>
        <article className="docs-content">
          <h1>Examples</h1>
          <p className="lead">Small pages built with the system. Copy, fork, break, rebuild.</p>

          <h2>Marketing hero</h2>
          <Example>
            <Example.Preview style={{ textAlign: "center", padding: "56px 24px" }}>
              <div style={{ fontFamily: "var(--font-script)", fontSize: "1.5rem", color: "var(--ink-soft)", marginBottom: "6px" }}>a new way to ship</div>
              <h2 style={{ margin: "0 0 8px", border: 0, padding: 0, fontSize: "2.6rem", fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>Ship honest interfaces.</h2>
              <p style={{ color: "var(--ink-soft)", margin: "0 0 22px", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>A system that fits on one page and never lies about its limits.</p>
              <Button variant="primary">Get started</Button>
              <Button variant="ghost">Read docs</Button>
            </Example.Preview>
          </Example>

          <h2>Pricing</h2>
          <Example>
            <Example.Preview style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "16px" }}>
              <Card title="Free">All tokens. All components. $0 forever.</Card>
              <Card title="Also free" bodyAs="none" style={{ borderColor: "var(--ai)" }}>
                <p>Same thing, with an indigo edge.</p>
                <div style={{ marginTop: "12px" }}><Seal>Best fit</Seal></div>
              </Card>
              <Card title="Still free">It's a stylesheet. We couldn't charge if we tried.</Card>
            </Example.Preview>
          </Example>

          <h2>Form</h2>
          <Example>
            <Example.Preview>
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
                  <Button variant="primary">Send</Button>
                  <Button variant="ghost">Cancel</Button>
                </div>
              </form>
            </Example.Preview>
          </Example>

          <h2>Dropdown</h2>
          <p>
            The house dropdown: the trigger fills its column, label left, affordance right; the
            menu opens one pixel under it at the trigger&apos;s exact width via CSS anchor
            positioning, flipping above when the bottom of the screen is close. Engines without
            anchors fall back to viewport-minus-gutters.
          </p>
          <Example>
            <Example.Preview>
              <div style={{ maxWidth: "320px", margin: "0 auto" }}>
                <button type="button" className={styles.menuTrigger} popoverTarget="examples-menu">
                  Overview <span aria-hidden="true">▾</span>
                </button>
                <div id="examples-menu" popover="auto" className={styles.menu}>
                  <a href="#" aria-current="page">Overview</a>
                  <a href="#">Projects</a>
                  <a href="#">Team</a>
                  <a href="#">Settings</a>
                </div>
              </div>
            </Example.Preview>
          </Example>

          <h2>Hamburger + drawer</h2>
          <p>
            Three bars, zero JS: the browser sets <code>aria-expanded</code> on the popover
            invoker and the bars morph into an X off that attribute. The drawer is honest too —
            it slides over the real end edge of your viewport, exactly as shipped.
          </p>
          <Example>
            <Example.Preview style={{ textAlign: "center" }}>
              <button type="button" className={styles.hamburger} popoverTarget="examples-drawer" aria-label="Menu">
                <span></span><span></span><span></span>
              </button>
              <nav id="examples-drawer" popover="auto" className={styles.drawer} aria-label="Site menu">
                <div>
                  <a href="#" aria-current="page">Home</a>
                  <a href="#">Docs</a>
                  <a href="#">Examples</a>
                  <a href="#">GitHub</a>
                </div>
              </nav>
            </Example.Preview>
          </Example>

          <h2>Footer</h2>
          <Example>
            <Example.Preview style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--ink-soft)", fontSize: "14px", fontFamily: "var(--font-serif)" }}>
                <LogoMark />
                &copy; 2026 CSS is Awesome
              </div>
              <nav style={{ display: "flex", gap: "16px", fontFamily: "var(--font-serif)", fontSize: "14px" }}>
                <a href="#">Docs</a><a href="#">Examples</a><a href="#">GitHub</a>
              </nav>
            </Example.Preview>
          </Example>
        </article>
      </div>
    </>
  );
}
