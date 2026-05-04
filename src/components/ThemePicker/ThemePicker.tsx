"use client";

import styles from "./ThemePicker.module.scss";
import { useEffect, useState } from "react";

type Theme = { id: string; label: string };

// Theme IDs use the v0.7 `-light`/`-dark` suffix convention. The
// unsuffixed v0.6 names (`sketchbook`, `press`, `graphite`, `glass`,
// `cupertino`) still resolve via the alias selectors in
// public/theme.css through 0.7.x; new code should use the suffixed
// IDs below. Every theme now has paired light/dark — pick the family
// here, the LightDarkToggle in the header flips the mode.
const THEMES: Theme[] = [
  { id: "sketchbook-light", label: "Sketchbook" },
  { id: "press-light",      label: "Press" },
  { id: "graphite-dark",    label: "Graphite" },
  { id: "glass-light",      label: "Glass" },
  { id: "cupertino-light",  label: "Cupertino" },
  { id: "terminal-dark",    label: "Terminal" },
];

const COOKIE_NAME = "cia-theme";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function applyTheme(id: string) {
  document.documentElement.setAttribute("data-theme", id);
  document.cookie = `${COOKIE_NAME}=${id}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export default function ThemePicker() {
  // Initial state mirrors what SSR rendered — read the attribute the server
  // already set from the cookie. Avoids hydration mismatch and FOUC.
  const [active, setActive] = useState<string>("sketchbook-light");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme") ?? "sketchbook-light";
    setActive(current);
  }, []);

  function choose(id: string) {
    setActive(id);
    applyTheme(id);
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
