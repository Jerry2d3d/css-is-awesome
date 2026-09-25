// /now — what is actually happening on this project, generated at build time.
//
// Everything below except the opening paragraph and the blocked list is read
// out of the repository by src/lib/now.ts. That is the whole design: a page
// claiming to describe current state cannot itself be a hand-maintained claim,
// because every hand-maintained claim in this repo has gone stale, several of
// them in both directions at once.
//
// Statically exported. No runtime fetch, no client JavaScript.
import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.scss";
import { getNow, waveLabel, type Epic } from "@/lib/now";
import { getNoteIndex } from "@/lib/notes";

export const metadata: Metadata = {
  title: "Now — css-is-awesome",
  description:
    "What is being worked on right now: the latest release, the epics in flight, what is next in the current wave, and what is blocked. Generated from the repository at build time.",
};

function EpicRow({ epic }: { epic: Epic }) {
  return (
    <li className={styles.epic}>
      <p className={styles.epicHead}>
        <a href={epic.href}>{epic.title}</a>{" "}
        <span className={styles.wave}>{waveLabel(epic.wave)}</span>
      </p>
      <p className={styles.epicWhy}>{epic.status}</p>
    </li>
  );
}

export default function NowPage() {
  const now = getNow();
  const notes = getNoteIndex();
  const latestNote = notes[0] ?? null;

  // "Last built" rather than "last updated": the page is only as fresh as the
  // deploy that produced it, and saying so is more useful than a date that
  // implies someone checked.
  const built = now.builtAt.slice(0, 10);

  return (
    <main className={styles.shell}>
      <header className={styles.head}>
        <p className={styles.eyebrow}>/now</p>
        <h1>What I&apos;m working on</h1>
        <p className={styles.built}>
          Generated from the repository when the site was last built,{" "}
          <time dateTime={built}>{built}</time>. Nothing on this page is typed
          by hand except the paragraph below and the blocked list.
        </p>
      </header>

      {now.note && (
        <section className={styles.note} aria-label="Current focus">
          {now.note.split(/\n{2,}/).map((para, i) => (
            <p key={i}>{para.replace(/\s*\n\s*/g, " ")}</p>
          ))}
          {now.noteUpdated && (
            <p className={styles.noteMeta}>
              Written <time dateTime={now.noteUpdated}>{now.noteUpdated}</time>
            </p>
          )}
        </section>
      )}

      <section className={styles.block}>
        <h2>Shipped</h2>
        <p className={styles.lead}>
          Latest published version is{" "}
          <a href={now.release.href}>
            <strong>{now.release.version}</strong>
          </a>
          {now.release.date && (
            <>
              , released{" "}
              <time dateTime={now.release.date}>{now.release.date}</time>
            </>
          )}
          . The version comes from <code>package.json</code>, the same source
          the home page reads, so the two cannot disagree.
        </p>
      </section>

      <section className={styles.block}>
        <h2>In flight</h2>
        {now.inFlight.length === 0 ? (
          <p className={styles.empty}>Nothing part-finished right now.</p>
        ) : (
          <ul className={styles.epics}>
            {now.inFlight.map((e) => (
              <EpicRow key={`${e.wave}/${e.id}`} epic={e} />
            ))}
          </ul>
        )}
      </section>

      <section className={styles.block}>
        <h2>Next</h2>
        <p className={styles.lead}>
          Scoped to the wave actually being worked,{" "}
          <strong>{waveLabel(now.currentWave)}</strong>. The rest of the
          backlog is the <Link href="/docs/roadmap">roadmap&apos;s</Link> job;
          this page answers what is happening, not what might happen.
        </p>
        {now.next.length === 0 ? (
          <p className={styles.empty}>
            Nothing queued in this wave. The next wave has not been opened yet.
          </p>
        ) : (
          <ul className={styles.epics}>
            {now.next.map((e) => (
              <EpicRow key={`${e.wave}/${e.id}`} epic={e} />
            ))}
          </ul>
        )}
      </section>

      <section className={styles.block}>
        <h2>Blocked</h2>
        {now.blocked.length === 0 ? (
          <p className={styles.empty}>Nothing is blocked.</p>
        ) : (
          <ul className={styles.blocked}>
            {now.blocked.map((b) => (
              <li key={b.what}>
                <p className={styles.epicHead}>
                  {b.href ? <a href={b.href}>{b.what}</a> : b.what}{" "}
                  <span className={styles.wave}>since {b.since}</span>
                </p>
                <p className={styles.epicWhy}>{b.why}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {latestNote && (
        <section className={styles.block}>
          <h2>Latest note</h2>
          <p className={styles.lead}>
            <Link href={`/notes/${latestNote.slug}`}>{latestNote.title}</Link>
            {latestNote.date && (
              <>
                {" · "}
                <time dateTime={latestNote.date}>{latestNote.date}</time>
              </>
            )}
          </p>
          {latestNote.lede && <p className={styles.epicWhy}>{latestNote.lede}</p>}
          <p className={styles.lead}>
            <Link href="/notes">All working notes →</Link>
          </p>
        </section>
      )}
    </main>
  );
}
