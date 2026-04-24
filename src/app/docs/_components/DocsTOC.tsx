"use client";
import { useEffect, useState } from "react";
import styles from "./DocsTOC.module.scss";

type Heading = { id: string; text: string; level: 2 | 3 };

export default function DocsTOC() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const article = document.querySelector<HTMLElement>("article.docs-content");
    if (!article) return;

    const nodes = Array.from(article.querySelectorAll<HTMLHeadingElement>("h2[id], h3[id]"));
    setHeadings(
      nodes.map((n) => ({
        id: n.id,
        text: n.textContent ?? "",
        level: n.tagName === "H2" ? 2 : 3,
      }))
    );

    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav className={styles.toc} aria-label="On this page">
      <h5>on this page</h5>
      <ul>
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? styles.sub : undefined}>
            <a
              href={`#${h.id}`}
              className={activeId === h.id ? styles.isActive : undefined}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
