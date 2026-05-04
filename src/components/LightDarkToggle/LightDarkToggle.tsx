"use client";
import { useEffect, useState } from "react";
import styles from "./LightDarkToggle.module.scss";

// Keep in sync with the inline pre-hydration script documented in AGENTS.md.
const STORAGE_KEY = "cia-theme";

// Themes whose name does NOT carry a -light / -dark suffix but which are
// intrinsically one mode by design. Terminal is dark-only (CRT phosphor).
// Add other single-mode themes here as they ship.
const SINGLE_MODE_DARK = new Set<string>(["terminal"]);
const SINGLE_MODE_LIGHT = new Set<string>([]);

function classifyMode(theme: string): { isDark: boolean; isLight: boolean } {
  if (theme.endsWith("-dark") || SINGLE_MODE_DARK.has(theme)) {
    return { isDark: true, isLight: false };
  }
  if (theme.endsWith("-light") || SINGLE_MODE_LIGHT.has(theme)) {
    return { isDark: false, isLight: true };
  }
  // Unknown / un-suffixed theme that isn't in our registry — treat as
  // light by default so the icon defaults to the sun.
  return { isDark: false, isLight: true };
}

function canToggle(theme: string): boolean {
  if (SINGLE_MODE_DARK.has(theme) || SINGLE_MODE_LIGHT.has(theme)) return false;
  return theme.endsWith("-light") || theme.endsWith("-dark");
}

function nextThemeName(theme: string, isDark: boolean): string {
  return isDark
    ? theme.replace(/-dark$/, "-light")
    : theme.replace(/-light$/, "-dark");
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
