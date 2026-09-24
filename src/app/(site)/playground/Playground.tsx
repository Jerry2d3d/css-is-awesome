"use client";
// ============================================================================
// /playground — paste SCSS that uses cia mixins, see it render live against
// any shipped theme, share it as a URL. Tailwind Play, for mixin authoring.
//
// Everything is client-side: dart-sass runs in a worker (compiler.ts), the
// editors are CodeMirror (CodeEditor.tsx), the preview is a sandboxed iframe
// fed by srcdoc. No server, no accounts — the static export stays static.
// ============================================================================
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./playground.module.scss";
import CodeEditor, { type CodeEditorRef } from "./CodeEditor";
import { PlaygroundCompiler, type CompileResult } from "./compiler";
import { asset } from "@/lib/asset";
import { decodeState, encodeState, hashFromPayload, payloadFromHash } from "@/lib/playground/hash";
import { DEFAULT_THEME, THEME_IDS, THEME_STORAGE_KEY, isThemeId, themeLabel } from "./themes";
import { STARTER_HTML, STARTER_SCSS } from "./starter";

const COMPILE_DEBOUNCE_MS = 200;
const HASH_DEBOUNCE_MS = 500;

type CompileError = { message: string; line: number | null; column: number | null };

// The preview never runs scripts (sandbox="" — no allow-scripts, no
// allow-same-origin), but a pasted <script> would still be inert noise in
// the DOM, so drop it before injection.
function stripScripts(html: string): string {
  return html.replace(/<script\b[\s\S]*?<\/script\s*>/gi, "").replace(/<script\b[^>]*\/?>/gi, "");
}

function buildSrcdoc(themeId: string, themeCss: string, userCss: string, html: string): string {
  const scheme = themeId.endsWith("-dark") ? "dark" : themeId.endsWith("-light") ? "light" : "light dark";
  return `<!doctype html>
<html lang="en" data-theme="${themeId}">
<head>
<meta charset="utf-8">
<meta name="color-scheme" content="${scheme}">
<style data-role="theme">${themeCss}</style>
<style data-role="base">
  html { color-scheme: ${scheme}; }
  body { margin: 0; padding: 1.5rem; font-family: var(--font-primary, system-ui, sans-serif); color: var(--text-primary, CanvasText); background: var(--surface-default, Canvas); }
  *, *::before, *::after { box-sizing: border-box; }
</style>
<style data-role="user">${userCss}</style>
</head>
<body>${stripScripts(html)}</body>
</html>`;
}

function readStoredTheme(): string {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    if (v && isThemeId(v)) return v;
  } catch {
    /* private mode etc. */
  }
  return DEFAULT_THEME;
}

