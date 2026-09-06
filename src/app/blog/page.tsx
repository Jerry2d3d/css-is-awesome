import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getPostIndex, trackFor, type PostMeta } from "@/lib/blog";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Blog — css-is-awesome",
  description:
    "Notes from building a mixin-first SCSS design system — decisions, dead ends, and the occasional post-mortem.",
  alternates: {
    // Absolute on purpose: the feed URL must survive the GitHub Pages
    // basePath build unchanged, and metadataBase isn't set site-wide.
    types: {
      "application/atom+xml": [
        { url: "https://cssisawesome.com/feed.xml", title: "css-is-awesome blog" },
      ],
    },
  },
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

function PostCard({ post }: { post: PostMeta }) {
  const published = formatDate(post.publishDate);
  return (
    <article className={styles.card}>
      <p className={styles.cardMeta}>
        {post.category && <span className={styles.cat}>{post.category}</span>}
        {published && (
          <time dateTime={post.publishDate ?? undefined}>{published}</time>
        )}
        {post.readingTime && <span>{post.readingTime}</span>}
      </p>

      <h3 className={styles.cardTitle}>
        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
      </h3>

      {post.excerpt && <p className={styles.cardExcerpt}>{post.excerpt}</p>}

      {post.tags.length > 0 && (
        <ul className={styles.tags}>
          {post.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      )}
    </article>
  );
}

export default function BlogPage() {
  // Read from src/content/blog at build time. Previously this array was seven
  // hardcoded stubs with href="#" — every one of them a dead link.
  const posts = getPostIndex();
  // Two tracks, grouped statically — no client state, zero JS added (EPIC-06
  // B6.1). Anything that isn't literally `discovery` is Track A.
  const engineering = posts.filter((p) => trackFor(p.category) === "engineering");
  const discovery = posts.filter((p) => trackFor(p.category) === "discovery");

  return (
    <>
      <SiteHeader current="blog" />

      <main className={styles.shell}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>the sketchbook</p>
          <h1>Notes from the margins.</h1>
          <p>
            Two drawers: how the system gets built, and the new CSS found along
            the way. New posts when there&apos;s something worth saying.
          </p>
        </section>

        {posts.length === 0 ? (
          <p className={styles.empty}>No posts yet.</p>
        ) : (
          <>
            <section className={styles.track} aria-labelledby="track-engineering">
              <h2 id="track-engineering" className={styles.trackTitle}>
                Engineering the system
              </h2>
              <p className={styles.trackLede}>
                Post-mortems and build stories from the repo — published only
                after the fix ships.
              </p>
              {engineering.length === 0 ? (
                <p className={styles.empty}>Nothing in this drawer yet.</p>
              ) : (
                <div className={styles.postList}>
                  {engineering.map((p) => (
                    <PostCard key={p.slug} post={p} />
                  ))}
                </div>
              )}
            </section>

            <section className={styles.track} aria-labelledby="track-discovery">
              <h2 id="track-discovery" className={styles.trackTitle}>
                CSS discoveries
              </h2>
              <p className={styles.trackLede}>
                New and cool CSS from the platform&apos;s edge — the discovery
                is the star; cia is the sponsor.
              </p>
              {discovery.length === 0 ? (
                <p className={styles.empty}>Nothing in this drawer yet.</p>
              ) : (
                <div className={styles.postList}>
                  {discovery.map((p) => (
                    <PostCard key={p.slug} post={p} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
      {/* Interim: this route still lives outside the (site) shell (dev-server file locks block the move) - the shell provides the footer once it moves in; remove this then. */}
      <SiteFooter />
    </>
  );
}
