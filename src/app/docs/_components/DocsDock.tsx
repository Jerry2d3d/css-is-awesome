"use client";
// ============================================================
// DocsDock — mobile-only bottom dock + slide-up sheets (Concept B).
// Target: src/app/docs/_components/DocsDock.tsx
//
// Three slots: Docs (section tree) · This page (headings) · Theme.
// Rendered by the docs layout; CSS hides it at ≥1025px, where the
// desktop sidebar + TOC take over. Headings are gathered from the
// article DOM exactly the way DocsTOC does, so the two components
// never disagree about what's on the page.
// ============================================================
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./DocsDock.module.scss";
import { docsNav } from "../nav.config";
import LightDarkToggle from "@/components/LightDarkToggle";
import { setTheme, useThemeAttribute } from "@/lib/themeState";

// Theme families, listed directly in the sheet — no nested trigger, no
// second tap. Mode (light/dark) is preserved when switching families.
const FAMILIES: { id: string; label: string }[] = [
  { id: "boilerplate", label: "Boilerplate" },
  { id: "sketchbook",  label: "Sketchbook" },
  { id: "press",       label: "Press" },
  { id: "graphite",    label: "Graphite" },
  { id: "glass",       label: "Glass" },
  { id: "cupertino",   label: "Cupertino" },
  { id: "terminal",    label: "Terminal" },
  { id: "prism",       label: "Prism" },
];

const ALIAS_MODE: Record<string, "light" | "dark"> = {
  boilerplate: "light", sketchbook: "light", press: "light", graphite: "dark",
  glass: "light", cupertino: "light", terminal: "dark",
};

function familyOf(theme: string): string {
  return theme.replace(/-(light|dark)$/, "");
}

function modeOf(theme: string): "light" | "dark" {
  if (theme.endsWith("-dark")) return "dark";
  if (theme.endsWith("-light")) return "light";
  return ALIAS_MODE[theme] ?? "light";
}

type Sheet = "docs" | "toc" | "theme" | null;
type Heading = { id: string; text: string; level: 2 | 3 };

export default function DocsDock() {
  const pathname = usePathname();
  const activeTheme = useThemeAttribute() ?? "sketchbook-light";
  const activeFamily = familyOf(activeTheme);
  const activeMode = modeOf(activeTheme);
  const [open, setOpen] = useState<Sheet>(null);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Same DOM harvest as DocsTOC — h2/h3 with ids inside the article.
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
  }, [pathname]);

  // Escape closes; lock page scroll while a sheet is up.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("keydown", onKey);
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prev;
    };
  }, [open]);

  const toggle = (sheet: Sheet) => setOpen((cur) => (cur === sheet ? null : sheet));

  return (
    <div className={styles.root}>
      {/* scrim */}
      <div
        className={`${styles.scrim} ${open ? styles.isOpen : ""}`}
        onClick={() => setOpen(null)}
        aria-hidden="true"
      />

      {/* ---- docs sheet ---- */}
      <section
        className={`${styles.sheet} ${open === "docs" ? styles.isOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Docs navigation"
      >
        <span className={styles.grab} aria-hidden="true" />
        <h5 className={styles.sheetTitle}>docs</h5>
        <div className={styles.sheetScroll}>
          {docsNav.map((section) => (
            <div key={section.title}>
              <h4>{section.title}</h4>
              <ul>
                {section.items.map((item) => {
                  const active = mounted && pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={active ? styles.isActive : undefined}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setOpen(null)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ---- on-this-page sheet ---- */}
      <section
        className={`${styles.sheet} ${open === "toc" ? styles.isOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="On this page"
      >
        <span className={styles.grab} aria-hidden="true" />
        <h5 className={styles.sheetTitle}>on this page</h5>
        <div className={styles.sheetScroll}>
          <ul className={styles.tocList}>
            {headings.map((h) => (
              <li key={h.id} className={h.level === 3 ? styles.sub : undefined}>
                <a href={`#${h.id}`} onClick={() => setOpen(null)}>
                  {h.text}
                </a>
              </li>
            ))}
            {headings.length === 0 && <li className={styles.empty}>No sections on this page.</li>}
          </ul>
        </div>
      </section>

      {/* ---- theme sheet ---- */}
      <section
        className={`${styles.sheet} ${open === "theme" ? styles.isOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Theme"
      >
        <span className={styles.grab} aria-hidden="true" />
        <h5 className={styles.sheetTitle}>theme</h5>
        <div className={styles.sheetScroll}>
          <div className={styles.themeGrid}>
            {FAMILIES.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={f.id === activeFamily}
                onClick={() => setTheme(`${f.id}-${activeMode}`)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className={styles.themeRow}>
            <LightDarkToggle />
          </div>
        </div>
      </section>

      {/* ---- the dock ---- */}
      <nav className={styles.dock} aria-label="Docs quick menu">
        <button
          type="button"
          onClick={() => toggle("docs")}
          aria-expanded={open === "docs"}
          className={open === "docs" ? styles.isActive : undefined}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="13" y2="17" />
          </svg>
          Docs
        </button>
        <button
          type="button"
          onClick={() => toggle("toc")}
          aria-expanded={open === "toc"}
          className={open === "toc" ? styles.isActive : undefined}
        >
          <span aria-hidden="true">¶</span>
          This page
        </button>
        <button
          type="button"
          onClick={() => toggle("theme")}
          aria-expanded={open === "theme"}
          className={open === "theme" ? styles.isActive : undefined}
        >
          <span aria-hidden="true">◐</span>
          Theme
        </button>
      </nav>
    </div>
  );
}
