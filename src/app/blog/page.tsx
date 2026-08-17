import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { getPostIndex } from "@/lib/blog";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Blog — css-is-awesome",
  description:
    "Notes from building a mixin-first SCSS design system — decisions, dead ends, and the occasional post-mortem.",
};

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function BlogPage() {
  // Read from src/content/blog at build time. Previously this array was seven
  // hardcoded stubs with href="#" — every one of them a dead link.
  const posts = getPostIndex();

  return (
    <>
      <SiteHeader current="blog" />

      <main className={styles.shell}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>the sketchbook</p>
          <h1>Notes from the margins.</h1>
          <p>
            Decisions, dead ends, and the occasional post-mortem from building
            the system. New posts when there&apos;s something worth saying.
          </p>
        </section>

        {posts.length === 0 ? (
          <p className={styles.empty}>No posts yet.</p>
        ) : (
          <section className={styles.postList}>
            {posts.map((p) => {
              const published = formatDate(p.publishDate);
              return (
                <article key={p.slug} className={styles.card}>
                  <p className={styles.cardMeta}>
                    {p.category && <span className={styles.cat}>{p.category}</span>}
                    {published && (
                      <time dateTime={p.publishDate ?? undefined}>{published}</time>
                    )}
                    {p.readingTime && <span>{p.readingTime}</span>}
                  </p>

                  <h2 className={styles.cardTitle}>
                    <Link href={`/blog/${p.slug}`}>{p.title}</Link>
                  </h2>

                  {p.excerpt && <p className={styles.cardExcerpt}>{p.excerpt}</p>}

                  {p.tags.length > 0 && (
                    <ul className={styles.tags}>
                      {p.tags.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  )}
                </article>
              );
            })}
          </section>
        )}
      </main>
    </>
  );
}