export default function Playground() {
  const [html, setHtml] = useState(STARTER_HTML);
  const [scss, setScss] = useState(STARTER_SCSS);
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [themeCss, setThemeCss] = useState("");
  const [css, setCss] = useState(""); // last GOOD css
  const [error, setError] = useState<CompileError | null>(null);
  const [compileMs, setCompileMs] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("");
  const [ready, setReady] = useState(false);

  const compiler = useRef<PlaygroundCompiler | null>(null);
  const htmlEditor = useRef<CodeEditorRef>(null);
  const scssEditor = useRef<CodeEditorRef>(null);
  const themeCache = useRef(new Map<string, string>());
  const hydrated = useRef(false);

  // ── Boot: worker, stored theme, shared state from the URL hash ──────────
  useEffect(() => {
    compiler.current = new PlaygroundCompiler(asset("/playground/scss-map.json"));

    (async () => {
      let nextTheme = readStoredTheme();
      const payload = payloadFromHash(window.location.hash);
      if (payload) {
        const shared = await decodeState(payload);
        if (shared) {
          setHtml(shared.h);
          setScss(shared.s);
          htmlEditor.current?.setValue(shared.h);
          scssEditor.current?.setValue(shared.s);
          if (shared.t && isThemeId(shared.t)) nextTheme = shared.t;
        } else {
          setStatus("That share link couldn't be read — loaded the starter instead.");
          history.replaceState(null, "", window.location.pathname + window.location.search);
        }
      }
      setTheme(nextTheme);
      hydrated.current = true;
      setReady(true);
    })();

    return () => {
      compiler.current?.dispose();
      compiler.current = null;
    };
  }, []);

  // ── Theme CSS: fetch once per theme, remember the choice ────────────────
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
    const cached = themeCache.current.get(theme);
    if (cached !== undefined) {
      setThemeCss(cached);
      return;
    }
    fetch(asset(`/themes/${theme}/theme.css`))
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
      .then((text) => {
        themeCache.current.set(theme, text);
        if (!cancelled) setThemeCss(text);
      })
      .catch(() => {
        if (!cancelled) setStatus(`Couldn't load the ${theme} theme.`);
      });
    return () => {
      cancelled = true;
    };
  }, [theme, ready]);

  // ── Compile on SCSS change (debounced) ──────────────────────────────────
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => {
      compiler.current?.compile(scss).then((r: CompileResult) => {
        if (r.ok) {
          setCss(r.css);
          setError(null);
          setCompileMs(r.ms);
        } else {
          setError({ message: r.message, line: r.line, column: r.column });
        }
      });
    }, COMPILE_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [scss, ready]);

  // ── Keep the URL hash in sync ───────────────────────────────────────────
  // Typing is debounced (slower than compile); a theme change writes at once
  // so a reload right after picking a theme never resurrects the old one
  // from a stale hash.
  // One effect, one timer: any pending write is cancelled by the next change,
  // so a stale snapshot can never land after a fresher one.
  const hashSeq = useRef(0);
  const lastTheme = useRef(theme);
  useEffect(() => {
    if (!hydrated.current) return;
    const themeChanged = lastTheme.current !== theme;
    lastTheme.current = theme;
    const seq = ++hashSeq.current;
    const t = setTimeout(async () => {
      const payload = await encodeState({ h: html, s: scss, t: theme });
      if (seq !== hashSeq.current) return; // superseded while encoding
      history.replaceState(null, "", hashFromPayload(payload));
    }, themeChanged ? 0 : HASH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [html, scss, theme]);

  const srcdoc = useMemo(() => buildSrcdoc(theme, themeCss, css, html), [theme, themeCss, css, html]);

  // ── Actions ─────────────────────────────────────────────────────────────
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyShareLink = useCallback(async () => {
    const payload = await encodeState({ h: html, s: scss, t: theme });
    const hash = hashFromPayload(payload);
    history.replaceState(null, "", hash);
    const url = `${window.location.origin}${window.location.pathname}${hash}`;
    const fallback = () => {
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } finally {
        document.body.removeChild(ta);
      }
    };
    await Promise.resolve()
      .then(() => navigator.clipboard?.writeText(url) ?? Promise.reject())
      .catch(fallback);
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 1500);
  }, [html, scss, theme]);

  const reset = useCallback(() => {
    setHtml(STARTER_HTML);
    setScss(STARTER_SCSS);
    htmlEditor.current?.setValue(STARTER_HTML);
    scssEditor.current?.setValue(STARTER_SCSS);
    setStatus("");
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }, []);

  const jumpToError = useCallback(() => {
    if (error?.line) scssEditor.current?.jumpTo(error.line, error.column ?? 1);
  }, [error]);

  return (
    <div className={styles.playground} data-ready={ready || undefined}>
      <div className={styles.toolbar}>
        <label className={styles.themeField}>
          <span>Theme</span>
          <select
            className={styles.themeSelect}
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            aria-label="Preview theme"
          >
            {THEME_IDS.map((id) => (
              <option key={id} value={id}>
                {themeLabel(id)}
              </option>
            ))}
          </select>
        </label>
        <div className={styles.actions}>
          <button type="button" className={styles.btnPrimary} onClick={copyShareLink} data-copied={copied || undefined}>
            {copied ? "Copied" : "Copy share link"}
          </button>
          <button type="button" className={styles.btnGhost} onClick={reset}>
            Reset
          </button>
        </div>
        <p className={styles.meta} aria-live="polite">
          {compileMs !== null && !error ? `compiled in ${Math.round(compileMs)} ms` : ""}
        </p>
      </div>

      {status && (
        <p className={styles.status} role="status">
          {status}
        </p>
      )}

      <div className={styles.grid}>
        <div className={styles.editors}>
          <section className={styles.pane} aria-labelledby="pg-html-label">
            <h2 id="pg-html-label" className={styles.paneTitle}>
              HTML
            </h2>
            <CodeEditor
              ref={htmlEditor}
              lang="html"
              label="HTML"
              initialValue={html}
              onChange={setHtml}
              className={`${styles.editor} ${styles.editorHtml}`}
            />
          </section>
          <section className={styles.pane} aria-labelledby="pg-scss-label">
            <h2 id="pg-scss-label" className={styles.paneTitle}>
              SCSS
            </h2>
            <CodeEditor
              ref={scssEditor}
              lang="scss"
              label="SCSS"
              initialValue={scss}
              onChange={setScss}
              className={`${styles.editor} ${styles.editorScss}`}
            />
            {error && (
              <div className={styles.errorPane} role="alert" data-testid="compile-error">
                <button type="button" className={styles.errorJump} onClick={jumpToError} disabled={!error.line}>
                  {error.line ? `Line ${error.line}${error.column ? `:${error.column}` : ""}` : "Error"}
                </button>
                <span className={styles.errorMessage}>{error.message}</span>
              </div>
            )}
          </section>
        </div>

        <section className={styles.previewPane} aria-labelledby="pg-preview-label">
          <h2 id="pg-preview-label" className={styles.paneTitle}>
            Preview
          </h2>
          <iframe
            className={styles.preview}
            title="Live preview"
            sandbox=""
            srcDoc={srcdoc}
            data-testid="preview"
          />
        </section>
      </div>
    </div>
  );
}
