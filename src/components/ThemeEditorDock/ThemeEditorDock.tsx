"use client";
import { useEffect, useMemo, useState } from "react";
import styles from "./ThemeEditorDock.module.scss";
import { CATALOG, GROUPS, type TokenSpec } from "./catalog";
import { ColorRow, LengthRow, NumberRow, StringRow } from "./rows";
import { setTheme, useThemeAttribute } from "@/lib/themeState";

type Mode = "light" | "dark";
const STYLE_TAG_ID = "cia-theme-overrides";
const STORAGE_KEY = "cia-theme-overrides";

// Per-family overrides. Persisted to localStorage so each family
// remembers its edits independently.
type OverridesByMode = { light: Record<string, string>; dark: Record<string, string> };
type OverridesStore = Record<string, OverridesByMode>;

function readStore(): OverridesStore {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}
function writeStore(store: OverridesStore): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // quota / private mode — silently skip
  }
}

const ALIAS_MODE: Record<string, Mode> = {
  sketchbook: "light", press: "light", graphite: "dark",
  glass: "light", cupertino: "light", terminal: "dark",
};

function getFamily(theme: string): string {
  return theme.replace(/-(light|dark)$/, "");
}
function getMode(theme: string): Mode {
  if (theme.endsWith("-dark")) return "dark";
  if (theme.endsWith("-light")) return "light";
  return ALIAS_MODE[theme] ?? "light";
}

// Build the override <style> string from current overrides.
function buildCSS(family: string, ov: OverridesByMode): string {
  const lightLines = Object.entries(ov.light).map(([k, v]) => `  ${k}: ${v};`);
  const darkLines = Object.entries(ov.dark).map(([k, v]) => `  ${k}: ${v};`);
  let css = "";
  if (lightLines.length) {
    css += `[data-theme="${family}-light"] {\n${lightLines.join("\n")}\n}\n`;
  }
  if (darkLines.length) {
    css += `[data-theme="${family}-dark"] {\n${darkLines.join("\n")}\n}\n`;
  }
  return css;
}

function getStyleTag(): HTMLStyleElement {
  let el = document.getElementById(STYLE_TAG_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = STYLE_TAG_ID;
    document.head.appendChild(el);
  }
  return el;
}

// Read computed default for a token in a given mode of the active family.
// Uses an off-screen probe div with the right data-theme set.
function readDefault(token: string, themeId: string): string {
  if (typeof document === "undefined") return "";
  const probe = document.createElement("div");
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  probe.setAttribute("data-theme", themeId);
  document.body.appendChild(probe);
  const v = getComputedStyle(probe).getPropertyValue(token).trim();
  probe.remove();
  return v;
}

