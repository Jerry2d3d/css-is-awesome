import styles from "./page.module.scss";
import SiteHeader from "@/components/SiteHeader";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Seal from "@/components/Seal";
import StatChip from "@/components/StatChip";
import Post from "@/components/Post";

export default function ShowcasePage() {
  return (
    <>
      <SiteHeader current="showcase" />
      <main className={styles.shell}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>what can I build with this?</p>
          <h1>Showcase</h1>
          <p className="lead">
            Every block below uses the same components. Change the theme
            in the bottom-right and watch the whole page re-skin. No code
            change — one CSS file.
          </p>
        </section>

        {/* A. Marketing hero */}
        <section className={styles.example}>
          <header className={styles.exampleHeader}>
            <h2>Marketing hero</h2>
            <p className={styles.exampleNote}>Big type, two CTAs, a &ldquo;new&rdquo; seal.</p>
          </header>
          <div className={styles.previewPaper}>
            <div className={styles.marketing}>
              <p className={styles.marketingEyebrow}>v1.0 shipping soon</p>
              <h3 className={styles.marketingTitle}>
                Build a design system,<br />not another framework.
              </h3>
              <p className={styles.marketingLead}>
                One SCSS file. Six themes. Zero runtime dependencies. Swap the
                look in a single <code>theme.css</code>.
              </p>
              <div className={styles.marketingActions}>
                <Button variant="primary" href="#">Get started</Button>
                <Button variant="ghost" href="#">Read the docs</Button>
              </div>
              <p style={{ marginTop: "1rem" }}><Seal>New · v0.5</Seal></p>
            </div>
          </div>
        </section>

        {/* B. Blog card */}
        <section className={styles.example}>
          <header className={styles.exampleHeader}>
            <h2>Blog post</h2>
            <p className={styles.exampleNote}>The Post component in isolation.</p>
          </header>
          <div className={styles.previewPaper}>
            <Post
              date="2026 · Apr 14"
              tag="Theme"
              title="One file, six voices."
              href="#"
              excerpt="Swap one stylesheet, the whole system re-skins. No build step."
            />
          </div>
        </section>

        {/* C. Dashboard */}
        <section className={styles.example}>
          <header className={styles.exampleHeader}>
            <h2>Dashboard tiles</h2>
            <p className={styles.exampleNote}>Three Cards with StatChips — responsive grid.</p>
          </header>
          <div className={styles.previewPaper}>
            <div className={styles.dashboard}>
              <Card title="Active users" bodyAs="none">
                <strong className={styles.big}>12,487</strong>
                <StatChip value="+4.2%" label="this week" />
              </Card>
              <Card title="Revenue" bodyAs="none">
                <strong className={styles.big}>$84.2k</strong>
                <StatChip value="+1.8%" label="MoM" />
              </Card>
              <Card title="Errors" bodyAs="none">
                <strong className={styles.big}>3</strong>
                <StatChip value="–62%" label="vs last week" />
              </Card>
            </div>
          </div>
        </section>

        {/* D. 404 */}
        <section className={styles.example}>
          <header className={styles.exampleHeader}>
            <h2>404</h2>
            <p className={styles.exampleNote}>A tiny, friendly not-found.</p>
          </header>
          <div className={`${styles.previewPaper} ${styles.paper404}`}>
            <p className={styles.fourOhFour}>404</p>
            <p className={styles.fourOhFourNote}>this page wandered off the grid</p>
            <div className={styles.fourOhFourActions}>
              <Button variant="primary" href="/">Take me home</Button>
              <Button variant="ghost" href="#">Report broken link</Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
