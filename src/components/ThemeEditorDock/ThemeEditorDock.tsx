"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./ThemeEditorDock.module.scss";
import {
  CATALOG,
  CATEGORIES,
  SUB_PAGES,
  type Category,
  type TokenSpec,
} from "./catalog";
import { ColorRow, LengthRow, NumberRow, StringRow } from "./rows";
import { setTheme, useThemeAttribute } from "@/lib/themeState";

type Mode = "light" | "dark";
const STYLE_TAG_ID = "cia-theme-overrides";
const STORAGE_KEY = "cia-theme-overrides";
// Paginate when a sub-page has more groups than this. Keeps the scroll
// short and gives users a reliable "next page" affordance once token
// counts grow.
const GROUPS_PER_PAGE = 4;

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

// CSS-identifier-safe theme name. Lowercase letters, digits, and hyphens.
function sanitizeName(input: string, fallback = "mytheme"): string {
  const cleaned = (input || "").toLowerCase().trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
  return cleaned || fallback;
}

// Build a complete cia-conformant theme.css. Every block contains every
// contract token so the output passes the validator standalone.
function buildDownloadCSS(
  name: string,
  family: string,
  defaults: { light: Record<string, string>; dark: Record<string, string> },
  overrides: { light: Record<string, string>; dark: Record<string, string> },
): string {
  function lines(mode: "light" | "dark"): string {
    return CATALOG.map((spec) => {
      const v = overrides[mode][spec.token] || defaults[mode][spec.token];
      return v ? `  ${spec.token}: ${v};` : `  ${spec.token}: ;  /* missing default */`;
    }).join("\n");
  }
  const stamp = new Date().toISOString().slice(0, 10);
  const header =
    `/*\n` +
    ` * ${name} — generated ${stamp} via the css-is-awesome theme editor\n` +
    ` * Forked from "${family}". Drop in as theme.css and use:\n` +
    ` *   <html data-theme="${name}-light">  or  data-theme="${name}-dark"\n` +
    ` */\n\n`;
  return (
    header +
    `[data-theme="${name}-light"] {\n${lines("light")}\n}\n\n` +
    `[data-theme="${name}-dark"] {\n${lines("dark")}\n}\n`
  );
}

function triggerDownload(filename: string, css: string): void {
  const blob = new Blob([css], { type: "text/css;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function ThemeEditorDock() {
  const activeTheme = useThemeAttribute() ?? "sketchbook-light";
  const family = getFamily(activeTheme);
  const currentMode = getMode(activeTheme);

  const [open, setOpen] = useState(false);
  // Tab follows the page's current mode and vice-versa.
  const [tabMode, setTabMode] = useState<Mode>(currentMode);
  useEffect(() => setTabMode(currentMode), [currentMode]);

  const [category, setCategory] = useState<Category>("color");
  const [subPageIdx, setSubPageIdx] = useState(0);
  const [pageIdx, setPageIdx] = useState(0);
  const subPages = SUB_PAGES[category];
  const allGroups = subPages[subPageIdx]?.groups ?? [];
  const totalPages = Math.max(1, Math.ceil(allGroups.length / GROUPS_PER_PAGE));
  const safePageIdx = Math.min(pageIdx, totalPages - 1);
  const visibleGroups = allGroups.slice(
    safePageIdx * GROUPS_PER_PAGE,
    (safePageIdx + 1) * GROUPS_PER_PAGE,
  );
  const [openGroup, setOpenGroup] = useState<string | null>(visibleGroups[0] ?? null);

  const bodyRef = useRef<HTMLDivElement | null>(null);
  const groupRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  // Category change: reset to first sub-page.
  useEffect(() => {
    setSubPageIdx(0);
  }, [category]);

  // Sub-page or category change: reset to page 0.
  useEffect(() => {
    setPageIdx(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, subPageIdx]);

  // Page change (covers all of the above too): reset open group to the
  // first on this page and scroll body to top.
  useEffect(() => {
    setOpenGroup(visibleGroups[0] ?? null);
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, subPageIdx, safePageIdx]);

  // When user clicks a group head to OPEN it, scroll its head to the top
  // of the body so the newly-revealed rows are immediately visible.
  function toggleGroup(groupName: string) {
    if (openGroup === groupName) {
      setOpenGroup(null);
      return;
    }
    setOpenGroup(groupName);
    requestAnimationFrame(() => {
      const el = groupRefs.current.get(groupName);
      const body = bodyRef.current;
      if (!el || !body) return;
      const elTop = el.offsetTop - body.offsetTop;
      body.scrollTo({ top: elTop, behavior: "smooth" });
    });
  }
  const [overrides, setOverrides] = useState<OverridesByMode>({ light: {}, dark: {} });
  const [defaultsByMode, setDefaultsByMode] = useState<OverridesByMode>({ light: {}, dark: {} });
  const [nameInput, setNameInput] = useState<string>("");
  // Default the name to "<family>-custom" whenever the family changes
  // and the user hasn't typed their own name yet.
  useEffect(() => setNameInput(`${family}-custom`), [family]);

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

  function download() {
    const safeName = sanitizeName(nameInput, `${family}-custom`);
    const css = buildDownloadCSS(safeName, family, defaultsByMode, overrides);
    triggerDownload(`${safeName}.css`, css);
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

        <div className={styles.catTabs} role="tablist" aria-label="Token category">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={category === c.id}
              className={[styles.catTab, category === c.id && styles.catTabActive].filter(Boolean).join(" ")}
              onClick={() => setCategory(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>

        {subPages.length > 1 && (
          <div className={styles.subTabs} role="tablist" aria-label="Section">
            {subPages.map((p, i) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={subPageIdx === i}
                className={[styles.subTab, subPageIdx === i && styles.subTabActive].filter(Boolean).join(" ")}
                onClick={() => setSubPageIdx(i)}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        <div className={styles.body} ref={bodyRef}>
          {visibleGroups.map((groupName) => {
            const isOpen = openGroup === groupName;
            const specs = byGroup.get(groupName) ?? [];
            return (
              <div
                key={groupName}
                ref={(el) => {
                  groupRefs.current.set(groupName, el);
                }}
                className={[styles.group, isOpen && styles.groupOpen].filter(Boolean).join(" ")}
              >
                <button
                  type="button"
                  className={styles.groupHead}
                  aria-expanded={isOpen}
                  onClick={() => toggleGroup(groupName)}
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

          {totalPages > 1 && (
            <nav className={styles.paginator} aria-label="Section pages">
              <button
                type="button"
                className={styles.pageBtn}
                onClick={() => setPageIdx(Math.max(0, safePageIdx - 1))}
                disabled={safePageIdx === 0}
                aria-label="Previous page"
              >
                ←
              </button>
              <span className={styles.pageStatus}>
                Page {safePageIdx + 1} of {totalPages}
              </span>
              <button
                type="button"
                className={styles.pageBtn}
                onClick={() => setPageIdx(Math.min(totalPages - 1, safePageIdx + 1))}
                disabled={safePageIdx >= totalPages - 1}
                aria-label="Next page"
              >
                →
              </button>
            </nav>
          )}
        </div>

        <footer className={styles.foot}>
          <label className={styles.nameRow}>
            <span className={styles.nameLabel}>Theme name</span>
            <input
              type="text"
              className={styles.nameInput}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              spellCheck={false}
              aria-label="Theme name for download"
            />
          </label>
          <div className={styles.btnRow}>
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
              onClick={download}
            >
              ↓ Download theme
            </button>
          </div>
        </footer>
      </aside>
    </>
  );
}
