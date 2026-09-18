// The 24 shipped themes: 8 families × (auto | light | dark). Kept as data
// so the picker, the localStorage default and the tests agree. `auto`
// themes use light-dark() and follow the preview's own colour scheme.
export const THEME_FAMILIES = [
  "sketchbook",
  "boilerplate",
  "press",
  "graphite",
  "glass",
  "cupertino",
  "prism",
  "terminal",
] as const;

export type ThemeMode = "auto" | "light" | "dark";

export function themeId(family: string, mode: ThemeMode): string {
  return mode === "auto" ? family : `${family}-${mode}`;
}

export const THEME_IDS: string[] = THEME_FAMILIES.flatMap((f) =>
  (["auto", "light", "dark"] as ThemeMode[]).map((m) => themeId(f, m)),
);

export const DEFAULT_THEME = "sketchbook";
export const THEME_STORAGE_KEY = "cia-playground-theme";

export function isThemeId(id: string): boolean {
  return THEME_IDS.includes(id);
}

export function themeLabel(id: string): string {
  const m = /^(.*?)(?:-(light|dark))?$/.exec(id);
  const family = m?.[1] ?? id;
  const mode = m?.[2] ?? "auto";
  return `${family[0].toUpperCase()}${family.slice(1)} · ${mode}`;
}
