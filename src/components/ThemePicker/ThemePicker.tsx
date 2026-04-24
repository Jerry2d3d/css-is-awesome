"use client";

import styles from "./ThemePicker.module.scss";
import { useEffect, useState } from "react";

type Theme = { id: string; label: string };

const THEMES: Theme[] = [
  { id: "sketchbook", label: "Sketchbook" },
  { id: "press",      label: "Press" },
  { id: "graphite",   label: "Graphite" },
  { id: "glass",      label: "Glass" },
  { id: "cupertino",  label: "Cupertino" },
  { id: "terminal",   label: "Terminal" },
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
  const [active, setActive] = useState<string>("sketchbook");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme") ?? "sketchbook";
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
