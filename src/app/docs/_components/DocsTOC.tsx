"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./DocsTOC.module.scss";

type Heading = { id: string; text: string; level: 2 | 3 };
type Group = { h2: Heading; children: Heading[] };

// Fold the flat heading list into h2 groups with their h3 children.
function group(headings: Heading[]): Group[] {
  const groups: Group[] = [];
  let current: Group | null = null;
  for (const h of headings) {
    if (h.level === 2) {
      current = { h2: h, children: [] };
      groups.push(current);
    } else if (current) {
      current.children.push(h);
    } else {
      // An h3 before any h2 — promote it so it isn't lost.
      groups.push({ h2: h, children: [] });
    }
  }
  return groups;
}

export default function DocsTOC() {
  const pathname = usePathname();
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Keyed on pathname: the docs layout (and this component) persist across
  // client-side navigation, so a run-once harvest froze on the first page's
  // headings. Re-harvest + rebuild the scroll-spy observer per page.
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
  }, [pathname]);

  const groups = group(headings);

  // Auto-open the group that contains the active heading. Because the
  // <details> share a name, the browser closes the siblings for us —
  // "open one, the others close", zero JS beyond this nudge. Set open
  // imperatively (not a controlled prop) so a manual click still works.
  useEffect(() => {
    if (!activeId || !navRef.current) return;
    const activeGroup = groups.find(
      (g) => g.h2.id === activeId || g.children.some((c) => c.id === activeId)
    );
    if (!activeGroup || activeGroup.children.length === 0) return;
    const el = navRef.current.querySelector<HTMLDetailsElement>(
      `details[data-group="${activeGroup.h2.id}"]`
    );
    if (el && !el.open) el.open = true;
  }, [activeId, groups]);

  if (headings.length === 0) return null;

  const linkClass = (id: string) =>
    activeId === id ? styles.isActive : undefined;

  return (
    <nav ref={navRef} className={styles.toc} aria-label="On this page">
      <h5>on this page</h5>
      {groups.map((g) =>
        g.children.length === 0 ? (
          // No children — a plain top-level link, no disclosure.
          <a key={g.h2.id} href={`#${g.h2.id}`} className={linkClass(g.h2.id)}>
            {g.h2.text}
          </a>
        ) : (
          <details
            key={g.h2.id}
            name="docs-toc"
            data-group={g.h2.id}
            className={styles.group}
          >
            {/* Summary is a plain toggle — NO link inside it. A <summary> is
                itself a button, so an <a> within it is a nested interactive
                control (axe "nested-interactive", serious). The h2's own
                section link lives as the first list item instead. */}
            <summary className={g.h2.id === activeId ? styles.summaryActive : undefined}>
              <span>{g.h2.text}</span>
            </summary>
            <ul>
              <li>
                <a href={`#${g.h2.id}`} className={linkClass(g.h2.id)}>
                  {g.h2.text}
                </a>
              </li>
              {g.children.map((c) => (
                <li key={c.id} className={styles.sub}>
                  <a href={`#${c.id}`} className={linkClass(c.id)}>
                    {c.text}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        )
      )}
    </nav>
  );
}
