import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { getPost, getPostSlugs } from "@/lib/blog";
import styles from "./page.module.scss";

// One static page per `.md` in src/content/blog. New posts appear by dropping
// a file in — no route edits, same contract as /docs/recipes/[slug].
export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: `${post.title} — Blog — css-is-awesome`,
    description: post.excerpt,
  };
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const published = formatDate(post.publishDate);
  const updated =
    post.updatedDate && post.updatedDate !== post.publishDate
      ? formatDate(post.updatedDate)
      : null;

  return (
    <>
      <SiteHeader current="blog" />
      <main className={styles.shell}>
        <p className={styles.back}>
          <Link href="/blog">← All posts</Link>
        </p>

        <article>
          <header className={styles.head}>
            {post.category && <p className={styles.eyebrow}>{post.category}</p>}
            <h1>{post.title}</h1>
            {post.excerpt && <p className={styles.excerpt}>{post.excerpt}</p>}

            <p className={styles.meta}>
              <span>{post.author}</span>
              {published && (
                <>
                  {" · "}
                  <time dateTime={post.publishDate ?? undefined}>{published}</time>
                </>
              )}
              {post.readingTime && <>{" · "}{post.readingTime}</>}
            </p>

            {updated && (
              <p className={styles.updated}>
                Updated{" "}
                <time dateTime={post.updatedDate ?? undefined}>{updated}</time>
              </p>
            )}

            {post.tags.length > 0 && (
              <ul className={styles.tags}>
                {post.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
          </header>

          {/* Markdown is rendered at build time in a Server Component, so the
              parser never reaches the browser — zero client JS. */}
          <div
            className={`${styles.body} recipe-body`}
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        </article>

        <p className={styles.back}>
          <Link href="/blog">← All posts</Link>
        </p>
      </main>
    </>
  );
}
