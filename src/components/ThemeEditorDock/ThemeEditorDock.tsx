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
import { ColorRow, FontRow, LengthRow, NumberRow, StringRow } from "./rows";
import { setTheme, useThemeAttribute } from "@/lib/themeState";
import {
  extractDataThemeBlocks,
  extractRootBlock,
  isConsolidated,
  type ParsedBlock,
} from "@/lib/theme-parse";
import {
  copyShareLink,
  decodePayload,
  encodePayload,
  getShareParam,
  hasAnyOverrides,
  setShareParam,
  type SharePayload,
} from "@/lib/theme-share";

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
  glass: "light", cupertino: "light", prism: "light", terminal: "dark",
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

// Resolve a token's per-mode values from overrides + defaults, then emit:
// - "missing default" sentinel if both modes are empty
// - single bare value if both modes match (or only one is set)
// - light-dark() wrapper for COLOR tokens that differ between modes
// - bare light value + collected dark override (for non-color tokens that
//   differ — caller injects them into a nested @media block)
function emitTokenLines(
  defaults: { light: Record<string, string>; dark: Record<string, string> },
  overrides: { light: Record<string, string>; dark: Record<string, string> },
): { tokenLines: string[]; darkOverrideLines: string[] } {
  const tokenLines: string[] = [];
  const darkOverrideLines: string[] = [];

  for (const spec of CATALOG) {
    const lightV = overrides.light[spec.token] || defaults.light[spec.token] || "";
    const darkV = overrides.dark[spec.token] || defaults.dark[spec.token] || "";

    if (!lightV && !darkV) {
      tokenLines.push(`  ${spec.token}: ;  /* missing default */`);
      continue;
    }
    if (lightV === darkV || !darkV) {
      tokenLines.push(`  ${spec.token}: ${lightV};`);
      continue;
    }
    if (!lightV) {
      tokenLines.push(`  ${spec.token}: ${darkV};`);
      continue;
    }
    // Light and dark differ
    if (spec.type === "color") {
      tokenLines.push(`  ${spec.token}: light-dark(${lightV}, ${darkV});`);
    } else {
      tokenLines.push(`  ${spec.token}: ${lightV};`);
      darkOverrideLines.push(`    ${spec.token}: ${darkV};`);
    }
  }

  return { tokenLines, darkOverrideLines };
}

