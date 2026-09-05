"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import styles from "./DocsNav.module.scss";
import { docsNav } from "../nav.config";

/**
 * The selections rail for the docs section — a real <nav> landmark:
 * filter <input type="search"> → category groups (<h2> + <ul> of links).
 * Sticky under the top nav with its own internal scroll (the page
 * scrolls; the rail stays; a long list scrolls inside the rail).
 *
 * State lives on attributes, never class names: the active link carries
 * data-active + aria-current="page" and the stylesheet keys off
 * [aria-current] (accessible-by-construction).
 *
 * Why the `mounted` gate: with `output: "export"` + a shared layout, Next
 * pre-renders this client component once at build time and `usePathname()`
 * returns a route-segment value that doesn't match the per-page active item.
 * The static HTML therefore has *no* active link; resolving it in an effect
 * keeps the first client render SSR-identical and avoids React #418.
 */
export default function DocsNav({ label = "Docs navigation" }: { label?: string }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState("");
  useEffect(() => setMounted(true), []);

  const needle = filter.trim().toLowerCase();
  const sections = docsNav
    .map((section) => ({
      ...section,
      items: needle
        ? section.items.filter((i) => i.label.toLowerCase().includes(needle))
        : section.items,
    }))
    // Empty categories unrender rather than showing empty headings.
    .filter((section) => section.items.length > 0);

  return (
    <nav className={styles.sidebar} aria-label={label}>
      <input
        type="search"
        className={styles.filter}
        placeholder="Filter pages…"
        aria-label="Filter documentation pages"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <div className={styles.scroll}>
        {sections.map((section) => (
          <div key={section.title}>
            <h2>{section.title}</h2>
            <ul>
              {section.items.map((item) => {
                const active = mounted && pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
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
        ))}
        {sections.length === 0 && (
          <p className={styles.empty}>No pages match “{filter}”.</p>
        )}
      </div>
    </nav>
  );
}
