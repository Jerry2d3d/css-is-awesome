"use client";
import { useId } from "react";
import styles from "./ThemeSelect.module.scss";
import PaletteIcon from "@/components/PaletteIcon";
import { setTheme, useThemeAttribute } from "@/lib/themeState";

// Compact theme-family picker for the global header. Pairs with
// LightDarkToggle: this picks the family (Sketchbook, Press, Prism, …)
// while the toggle flips light/dark within that family. The user's
// current mode is preserved when they switch families — Prism Dark
// → Sketchbook lands on Sketchbook Dark, not Sketchbook Light.
//
// Rewritten from a native <select>: browsers own a select's open list
// (padding/colors are unreliable, and DevTools device mode renders the
// desktop list), so this is now a Popover-API menu — the same zero-JS
// open/close machinery as cia's mobile-nav recipe. The browser manages
// aria-expanded on the trigger, Esc and outside-tap close, and each
// option hides the popover natively via popovertargetaction="hide".
// The only JavaScript is the theme write itself.
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
  const menuId = useId();

  if (theme === null) {
    return (
      <span className={styles.wrap}>
        <button type="button" className={styles.trigger} disabled aria-hidden="true" tabIndex={-1}>
          <PaletteIcon className={styles.triggerIcon} />
          <span className={styles.triggerLabel}>Theme</span>
          <span className={styles.chevron} aria-hidden="true" />
        </button>
      </span>
    );
  }

  const family = getFamily(theme);
  const mode = getMode(theme);
  const currentLabel = FAMILIES.find((f) => f.id === family)?.label ?? "Theme";

  function choose(nextFamily: string) {
    // Preserve current mode when switching families. Every shipped theme
    // has both modes, so <family>-<mode> always resolves.
    setTheme(`${nextFamily}-${mode}`);
  }

  return (
    <span className={styles.wrap}>
      <button
        type="button"
        className={styles.trigger}
        popoverTarget={menuId}
        aria-label="Choose theme family"
        title="Choose theme family"
      >
        <PaletteIcon className={styles.triggerIcon} />
        <span className={styles.triggerLabel}>{currentLabel}</span>
        <span className={styles.chevron} aria-hidden="true" />
      </button>

      <div
        id={menuId}
        popover="auto"
        className={styles.menu}
        role="group"
        aria-label="Theme family"
      >
        <div className={styles.menuTitle} aria-hidden="true">theme</div>
        {FAMILIES.map((f) => (
          <button
            key={f.id}
            type="button"
            popoverTarget={menuId}
            popoverTargetAction="hide"
            aria-pressed={f.id === family}
            onClick={() => choose(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>
    </span>
  );
}
