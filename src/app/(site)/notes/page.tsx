// /notes — the working log.
//
// Short, dated entries about what was actually being done. Deliberately a
// separate surface from /blog: posts are narrative and meant to last, notes
// are dated and disposable. Keeping them apart is what stops a note from
// quietly having to justify itself as a post, which is the pressure that
// stops short notes being written at all.
//
// Statically exported, no client JavaScript.
import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.scss";
import { getNotesByMonth, monthLabel } from "@/lib/notes";

export const metadata: Metadata = {
  title: "Working notes — css-is-awesome",
  description:
    "Short dated entries about what was being worked on and what it taught. Lighter than a blog post, heavier than a commit message.",
};

export default function NotesPage() {
  const months = getNotesByMonth();
  const total = months.reduce((n, m) => n + m.notes.length, 0);

  return (
    <main className={styles.shell}>
      <header className={styles.head}>
        <p className={styles.eyebrow}>working notes</p>
        <h1>What I was doing, and what it taught me.</h1>
        <p className={styles.lead}>
          Short dated entries. Lighter than a{" "}
          <Link href="/blog">blog post</Link>, heavier than a commit message.
          Written when there is something worth writing down, which means
          there are gaps, and the gaps are not a problem. For the current state
          of the project rather than its history, see <Link href="/now">/now</Link>.
        </p>
      </header>

      {total === 0 ? (
        <p className={styles.empty}>No notes yet.</p>
      ) : (
        months.map(({ month, notes }) => (
          <section key={month} className={styles.month}>
            <h2>{monthLabel(month)}</h2>
            <ul className={styles.list}>
              {notes.map((note) => (
                <li key={note.slug} className={styles.item}>
                  <p className={styles.itemHead}>
                    {note.date && (
                      <time className={styles.date} dateTime={note.date}>
                        {note.date}
                      </time>
                    )}
                    <Link href={`/notes/${note.slug}`}>{note.title}</Link>
                  </p>
                  {note.lede && <p className={styles.lede}>{note.lede}</p>}
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </main>
  );
}
