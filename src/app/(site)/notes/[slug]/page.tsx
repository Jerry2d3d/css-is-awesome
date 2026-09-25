import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNote, getNoteSlugs } from "@/lib/notes";
import styles from "./page.module.scss";

// One static page per `.md` in src/content/notes. New notes appear by
// dropping a file in — no route edits, same contract as /blog/[slug] and
// /docs/recipes/[slug].
export function generateStaticParams() {
  return getNoteSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) return { title: "Note not found" };
  return {
    title: `${note.title} — Working notes — css-is-awesome`,
    description: note.lede,
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

export default async function NotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) notFound();

  const written = formatDate(note.date);

  return (
    <main className={styles.shell}>
      <p className={styles.back}>
        <Link href="/notes">← Working notes</Link>
      </p>

      <article>
        <header className={styles.head}>
          {written && (
            <p className={styles.date}>
              <time dateTime={note.date ?? undefined}>{written}</time>
            </p>
          )}
          <h1>{note.title}</h1>
          {note.tags.length > 0 && (
            <ul className={styles.tags}>
              {note.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          )}
        </header>

        {/* Same markdown pipeline as recipes and the blog — one renderer,
            one set of code-block rules, no second style to keep in sync. */}
        <div
          className={styles.body}
          dangerouslySetInnerHTML={{ __html: note.html }}
        />
      </article>

      <p className={styles.back}>
        <Link href="/notes">← Working notes</Link>
        {" · "}
        <Link href="/now">What I&apos;m on now</Link>
      </p>
    </main>
  );
}
