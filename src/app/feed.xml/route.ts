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

export function GET(): Response {
  // Only dated posts belong in the feed: a post without a publishDate hasn't
  // been announced, and Atom requires an <updated> per entry anyway.
  const posts = getPostIndex().filter((p) => p.publishDate !== null);

  // getPostIndex() sorts newest-first, so the feed's own <updated> is the
  // most recent touch across all posts.
  const feedUpdated = posts
    .map((p) => p.updatedDate ?? p.publishDate!)
    .sort()
    .at(-1);

  const entries = posts
    .map((p) => {
      const url = `${SITE_URL}/blog/${p.slug}/`;
      const updated = toRfc3339(p.updatedDate ?? p.publishDate!);
      const published = toRfc3339(p.publishDate!);
      const category = p.category
        ? `\n    <category term="${escapeXml(p.category)}" label="${escapeXml(trackFor(p.category))}"/>`
        : "";
      const summary = p.excerpt
        ? `\n    <summary>${escapeXml(p.excerpt)}</summary>`
        : "";
      return `  <entry>
    <title>${escapeXml(p.title)}</title>
    <id>${url}</id>
    <link rel="alternate" type="text/html" href="${url}"/>
    <published>${published}</published>
    <updated>${updated}</updated>
    <author><name>${escapeXml(p.author)}</name></author>${category}${summary}
  </entry>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(FEED_TITLE)}</title>
  <subtitle>Engineering the system, and the new CSS found along the way.</subtitle>
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
