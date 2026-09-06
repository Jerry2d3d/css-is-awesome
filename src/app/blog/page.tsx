import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getPostIndex } from "@/lib/blog";
import BlogExplorer from "./BlogExplorer";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Blog — css-is-awesome",
  description:
    "Notes from building a mixin-first SCSS design system — decisions, dead ends, and the occasional post-mortem. Plus the new CSS (and AI) found along the way.",
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

export default function BlogPage() {
  // Read from src/content/blog at build time; the explorer island gets
  // the serializable metas and does chips + search client-side — the
  // way the docs rail is set up.
  const posts = getPostIndex();

  return (
    <>
      <SiteHeader current="blog" />

      <main className={styles.shell}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>the sketchbook</p>
          <h1>Notes from the margins.</h1>
          <p>
            Three drawers: how the system gets built, the new CSS found along
            the way, and where AI meets stylesheets. New posts when
            there&apos;s something worth saying.
          </p>
        </section>

        {posts.length === 0 ? (
          <p className={styles.empty}>No posts yet.</p>
        ) : (
          <BlogExplorer posts={posts} />
        )}
      </main>
      {/* Interim: this route still lives outside the (site) shell (dev-server file locks block the move) - the shell provides the footer once it moves in; remove this then. */}
      <SiteFooter />
    </>
  );
}
