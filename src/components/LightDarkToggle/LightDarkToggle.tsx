"use client";
import { useEffect, useState } from "react";
import styles from "./LightDarkToggle.module.scss";

// Keep in sync with the inline pre-hydration script documented in AGENTS.md.
const STORAGE_KEY = "cia-theme";

// Themes whose name does NOT carry a -light / -dark suffix but which are
// intrinsically one mode by design. Currently empty — all shipped themes
// have both modes. Reserved for future single-mode designs.
const SINGLE_MODE_DARK = new Set<string>([]);
const SINGLE_MODE_LIGHT = new Set<string>([]);

// Deprecated unsuffixed names that remain backward-compatible through 0.7.x
// (US-2.14.3). When the user is on a deprecated alias, classify and toggle
// against its canonical suffixed equivalent so the toggle still works.
const ALIAS_TO_CANONICAL: Record<string, string> = {
  sketchbook: "sketchbook-light",
  press: "press-light",
  graphite: "graphite-dark",
  glass: "glass-light",
  cupertino: "cupertino-light",
  terminal: "terminal-dark",
};

function canonical(theme: string): string {
  return ALIAS_TO_CANONICAL[theme] ?? theme;
}

function classifyMode(theme: string): { isDark: boolean; isLight: boolean } {
  const t = canonical(theme);
  if (t.endsWith("-dark") || SINGLE_MODE_DARK.has(t)) {
    return { isDark: true, isLight: false };
  }
  if (t.endsWith("-light") || SINGLE_MODE_LIGHT.has(t)) {
    return { isDark: false, isLight: true };
  }
  // Unknown / un-suffixed theme that isn't in our registry — treat as
  // light by default so the icon defaults to the sun.
  return { isDark: false, isLight: true };
}

function canToggle(theme: string): boolean {
  const t = canonical(theme);
  if (SINGLE_MODE_DARK.has(t) || SINGLE_MODE_LIGHT.has(t)) return false;
  return t.endsWith("-light") || t.endsWith("-dark");
}

function nextThemeName(theme: string, isDark: boolean): string {
  // Always toggle against the canonical name — if a user is on the
  // deprecated alias `terminal`, the next theme is terminal-light, not
  // an undefined `terminal-dark`-but-spelled-without-suffix.
  const t = canonical(theme);
  return isDark
    ? t.replace(/-dark$/, "-light")
    : t.replace(/-light$/, "-dark");
}

export default function LightDarkToggle() {
  // null on first render (server) and the actual theme name after hydration.
  // Avoids a flash where the icon shows the wrong direction before we read
  // <html data-theme>.
  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    const current =
      document.documentElement.dataset.theme || "sketchbook-light";
    setTheme(current);
  }, []);

  // Pre-hydration placeholder (keeps layout from shifting).
  if (theme === null) {
    return (
      <button
        type="button"
        className={styles.button}
        aria-hidden="true"
        tabIndex={-1}
      />
    );
  }

  const { isDark } = classifyMode(theme);
  const togglable = canToggle(theme);
  const next = nextThemeName(theme, isDark);

  const handleClick = () => {
    if (!togglable) return;
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage unavailable (Safari private mode etc.) — silently skip.
    }
    setTheme(next);
  };

  // Icon represents the CURRENT mode (sun = light, moon = dark). When the
  // toggle is enabled, clicking flips to the opposite mode. When disabled
  // (single-mode theme), the icon still tells you what mode you're in.
  const icon = isDark ? "☾" : "☀";
  const label = togglable
    ? `Currently ${isDark ? "dark" : "light"} — click for ${isDark ? "light" : "dark"} mode`
    : `${theme} is single-mode by design`;

  return (
    <button
      type="button"
      className={styles.button}
      onClick={handleClick}
      disabled={!togglable}
      aria-label={label}
      title={label}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}
