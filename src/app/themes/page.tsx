"use client";
import Link from "next/link";
import styles from "./page.module.scss";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import Input from "@/components/Input";
import Card from "@/components/Card";
import Alert from "@/components/Alert";
import Avatar from "@/components/Avatar";
import Progress from "@/components/Progress";
import Switch from "@/components/Switch";
import Checkbox from "@/components/Checkbox";
import Radio from "@/components/Radio";
import Tabs from "@/components/Tabs";
import Tag from "@/components/Tag";
import Spinner from "@/components/Spinner";
import Skeleton from "@/components/Skeleton";
import ThemeEditorDock from "@/components/ThemeEditorDock";

const SECTIONS = [
  { id: "buttons",  label: "Button" },
  { id: "badges",   label: "Badge · Tag" },
  { id: "inputs",   label: "Input · Select" },
  { id: "choices",  label: "Checkbox · Radio · Switch" },
  { id: "alerts",   label: "Alert" },
  { id: "cards",    label: "Card" },
  { id: "tabs",     label: "Tabs" },
  { id: "avatars",  label: "Avatar" },
  { id: "progress", label: "Progress · Skeleton" },
];

export default function ThemesPage() {
  return (
    <>
      <SiteHeader current="themes" />
      <main className={styles.shell}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>live token editor</p>
          <h1>Theme editor</h1>
          <p className="lead">
            Every component below renders with the active theme&apos;s tokens.
            Tweak any token live with the editor in the bottom-right, then
            download a complete <code>theme.css</code>.
          </p>
        </section>

        <div className={styles.layout}>
          <aside className={styles.sidebar} aria-label="Components nav">
            <h5>Live components</h5>
            <ul>
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>{s.label}</a>
                </li>
              ))}
            </ul>
            <p className={styles.sidebarFoot}>
              Every component below renders with the active theme&apos;s tokens.
              Click <strong>Edit theme</strong> in the bottom-right to tweak.
            </p>
          </aside>

          <div className={styles.content}>

            <section id="buttons" className={styles.section}>
              <span className={styles.eyebrow}>Component</span>
              <h2>Button</h2>
              <p>Default, primary, outline, and ghost variants. Renders as <code>&lt;button&gt;</code> or <code>&lt;a&gt;</code> when <code>href</code> is set.</p>
              <div className={styles.preview}>
                <div className={styles.stage}>
                  <Button variant="primary">Primary</Button>
                  <Button variant="default">Default</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="primary" disabled>Disabled</Button>
                </div>
                <div className={styles.previewFoot}>
                  <code>&lt;Button variant=&quot;primary&quot;&gt;</code>
                </div>
              </div>
            </section>

            <section id="badges" className={styles.section}>
              <span className={styles.eyebrow}>Component</span>
              <h2>Badge &amp; Tag</h2>
              <p>Status indicators (Badge) and removable labels (Tag).</p>
              <div className={styles.preview}>
                <div className={styles.stage}>
                  <Badge>Default</Badge>
                  <Badge status="info">Info</Badge>
                  <Badge status="success" dot>Live</Badge>
                  <Badge status="warning" dot>Beta</Badge>
                  <Badge status="error" dot>Failed</Badge>
                  <Tag>label</Tag>
                  <Tag>removable</Tag>
                </div>
                <div className={styles.previewFoot}>
                  <code>&lt;Badge status=&quot;success&quot; dot&gt;</code>
                </div>
              </div>
            </section>

            <section id="inputs" className={styles.section}>
              <span className={styles.eyebrow}>Component</span>
              <h2>Input</h2>
              <p>Text fields with focus rings driven by <code>--ai</code> tokens.</p>
              <div className={styles.preview}>
                <div className={`${styles.stage} ${styles.stageCol}`}>
                  <Input placeholder="you@company.com" defaultValue="alex@company.com" />
                  <Input type="password" placeholder="••••••••" />
                  <Input type="search" placeholder="Search components" />
                  <Input disabled defaultValue="Read-only value" />
                  <Input invalid defaultValue="not-an-email" />
                </div>
                <div className={styles.previewFoot}>
                  <code>&lt;Input invalid /&gt;</code>
                </div>
              </div>
            </section>

            <section id="choices" className={styles.section}>
              <span className={styles.eyebrow}>Component</span>
              <h2>Checkbox · Radio · Switch</h2>
              <p>Form selections — multi, single-of-many, and instant toggle.</p>
              <div className={styles.preview}>
                <div className={`${styles.stage} ${styles.stageCol}`} style={{ gap: "0.75rem" }}>
                  <Checkbox label="Email me updates" defaultChecked />
                  <Checkbox label="Send weekly digest" />
                  <Radio name="plan" label="Monthly" defaultChecked />
                  <Radio name="plan" label="Annual" />
                  <Switch label="Notifications on" defaultChecked />
                  <Switch label="Beta features" />
                </div>
                <div className={styles.previewFoot}>
                  <code>&lt;Checkbox /&gt; &lt;Radio /&gt; &lt;Switch /&gt;</code>
                </div>
              </div>
            </section>

            <section id="alerts" className={styles.section}>
              <span className={styles.eyebrow}>Component</span>
              <h2>Alert</h2>
              <p>System messages — info, success, warning, error.</p>
              <div className={styles.preview}>
                <div className={`${styles.stage} ${styles.stageCol}`} style={{ gap: "0.75rem", alignItems: "stretch" }}>
                  <Alert status="info" title="Heads up." icon="i">A new minor version is available.</Alert>
                  <Alert status="success" title="Saved." icon="✓">Your preferences have been updated.</Alert>
                  <Alert status="warning" title="Trial ends in 3 days." icon="!">Add a payment method to continue.</Alert>
                  <Alert status="error" title="Couldn't process payment." icon="×">Card was declined.</Alert>
                </div>
                <div className={styles.previewFoot}>
                  <code>&lt;Alert status=&quot;error&quot; /&gt;</code>
                </div>
              </div>
            </section>

            <section id="cards" className={styles.section}>
              <span className={styles.eyebrow}>Component</span>
              <h2>Card</h2>
              <p>Containers for grouped content.</p>
              <div className={styles.preview}>
                <div className={`${styles.stage} ${styles.cardGrid}`}>
                  <Card title="Production deploy">
                    Deployed 3m ago by alex. All checks passed in 1m 42s.
                  </Card>
                  <Card title="Team members">
                    8 collaborators across 3 workspaces. Roles synced from SSO.
                  </Card>
                  <Card title="Storage used">
                    4.2 GB of 10 GB. Resets monthly on the 1st.
                  </Card>
                </div>
                <div className={styles.previewFoot}>
                  <code>&lt;Card title=&quot;…&quot;&gt;</code>
                </div>
              </div>
            </section>

            <section id="tabs" className={styles.section}>
              <span className={styles.eyebrow}>Component</span>
              <h2>Tabs</h2>
              <p>Roving-focus tabs with arrow-key navigation.</p>
              <div className={styles.preview}>
                <div className={styles.stage} style={{ alignItems: "stretch", width: "100%" }}>
                  <Tabs defaultValue="overview" style={{ width: "100%" }}>
                    <Tabs.List>
                      <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
                      <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
                      <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
                    </Tabs.List>
                    <Tabs.Panel value="overview">Overview content — high-level metrics and status.</Tabs.Panel>
                    <Tabs.Panel value="activity">Activity feed — recent commits, deploys, comments.</Tabs.Panel>
                    <Tabs.Panel value="settings">Project settings — name, visibility, integrations.</Tabs.Panel>
                  </Tabs>
                </div>
                <div className={styles.previewFoot}>
                  <code>&lt;Tabs.Trigger value=&quot;…&quot; /&gt;</code>
                </div>
              </div>
            </section>

            <section id="avatars" className={styles.section}>
              <span className={styles.eyebrow}>Component</span>
              <h2>Avatar</h2>
              <p>Initials by default; image when <code>src</code> is provided.</p>
              <div className={styles.preview}>
                <div className={styles.stage}>
                  <Avatar size="sm" name="Alex Kim" />
                  <Avatar size="md" name="Joelle Lee" />
                  <Avatar size="lg" name="Rina Patel" />
                  <Avatar size="xl" name="Devon Cho" />
                </div>
                <div className={styles.previewFoot}>
                  <code>&lt;Avatar name=&quot;…&quot; size=&quot;lg&quot; /&gt;</code>
                </div>
              </div>
            </section>

            <section id="progress" className={styles.section}>
              <span className={styles.eyebrow}>Component</span>
              <h2>Progress &amp; Skeleton</h2>
              <p>Loading affordances — determinate progress, indeterminate spinner, shimmer skeletons.</p>
              <div className={styles.preview}>
                <div className={`${styles.stage} ${styles.stageCol}`} style={{ gap: "1rem", alignItems: "stretch" }}>
                  <Progress value={68} label="Build progress" />
                  <Progress label="Verifying signature" />
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <Spinner />
                    <span>Processing…</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <Skeleton style={{ width: "60%", height: "1rem" }} />
                    <Skeleton style={{ width: "80%", height: "0.75rem" }} />
                    <Skeleton style={{ width: "40%", height: "0.75rem" }} />
                  </div>
                </div>
                <div className={styles.previewFoot}>
                  <code>&lt;Progress value=&#123;68&#125; /&gt;</code>
                </div>
              </div>
            </section>

          </div>
        </div>

        <p className={styles.galleryLink}>
          Want to see all eight theme families side by side?{" "}
          <Link href="/themes/gallery">Open the theme gallery →</Link>
        </p>
      </main>

      <ThemeEditorDock />
      {/* Interim: this route still lives outside the (site) shell (dev-server file locks block the move) - the shell provides the footer once it moves in; remove this then. */}
      <SiteFooter />
    </>
  );
}
