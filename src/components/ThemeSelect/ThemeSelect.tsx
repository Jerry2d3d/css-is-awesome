"use client";
import styles from "./ThemeSelect.module.scss";
import { setTheme, useThemeAttribute } from "@/lib/themeState";

// Compact theme-family picker for the global header. Pairs with
// LightDarkToggle: this picks the family (Sketchbook, Press, Prism, …)
// while the toggle flips light/dark within that family. The user's
// current mode is preserved when they switch families — Prism Dark
// → Sketchbook lands on Sketchbook Dark, not Sketchbook Light.
//
// For the bigger row-of-buttons picker used inside docs pages, see
// src/components/ThemePicker/.

const FAMILIES: { id: string; label: string }[] = [
  { id: "boilerplate", label: "Boilerplate" },
  { id: "sketchbook",  label: "Sketchbook" },
  { id: "press",       label: "Press" },
  { id: "graphite",    label: "Graphite" },
  { id: "glass",       label: "Glass" },
  { id: "cupertino",   label: "Cupertino" },
  { id: "terminal",    label: "Terminal" },
  { id: "prism",       label: "Prism" },
];

// Defaults for the deprecated v0.6 unsuffixed names so we can infer
// "what mode is this on" from the legacy alias.
const ALIAS_MODE: Record<string, "light" | "dark"> = {
  boilerplate: "light",
  sketchbook:  "light",
  press:       "light",
  graphite:    "dark",
  glass:       "light",
  cupertino:   "light",
  terminal:    "dark",
};

function getFamily(theme: string): string {
  return theme.replace(/-(light|dark)$/, "");
}

function getMode(theme: string): "light" | "dark" {
  if (theme.endsWith("-dark")) return "dark";
  if (theme.endsWith("-light")) return "light";
  return ALIAS_MODE[theme] ?? "light";
}

export default function ThemeSelect() {
  const theme = useThemeAttribute();

  if (theme === null) {
    return (
      <select
        className={styles.select}
        aria-hidden="true"
        tabIndex={-1}
        disabled
      >
        <option>—</option>
      </select>
    );
  }

  const family = getFamily(theme);
  const mode = getMode(theme);

  function choose(nextFamily: string) {
    // Preserve current mode when switching families. Every shipped theme
    // has both modes, so <family>-<mode> always resolves.
    setTheme(`${nextFamily}-${mode}`);
  }

  return (
    <select
      className={styles.select}
      value={family}
      onChange={(e) => choose(e.target.value)}
      aria-label="Choose theme family"
      title="Choose theme family"
    >
      {FAMILIES.map((f) => (
        <option key={f.id} value={f.id}>
          {f.label}
        </option>
      ))}
    </select>
  );
}
