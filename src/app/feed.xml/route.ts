// Atom feed for the blog (EPIC-06 B6.3).
//
// Under `output: "export"` a route handler with `dynamic = "force-static"`
// runs once at build time and lands in the export as a literal `feed.xml`
// file — no server, no JS shipped, same posture as every other page. It reads
// the exact same frontmatter the blog index reads (src/lib/blog.ts), so the
// feed can never drift from the index.
//
// Atom over RSS 2.0: RFC 3339 dates come straight off the `YYYY-MM-DD`
// frontmatter (RSS wants RFC 822 dates, which would mean hand-rolling month
// names), and Atom's `<category>`/per-entry `<author>` map 1:1 onto the post
// schema.
import { getPostIndex, trackFor } from "@/lib/blog";
import { getNoteIndex } from "@/lib/notes";

export const dynamic = "force-static";

// Canonical origin, hardcoded on purpose: the GitHub Pages mirror build must
// also emit production URLs — a feed reader subscribed on the mirror should
// still be sent to the canonical site. Matches the <link rel="alternate"> on
// /blog. No trailing slash; paths below start with "/".
const SITE_URL = "https://cssisawesome.com";
const FEED_TITLE = "css-is-awesome blog";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** `YYYY-MM-DD` frontmatter date → RFC 3339 instant (midnight UTC). */
function toRfc3339(isoDate: string): string {
  return `${isoDate}T00:00:00Z`;
}

/**
 * One entry, whatever surface it came from.
 *
 * ONE FEED, NOT TWO. A follower wants everything that happened. Splitting
 * long-form posts and working notes into separate feeds means anyone who
 * wants both has to find and subscribe to both, and anyone who subscribes to
 * one silently misses half the output. Atom carries a `<category>` per entry,
 * so a reader who wants only one kind can filter, and a reader who wants
 * everything does nothing.
 */
type FeedEntry = {
  title: string;
  url: string;
  /** YYYY-MM-DD. */
  published: string;
  updated: string;
  author: string;
  /** `term` + human `label` for Atom's <category>. */
  category: { term: string; label: string } | null;
  summary: string;
};

export function GET(): Response {
  // Only dated items belong in the feed: an undated one hasn't been
  // announced, and Atom requires an <updated> per entry anyway.
  const posts: FeedEntry[] = getPostIndex()
    .filter((p) => p.publishDate !== null)
    .map((p) => ({
      title: p.title,
      url: `${SITE_URL}/blog/${p.slug}/`,
      published: p.publishDate!,
      updated: p.updatedDate ?? p.publishDate!,
      author: p.author,
      category: p.category
        ? { term: p.category, label: trackFor(p.category) }
        : null,
      summary: p.excerpt,
    }));

  const notes: FeedEntry[] = getNoteIndex()
    .filter((n) => n.date !== null)
    .map((n) => ({
      title: n.title,
      url: `${SITE_URL}/notes/${n.slug}/`,
      published: n.date!,
      updated: n.date!,
      // Notes carry no author field; the log has one voice.
      author: "Jerry Hansen",
      category: { term: "note", label: "Working notes" },
      summary: n.lede,
    }));

  const items = [...posts, ...notes].sort((a, b) =>
    b.published.localeCompare(a.published),
  );

  // The feed's own <updated> is the most recent touch across everything.
  const feedUpdated = items.map((i) => i.updated).sort().at(-1);

  const entries = items
    .map((i) => {
      const url = i.url;
      const updated = toRfc3339(i.updated);
      const published = toRfc3339(i.published);
      const category = i.category
        ? `\n    <category term="${escapeXml(i.category.term)}" label="${escapeXml(i.category.label)}"/>`
        : "";
      const summary = i.summary
        ? `\n    <summary>${escapeXml(i.summary)}</summary>`
        : "";
      return `  <entry>
    <title>${escapeXml(i.title)}</title>
    <id>${url}</id>
    <link rel="alternate" type="text/html" href="${url}"/>
    <published>${published}</published>
    <updated>${updated}</updated>
    <author><name>${escapeXml(i.author)}</name></author>${category}${summary}
  </entry>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(FEED_TITLE)}</title>
  <subtitle>Engineering the system, the new CSS found along the way, and short working notes. Filter on &lt;category&gt; if you want only one kind.</subtitle>
  <id>${SITE_URL}/feed.xml</id>
  <link rel="self" type="application/atom+xml" href="${SITE_URL}/feed.xml"/>
  <link rel="alternate" type="text/html" href="${SITE_URL}/blog/"/>
  <updated>${feedUpdated ? toRfc3339(feedUpdated) : "1970-01-01T00:00:00Z"}</updated>
${entries}
</feed>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
  });
}
