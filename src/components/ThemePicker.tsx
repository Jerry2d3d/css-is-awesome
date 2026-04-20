"use client";

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
      <style>{`
        #cia-theme-picker {
          position: fixed;
          right: 16px;
          bottom: 16px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 10px 12px;
          background: var(--paper-raised, #fff);
          color: var(--ink, #111);
          border: 1px solid var(--hair, rgba(0,0,0,0.12));
          border-radius: var(--r-md, 8px);
          box-shadow: var(--shadow-md, 0 6px 20px rgba(0,0,0,0.12));
          font-family: var(--font-sans, system-ui, sans-serif);
          font-size: 12px;
          line-height: 1.4;
          max-width: 200px;
        }
        #cia-theme-picker .cia-tp__label {
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ink-faint, #888);
          padding-bottom: 4px;
        }
        #cia-theme-picker .cia-tp__row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px;
        }
        #cia-theme-picker button {
          all: unset;
          cursor: pointer;
          padding: 5px 8px;
          border-radius: var(--r-sm, 4px);
          border: 1px solid transparent;
          color: var(--ink-soft, currentColor);
          background: transparent;
          text-align: center;
          font: inherit;
          transition: background 120ms ease, border-color 120ms ease;
        }
        #cia-theme-picker button:hover {
          background: var(--paper-sunk, rgba(0,0,0,0.05));
        }
        #cia-theme-picker button[aria-pressed="true"] {
          background: var(--ai-wash, rgba(0,0,0,0.08));
          border-color: var(--ai, currentColor);
          color: var(--ai, currentColor);
          font-weight: 600;
        }
        @media (max-width: 560px) {
          #cia-theme-picker { right: 8px; bottom: 8px; padding: 8px; }
        }
      `}</style>
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