// Build a complete v0.8-conformant theme.css. Color tokens differing between
// modes use light-dark(); non-color differences emit a nested @media block.
// Output passes the validator standalone and matches the shape of every
// shipped theme at public/themes/<name>/theme.css.
function buildDownloadCSS(
  name: string,
  family: string,
  defaults: { light: Record<string, string>; dark: Record<string, string> },
  overrides: { light: Record<string, string>; dark: Record<string, string> },
): string {
  const { tokenLines, darkOverrideLines } = emitTokenLines(defaults, overrides);
  const stamp = new Date().toISOString().slice(0, 10);
  // Emit `:root, :root[data-theme="<name>"]` — the same selector every shipped
  // theme uses. The bare :root is what makes a drop-in work with NO markup
  // change; the attribute form keeps it switchable alongside other themes.
  // Emitting only the attribute form (as this did) produced a file that
  // rendered nothing unless the user also hand-edited <html data-theme>.
  const selector = `:root, :root[data-theme="${name}"]`;
  const header =
    `/*\n` +
    ` * ${name} — generated ${stamp} via the css-is-awesome theme editor\n` +
    ` * Forked from "${family}".\n` +
    ` *\n` +
    ` * Drop in as theme.css — no markup change needed.\n` +
    ` * To switch between several themes, load them together and set\n` +
    ` *   <html data-theme="${name}">\n` +
    ` */\n\n`;
  let body =
    `${selector} {\n  color-scheme: light dark;\n${tokenLines.join("\n")}\n}\n`;
  if (darkOverrideLines.length) {
    body +=
      `\n@media (prefers-color-scheme: dark) {\n  ${selector} {\n${darkOverrideLines.join("\n")}\n  }\n}\n`;
  }
  return header + body;
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

  // ----- Share via URL -----------------------------------------------------
  // On mount: if the URL carries a `?t=...` payload, decode it. If the
  // sender's family differs from the current page family, switch to it via
  // setTheme() and stash the overrides in a ref; the family-change effect
  // below picks them up once family has settled. Same-family case applies
  // overrides immediately.
  const pendingShare = useRef<SharePayload | null>(null);
  useEffect(() => {
    const param = getShareParam();
    if (!param) return;
    decodePayload(param)
      .then((payload) => {
        if (payload.f !== family) {
          pendingShare.current = payload;
          setTheme(`${payload.f}-${currentMode}`);
        } else {
          setOverrides({ light: payload.l, dark: payload.d });
          setNameInput(`${payload.f}-shared`);
        }
      })
      .catch((err) => {
        setImportMsg({
          kind: "err",
          text: `Share URL decode failed: ${err instanceof Error ? err.message : String(err)}`,
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When family changes (e.g. after the mount-share switched the page
  // theme), apply any pending share overrides ONCE the new family is
  // active. Runs after the family effect above, so the localStorage
  // overrides it sets get superseded by the URL-supplied ones.
  useEffect(() => {
    const pending = pendingShare.current;
    if (pending && pending.f === family) {
      setOverrides({ light: pending.l, dark: pending.d });
      setNameInput(`${pending.f}-shared`);
      pendingShare.current = null;
    }
  }, [family]);

  // Write the current state to the URL whenever overrides change. Debounced
  // 300ms so typing doesn't thrash history.replaceState.
  const writeUrlTimer = useRef<number | null>(null);
  useEffect(() => {
    if (writeUrlTimer.current !== null) {
      window.clearTimeout(writeUrlTimer.current);
    }
    writeUrlTimer.current = window.setTimeout(async () => {
      if (!hasAnyOverrides(overrides)) {
        setShareParam(null);
        return;
      }
      try {
        const encoded = await encodePayload({
          v: 1,
          f: family,
          l: overrides.light,
          d: overrides.dark,
        });
        setShareParam(encoded);
      } catch {
        // URL write failed (CompressionStream missing, etc.) — editor
        // still works, just no share URL until the user clicks Share.
      }
    }, 300);
    return () => {
      if (writeUrlTimer.current !== null) {
        window.clearTimeout(writeUrlTimer.current);
      }
    };
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

  // Copy a share URL to the clipboard. Flushes any pending debounced URL
  // write first so the copied URL always matches what's on screen, then
  // hands off to the clipboard helper.
  async function copyShare() {
    if (writeUrlTimer.current !== null) {
      window.clearTimeout(writeUrlTimer.current);
      writeUrlTimer.current = null;
    }
    try {
      if (hasAnyOverrides(overrides)) {
        const encoded = await encodePayload({
          v: 1,
          f: family,
          l: overrides.light,
          d: overrides.dark,
        });
        setShareParam(encoded);
      } else {
        setShareParam(null);
      }
      await copyShareLink();
      setImportMsg({
        kind: "ok",
        text: hasAnyOverrides(overrides)
          ? "Copied — recipients see your edited theme."
          : "Copied — share link uses the base theme (no overrides set).",
      });
    } catch (err) {
      setImportMsg({
        kind: "err",
        text: err instanceof Error ? err.message : "Share copy failed.",
      });
    }
  }

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importMsg, setImportMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  // Strip the -light / -dark suffix so the imported name reads like a base.
  function baseNameOf(themeName: string): string {
    return themeName.replace(/-(light|dark)$/i, "");
  }

  // Pick the best light+dark pair from a consolidated file:
  //   1. A pair sharing a base name that matches the active family.
  //   2. Otherwise the first complete pair.
  //   3. Otherwise the first block (single-mode import to active tab).
  function pickPair(blocks: ParsedBlock[]): {
    base: string;
    light?: ParsedBlock;
    dark?: ParsedBlock;
  } {
    const byBase = new Map<string, { light?: ParsedBlock; dark?: ParsedBlock }>();
    for (const b of blocks) {
      const name = b.name ?? "";
      const m = /^(.*)-(light|dark)$/i.exec(name);
      const base = m ? m[1] : name;
      const mode = (m ? m[2].toLowerCase() : null) as "light" | "dark" | null;
      const entry = byBase.get(base) ?? {};
      if (mode === "light") entry.light = b;
      else if (mode === "dark") entry.dark = b;
      else entry.light = entry.light ?? b; // unsuffixed: treat as light placeholder
      byBase.set(base, entry);
    }

    const familyMatch = byBase.get(family);
    if (familyMatch && (familyMatch.light || familyMatch.dark)) {
      return { base: family, ...familyMatch };
    }
    for (const [base, entry] of byBase) {
      if (entry.light && entry.dark) return { base, ...entry };
    }
    const first = blocks[0];
    return {
      base: baseNameOf(first.name ?? ""),
      light: tabMode === "light" ? first : undefined,
      dark: tabMode === "dark" ? first : undefined,
    };
  }

  function applyImport(baseName: string, light?: Map<string, string>, dark?: Map<string, string>) {
    const lightOut: Record<string, string> = {};
    const darkOut: Record<string, string> = {};
    if (light) for (const [k, v] of light) lightOut[k] = v;
    if (dark) for (const [k, v] of dark) darkOut[k] = v;
    setOverrides({ light: lightOut, dark: darkOut });
    if (baseName) setNameInput(baseName);
  }

  async function importTheme(file: File) {
    setImportMsg(null);
    try {
      const text = await file.text();
      if (!text.trim()) {
        setImportMsg({ kind: "err", text: "File is empty." });
        return;
      }
      if (isConsolidated(text)) {
        const blocks = extractDataThemeBlocks(text);
        if (blocks.length === 0) {
          setImportMsg({ kind: "err", text: 'No [data-theme="…"] blocks parsed.' });
          return;
        }
        const { base, light, dark } = pickPair(blocks);
        applyImport(base, light?.values, dark?.values);
        const which = light && dark ? "light + dark" : light ? "light only" : "dark only";
        setImportMsg({ kind: "ok", text: `Imported "${base}" (${which}, ${blocks.length} block${blocks.length === 1 ? "" : "s"} in file).` });
        return;
      }
      const block = extractRootBlock(text);
      if (block.values.size === 0) {
        setImportMsg({ kind: "err", text: "No --token declarations found in :root." });
        return;
      }
      const base = sanitizeName(nameInput, `${family}-custom`);
      applyImport(
        base,
        tabMode === "light" ? block.values : undefined,
        tabMode === "dark" ? block.values : undefined,
      );
      setImportMsg({
        kind: "ok",
        text: `Imported :root block into ${tabMode} mode (${block.values.size} tokens).`,
      });
    } catch (err) {
      setImportMsg({ kind: "err", text: err instanceof Error ? err.message : "Import failed." });
    }
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
      case "font":     return <FontRow key={spec.token} {...props} />;
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
            <input
              ref={fileInputRef}
              type="file"
              accept=".css,text/css"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importTheme(f);
                e.target.value = ""; // allow re-importing the same file
              }}
              aria-hidden="true"
            />
            <button
              type="button"
              className={styles.btn}
              onClick={() => fileInputRef.current?.click()}
              title="Upload an existing theme.css to keep editing"
            >
              ↑ Import
            </button>
            <button
              type="button"
              className={styles.btn}
              onClick={copyShare}
              title="Copy a URL that reproduces this exact theme for anyone you send it to"
            >
              ↗ Share
            </button>
            <button
              type="button"
              className={[styles.btn, styles.btnPrimary].join(" ")}
              onClick={download}
              title="Download the theme as a drop-in tokens-only .css file"
            >
              ↓ Download
            </button>
          </div>
          {importMsg && (
            <p
              role="status"
              aria-live="polite"
              style={{
                margin: "0.5rem 0 0",
                fontSize: "0.85rem",
                color: importMsg.kind === "err" ? "var(--error-text, #b00020)" : "var(--text-secondary)",
              }}
            >
              {importMsg.text}
            </p>
          )}
        </footer>
      </aside>
    </>
  );
}
