"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import styles from "./ExamplesNav.module.scss";
import { examplesNav, exampleHref } from "../nav.config";

/**
 * The selections rail for the examples section — a real <nav> landmark:
 * one group of example links. Sticky under the top nav with its own
 * internal scroll (the page scrolls; the rail stays; a long list scrolls
 * inside the rail).
 *
 * State lives on attributes, never class names: the active link carries
 * data-active + aria-current="page" and the stylesheet keys off
 * [aria-current] (accessible-by-construction).
 *
 * Why the `mounted` gate: with `output: "export"` + a shared layout, Next
 * pre-renders this client component once at build time and `usePathname()`
 * returns a route-segment value that doesn't match the per-page active item.
 * Resolving the active link in an effect keeps the first client render
 * SSR-identical and avoids React #418.
 */
export default function ExamplesNav({ label = "Examples" }: { label?: string }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <nav className={styles.sidebar} aria-label={label}>
      <div className={styles.scroll}>
        <h2>Examples</h2>
        <ul>
          {examplesNav.map((item) => {
            const href = exampleHref(item.slug);
            const active = mounted && pathname === href;
            return (
              <li key={item.slug}>
                <Link
                  href={href}
                  data-active={active || undefined}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
