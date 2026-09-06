"use client";
// Blog explorer — chips + search over the post index, the way the DOCS
// rail is set up: same filter-box pattern, client-side text filtering,
// state on aria-pressed (never class soup). The server page reads the
// posts at build time and hands the serializable metas down.
import { useState } from "react";
import Link from "next/link";
import { trackFor, type PostTrack } from "@/lib/blog-tracks";
import type { PostMeta } from "@/lib/blog"; // type-only: erased at compile, no fs reaches the client
import styles from "./page.module.scss";

const TRACKS: { id: PostTrack; chip: string; lede: string }[] = [
  {
    id: "engineering",
    chip: "CSS Is Awesome",
    lede: "Post-mortems and build stories from the repo — published only after the fix ships.",
  },
  {
    id: "discovery",
    chip: "CSS",
    lede: "New and cool CSS from the platform's edge — the discovery is the star; cia is the sponsor.",
  },
  {
    id: "ai",
    chip: "AI",
    lede: "Where AI meets CSS — agents, MCP, and what machines do with stylesheets.",
  },
];

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

function matches(post: PostMeta, needle: string): boolean {
  if (!needle) return true;
  const hay = [post.title, post.excerpt ?? "", post.category ?? "", ...post.tags]
    .join(" ")
    .toLowerCase();
  return hay.includes(needle);
}

export default function BlogExplorer({ posts }: { posts: PostMeta[] }) {
  const [track, setTrack] = useState<PostTrack | "all">("all");
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();

  const sections = TRACKS.map((t) => ({
    ...t,
    posts: posts.filter(
      (p) => trackFor(p.category) === t.id && matches(p, needle),
    ),
  })).filter((t) => (track === "all" ? t.posts.length > 0 : t.id === track));

  const anyShown = sections.some((s) => s.posts.length > 0);

  return (
    <>
      <div className={styles.controls}>
        <div className={styles.chips} role="group" aria-label="Filter by track">
          <button
            type="button"
            aria-pressed={track === "all"}
            onClick={() => setTrack("all")}
          >
            All
          </button>
          {TRACKS.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={track === t.id}
              onClick={() => setTrack(t.id)}
            >
              {t.chip}
            </button>
          ))}
        </div>
        <input
          type="search"
          className={styles.filter}
          placeholder="Search posts…"
          aria-label="Search posts"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {!anyShown && (
        <p className={styles.empty}>
          {needle ? <>No posts match &ldquo;{query}&rdquo;.</> : "Nothing in this drawer yet."}
        </p>
      )}

      {sections.map(
        (s) =>
          s.posts.length > 0 && (
            <section
              key={s.id}
              className={styles.track}
              aria-labelledby={`track-${s.id}`}
            >
              <h2 id={`track-${s.id}`} className={styles.trackTitle}>
                {s.chip}
              </h2>
              <p className={styles.trackLede}>{s.lede}</p>
              <div className={styles.postList}>
                {s.posts.map((p) => (
                  <PostCard key={p.slug} post={p} />
                ))}
              </div>
            </section>
          ),
      )}
    </>
  );
}
