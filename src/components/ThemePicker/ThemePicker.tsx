"use client";

import styles from "./ThemePicker.module.scss";
import { useEffect, useState } from "react";

type Theme = { id: string; label: string; href: string };

const THEMES: Theme[] = [
  { id: "sketchbook", label: "Sketchbook", href: "/theme.css" },
  { id: "press",      label: "Press",      href: "/themes/press/theme.css" },
  { id: "graphite",   label: "Graphite",   href: "/themes/graphite/theme.css" },
  { id: "glass",      label: "Glass",      href: "/themes/glass/theme.css" },
  { id: "cupertino",  label: "Cupertino",  href: "/themes/cupertino/theme.css" },
  { id: "terminal",   label: "Terminal",   href: "/themes/terminal/theme.css" },
];

const STORAGE_KEY = "cia-theme-file";
const LINK_ID = "cia-theme-link";

function applyTheme(id: string, persist: boolean = false) {
  const t = THEMES.find((x) => x.id === id) || THEMES[0];
  const link = document.getElementById(LINK_ID) as HTMLLinkElement | null;
  if (link) link.href = t.href;
  document.documentElement.setAttribute("data-theme-id", t.id);
  if (persist) localStorage.setItem(STORAGE_KEY, t.id);
}

export default function ThemePicker() {
  const [active, setActive] = useState<string>("sketchbook");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const initial =
      saved ??
      (window.matchMedia?.("(prefers-color-scheme: dark)").matches
        ? "graphite"
        : "sketchbook");
    setActive(initial);
    applyTheme(initial);

    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return;
    const onChange = (e: MediaQueryListEvent) => {
      // Only react if no manual choice is saved.
      if (localStorage.getItem(STORAGE_KEY)) return;
      const next = e.matches ? "graphite" : "sketchbook";
      setActive(next);
      applyTheme(next);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function choose(id: string) {
    setActive(id);
    applyTheme(id, true);
  }

  return (
    <div className={styles.picker} aria-label="Theme picker">
      <div className={styles.label}>Theme</div>
      <div className={styles.row}>
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={active === t.id}
            onClick={() => choose(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
