"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./DocsPrintIndex.module.scss";

/**
 * "On this page" for PAPER — print-only bullets at the top of the
 * printed article. Same DOM harvest as DocsTOC (h2[id] inside the
 * article), hidden on screen via cia.print-only, revealed by
 * @media print. Just bullets, no page numbers — the article flows
 * naturally in print, so numbers would be guesses. All CSS, zero JS
 * beyond the same heading harvest the screen TOC already does.
 */
export default function DocsPrintIndex() {
  const pathname = usePathname();
  const [headings, setHeadings] = useState<{ id: string; text: string }[]>([]);

  useEffect(() => {
    const harvest = () => {
      const article = document.querySelector<HTMLElement>("article.docs-content");
      if (!article) return;
      const nodes = Array.from(article.querySelectorAll<HTMLHeadingElement>("h2[id]"));
      setHeadings(nodes.map((n) => ({ id: n.id, text: n.textContent ?? "" })));
    };
    // Harvest on navigation (pathname dep) AND — the guarantee — at the
    // moment of printing. The shared docs layout persists across client
    // navigations, so a pathname-only harvest can read a stale article;
    // beforeprint reads the CURRENT DOM, so the bullets always match the
    // page being printed.
    harvest();
    window.addEventListener("beforeprint", harvest);
    return () => window.removeEventListener("beforeprint", harvest);
  }, [pathname]);

  if (headings.length === 0) return null;

  return (
    <nav className={styles.printIndex} aria-label="On this page">
      <h2>On this page</h2>
      <ul>
        {headings.map((h) => (
          <li key={h.id}>{h.text}</li>
        ))}
      </ul>
    </nav>
  );
}
