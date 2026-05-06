"use client";
import { useEffect, useState } from "react";

// Shared persistence + cross-component sync for the three theme controls
// (ThemePicker floater, ThemeSelect dropdown, LightDarkToggle button).
//
// Persistence: cookie, so the inline pre-hydration script in layout.tsx
// can read it server-side or before first paint and avoid FOUC.
//
// Cross-control sync: useThemeAttribute() observes <html data-theme>
// via MutationObserver, so any control that calls setTheme() causes
// the other mounted controls to re-render with the new value.

const COOKIE_NAME = "cia-theme";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const DEFAULT_THEME = "sketchbook-light";

export function setTheme(id: string): void {
  document.documentElement.setAttribute("data-theme", id);
  document.cookie = `${COOKIE_NAME}=${id}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

// Returns null until hydration so SSR markup matches the server render.
export function useThemeAttribute(): string | null {
  const [theme, setLocal] = useState<string | null>(null);

  useEffect(() => {
    const html = document.documentElement;
    const read = () => setLocal(html.dataset.theme || DEFAULT_THEME);
    read();
    const observer = new MutationObserver(read);
    observer.observe(html, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return theme;
}