export default function ThemeEditorDock() {
  const activeTheme = useThemeAttribute() ?? "sketchbook-light";
  const family = getFamily(activeTheme);
  const currentMode = getMode(activeTheme);

  const [open, setOpen] = useState(false);
  // Tab follows the page's current mode and vice-versa.
  const [tabMode, setTabMode] = useState<Mode>(currentMode);
  useEffect(() => setTabMode(currentMode), [currentMode]);

  const [openGroup, setOpenGroup] = useState<string | null>(GROUPS[0] ?? null);
  const [overrides, setOverrides] = useState<OverridesByMode>({ light: {}, dark: {} });
  const [defaultsByMode, setDefaultsByMode] = useState<OverridesByMode>({ light: {}, dark: {} });

  // Family changed: clear the style tag, read fresh defaults against the
  // unmodified theme, then load THIS family's persisted overrides (if any).
  useEffect(() => {
    getStyleTag().textContent = "";
    const out: OverridesByMode = { light: {}, dark: {} };
    for (const spec of CATALOG) {
      out.light[spec.token] = readDefault(spec.token, `${family}-light`);
      out.dark[spec.token] = readDefault(spec.token, `${family}-dark`);
    }
    setDefaultsByMode(out);

    const store = readStore();
    const stored = store[family];
    setOverrides(
      stored && typeof stored === "object"
        ? { light: stored.light ?? {}, dark: stored.dark ?? {} }
        : { light: {}, dark: {} }
    );
  }, [family]);

  // Apply overrides to the document AND persist them whenever they change.
  useEffect(() => {
    const css = buildCSS(family, overrides);
    getStyleTag().textContent = css;

    const store = readStore();
    if (Object.keys(overrides.light).length === 0 && Object.keys(overrides.dark).length === 0) {
      delete store[family];
    } else {
      store[family] = overrides;
    }
    writeStore(store);
  }, [overrides, family]);

  function commit(spec: TokenSpec, value: string) {
    setOverrides((prev) => {
      if (spec.mode === "shared") {
        return {
          light: { ...prev.light, [spec.token]: value },
          dark: { ...prev.dark, [spec.token]: value },
        };
      }
      // Per-mode: write only into the active tab's bucket.
      return { ...prev, [tabMode]: { ...prev[tabMode], [spec.token]: value } };
    });
  }

  function onTabClick(m: Mode) {
    setTabMode(m);
    // Sync the page's data-theme so "what you see is what you edit."
    setTheme(`${family}-${m}`);
  }

  function reset() {
    setOverrides({ light: {}, dark: {} });
  }

  const hasOverrides =
    Object.keys(overrides.light).length > 0 || Object.keys(overrides.dark).length > 0;

  // Group catalog so each section's rows render contiguously.
  const byGroup = useMemo(() => {
    const map = new Map<string, TokenSpec[]>();
    for (const spec of CATALOG) {
      const arr = map.get(spec.group) ?? [];
      arr.push(spec);
      map.set(spec.group, arr);
    }
    return map;
  }, []);

  function rowFor(spec: TokenSpec) {
    const bucket = spec.mode === "shared" ? overrides.light : overrides[tabMode];
    const value = bucket[spec.token] ?? "";
    const defaultBucket = spec.mode === "shared" ? defaultsByMode.light : defaultsByMode[tabMode];
    const defaultValue = defaultBucket[spec.token] ?? "";

    const props = {
      spec,
      value,
      defaultValue,
      onCommit: (v: string) => commit(spec, v),
    };

    switch (spec.type) {
      case "color":    return <ColorRow key={spec.token} {...props} />;
      case "length":   return <LengthRow key={spec.token} {...props} />;
      case "duration": return <LengthRow key={spec.token} {...props} />;
      case "number":   return <NumberRow key={spec.token} {...props} />;
      case "string":   return <StringRow key={spec.token} {...props} />;
    }
  }

  return (
    <>
      <button
        type="button"
        className={styles.pill}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="theme-editor-dock"
      >
        <span className={styles.pillDot} aria-hidden="true" />
        Edit theme
        {hasOverrides && <span className={styles.modBadge} aria-label="modified">●</span>}
      </button>

      <aside
        id="theme-editor-dock"
        className={[styles.panel, open && styles.open].filter(Boolean).join(" ")}
        aria-label="Theme editor"
        aria-hidden={!open}
      >
        <header className={styles.head}>
          <div>
            <h2 className={styles.title}>
              Theme editor
              {hasOverrides && <span className={styles.titleBadge}>modified</span>}
            </h2>
            <p className={styles.sub}>
              Editing <strong>{family}</strong> · live preview
            </p>
          </div>
          <button
            type="button"
            className={styles.close}
            onClick={() => setOpen(false)}
            aria-label="Close theme editor"
          >
            ×
          </button>
        </header>

        <div className={styles.tabs} role="tablist" aria-label="Mode">
          {(["light", "dark"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={tabMode === m}
              className={[styles.tab, tabMode === m && styles.tabActive].filter(Boolean).join(" ")}
              onClick={() => onTabClick(m)}
            >
              {m === "light" ? "☀ Light" : "☾ Dark"}
            </button>
          ))}
        </div>

        <div className={styles.body}>
          {GROUPS.map((groupName) => {
            const isOpen = openGroup === groupName;
            const specs = byGroup.get(groupName) ?? [];
            return (
              <div
                key={groupName}
                className={[styles.group, isOpen && styles.groupOpen].filter(Boolean).join(" ")}
              >
                <button
                  type="button"
                  className={styles.groupHead}
                  aria-expanded={isOpen}
                  onClick={() => setOpenGroup(isOpen ? null : groupName)}
                >
                  <span>
                    {groupName}{" "}
                    <span className={styles.groupCount}>{specs.length}</span>
                  </span>
                  <span className={styles.caret} aria-hidden="true">▶</span>
                </button>
                {isOpen && (
                  <div className={styles.groupBody}>
                    {specs.map((spec) => rowFor(spec))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <footer className={styles.foot}>
          <button
            type="button"
            className={styles.btn}
            onClick={reset}
            disabled={!hasOverrides}
          >
            Reset
          </button>
          <button
            type="button"
            className={[styles.btn, styles.btnPrimary].join(" ")}
            disabled
            title="Download lands in Phase 5"
          >
            ↓ Download theme
          </button>
        </footer>
      </aside>
    </>
  );
}
