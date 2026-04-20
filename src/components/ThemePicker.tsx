"use client";

import "./ThemePicker.scss";
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

function applyTheme(id: string) {
  const t = THEMES.find((x) => x.id === id) || THEMES[0];
  const link = document.getElementById(LINK_ID) as HTMLLinkElement | null;
  if (link) link.href = t.href;
  localStorage.setItem(STORAGE_KEY, t.id);
}

export default function ThemePicker() {
  const [active, setActive] = useState<string>("sketchbook");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) || "sketchbook";
    setActive(saved);
    applyTheme(saved);
  }, []);

  function choose(id: string) {
    setActive(id);
    applyTheme(id);
  }

  return (
    <div id="cia-theme-picker" aria-label="Theme picker">
      <div className="cia-tp__label">Theme</div>
      <div className="cia-tp__row">
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
