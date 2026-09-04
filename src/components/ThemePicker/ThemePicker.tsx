"use client";

import { useState } from "react";
import styles from "./ThemePicker.module.scss";
import { setTheme, useThemeAttribute } from "@/lib/themeState";

type Theme = { id: string; label: string };

// Theme IDs use the v0.7 `-light`/`-dark` suffix convention. The
// unsuffixed v0.6 names still resolve via the alias selectors in
// public/theme.css through 0.7.x; new code should use the suffixed
// IDs below. Every theme now has paired light/dark — pick the family
// here, the LightDarkToggle in the header flips the mode.
const THEMES: Theme[] = [
  { id: "boilerplate-light", label: "Boilerplate" },
  { id: "sketchbook-light",  label: "Sketchbook" },
  { id: "press-light",       label: "Press" },
  { id: "graphite-dark",     label: "Graphite" },
  { id: "glass-light",       label: "Glass" },
  { id: "cupertino-light",   label: "Cupertino" },
  { id: "prism-light",       label: "Prism" },
  { id: "terminal-dark",     label: "Terminal" },
];

// Match by family so the pressed state survives a light/dark flip
// (sketchbook-dark still shows Sketchbook as active). Clicking a family
// preserves the current mode to match ThemeSelect's behavior.
function family(theme: string): string {
  return theme.replace(/-(light|dark)$/, "");
}

const ALIAS_MODE: Record<string, "light" | "dark"> = {
  boilerplate: "light", sketchbook: "light", press: "light", graphite: "dark",
  glass: "light", cupertino: "light", prism: "light", terminal: "dark",
};

function mode(theme: string): "light" | "dark" {
  if (theme.endsWith("-dark")) return "dark";
  if (theme.endsWith("-light")) return "light";
  return ALIAS_MODE[theme] ?? "light";
}

export default function ThemePicker({
  hideAtDockWidths = false,
}: {
  // Docs routes ship the DocsDock below 1024px, whose Theme sheet covers
  // theme switching there — the floating picker bows out at those widths.
  hideAtDockWidths?: boolean;
} = {}) {
  const active = useThemeAttribute() ?? "sketchbook-light";
  const activeFamily = family(active);
  const activeMode = mode(active);

  // Phones: the panel starts collapsed behind a small corner disc so it
  // doesn't sit over the content. Desktop ignores the toggle entirely
  // (it's display:none there and the panel is always open).
  const [open, setOpen] = useState(false);

  return (
    <div
      className={hideAtDockWidths ? `${styles.picker} ${styles.yieldToDock}` : styles.picker}
      aria-label="Theme picker"
    >
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls="theme-picker-panel"
        aria-label="Choose a theme"
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true">🎨</span>
      </button>
      <div id="theme-picker-panel" className={styles.panel}>
        <div className={styles.label}>
          <span aria-hidden="true">🎨</span> Theme
        </div>
        <div className={styles.row}>
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={family(t.id) === activeFamily}
              onClick={() => setTheme(`${family(t.id)}-${activeMode}`)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
