import Link from "next/link";
import Badge from "@/components/Badge";
import Tabs from "@/components/Tabs";
import styles from "./ComponentDoc.module.scss";
import type { DocEntry } from "./types";

/**
 * The component-doc template — written ONCE, fed a DocEntry. The article
 * is a control-dense region, so per the doctrine it is its own named-area
 * grid (header / demo / usage / tabs / footer) whose gap carries ALL
 * vertical rhythm; no child brings rhythm margins of its own.
 */
export default function ComponentDoc({ entry }: { entry: DocEntry }) {
  return (
    <article className={styles.doc}>
      <header className={styles.header}>
        <p className={styles.category}>{entry.category}</p>
        <h1>{entry.name}</h1>
        <p className="lead">{entry.oneLiner}</p>
        <p className={styles.badges}>
          {entry.badges.map((b) => (
            <Badge key={b}>{b}</Badge>
          ))}
        </p>
      </header>

      <section className={styles.demo} aria-label="Live demo">
        {entry.demo}
      </section>

      <section className={styles.usage} aria-label="Usage">
        <h2 id="usage">Usage</h2>
        {entry.usage}
      </section>

      <section className={styles.tabs} aria-label="Reference">
        <Tabs defaultValue={entry.tabs[0]?.label}>
          <Tabs.List>
            {entry.tabs.map((t) => (
              <Tabs.Trigger key={t.label} value={t.label}>
                {t.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          {entry.tabs.map((t) => (
            <Tabs.Panel key={t.label} value={t.label}>
              {t.content}
            </Tabs.Panel>
          ))}
        </Tabs>
      </section>

      <footer className={styles.footer}>
        {entry.footerLinks.map((l) =>
          l.href.startsWith("/") ? (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ) : (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ),
        )}
      </footer>
    </article>
  );
}
