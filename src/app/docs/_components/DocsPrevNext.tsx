"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./DocsPrevNext.module.scss";
import { prevNext } from "../nav.config";

export default function DocsPrevNext() {
  const pathname = usePathname();
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
