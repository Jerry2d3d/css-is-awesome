"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./DocsPrevNext.module.scss";
import { prevNext } from "../nav.config";

/**
 * Prev / next links at the bottom of each docs page.
 *
 * Mount gate (see DocsNav for the full story): with `output: "export"` and a
 * shared docs layout, this component is pre-rendered with a pathname that
 * doesn't match the page being built, so `prevNext(pathname)` returns
 * `{prev: null, next: null}` at SSG time and the entire <nav> is omitted
 * from the static HTML. On the client `usePathname()` returns the real
 * route, the nav is rendered, and React reports a structural hydration
 * mismatch (#418). Holding the SSR-equivalent (null) on first client render
 * and only resolving prev/next after mount keeps the two trees identical.
 */
export default function DocsPrevNext() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const { prev, next } = prevNext(pathname);
  if (!prev && !next) return null;

  return (
    <nav className={styles.prevNext} aria-label="Previous and next docs pages">
      {prev ? (
        <Link href={prev.href} className={styles.prev}>
          <span className={styles.dir}>← Previous</span>
          <span className={styles.label}>{prev.label}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={next.href} className={styles.next}>
          <span className={styles.dir}>Next →</span>
          <span className={styles.label}>{next.label}</span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
