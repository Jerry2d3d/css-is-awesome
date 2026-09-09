"use client";
import { useEffect, useState } from "react";
import styles from "./ThemeEditorDock.module.scss";
import type { TokenSpec } from "./catalog";
import tokenConsumersData from "@/lib/generated/token-consumers.json";
import {
  FONT_OPTIONS,
  SYSTEM_STACK,
  buildFontStack,
  detectFontOption,
  loadGoogleFont,
  type FontCategory,
} from "@/lib/google-fonts";

const TOKEN_CONSUMERS: Record<string, string[]> = tokenConsumersData.consumers;

type CommonProps = {
  spec: TokenSpec;
  value: string;          // current override value (or "")
  defaultValue: string;   // theme default
  onCommit: (value: string) => void;
};

// Live WCAG contrast for a color row (v1.2 EPIC-07 F3.1) — computed by
// ThemeEditorDock (it owns the resolved token state for both sides of the
// pair) and handed down; ColorRow only renders it.
export type Contrast = {
  ratio: number;
  required: number;
  passes: boolean;
  bgLabel: string;
  suggestion: string | null;
};

// "used by N ▸" disclosure (v1.2 EPIC-07 F2.1) — direct consumers from the
// build-time token->mixin map (scripts/build-token-consumer-map.mjs). Shared
// across every row type since they all render RowLabel.
function RowLabel({ spec }: { spec: TokenSpec }) {
  const [open, setOpen] = useState(false);
  const consumers = TOKEN_CONSUMERS[spec.token] ?? [];

  return (
    <div className={styles.rowLabel}>
      <span className={styles.rowName}>{spec.label}</span>
      <span className={styles.rowToken}>{spec.token}</span>
      {consumers.length > 0 && (
        <>
          <button
            type="button"
            className={styles.usedByToggle}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            used by {consumers.length} {open ? "▾" : "▸"}
          </button>
          {open && (
            <ul className={styles.usedByList}>
              {consumers.map((c) => (
                <li key={c}>
                  <code>{c}</code>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

// Ratio readout + (when failing) a one-click "use ~#hex" suggestion, applied
// through the same onCommit every other edit in this row goes through.
function ContrastReadout({ contrast, onApply }: { contrast: Contrast; onApply: (hex: string) => void }) {
  const ratioText = `${contrast.ratio.toFixed(2)}:1`;
  if (contrast.passes) {
    return (
      <p className={styles.contrastReadout} data-status="pass">
        {ratioText} vs {contrast.bgLabel} — passes {contrast.required}:1
      </p>
    );
  }
  return (
    <p className={styles.contrastReadout} data-status="fail">
      {ratioText} vs {contrast.bgLabel} — needs {contrast.required}:1
      {contrast.suggestion && (
        <>
          {" "}
          <button type="button" className={styles.contrastFix} onClick={() => onApply(contrast.suggestion as string)}>
            use {contrast.suggestion}
          </button>
        </>
      )}
    </p>
  );
}

// ---------- Color helpers ----------
function isHex(s: string): boolean {
  return /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(s.trim());
}
function toHex(input: string, fallback = "#000000"): string {
  if (!input) return fallback;
  const s = input.trim();
  if (isHex(s)) {
    if (s.length === 4) return "#" + s.slice(1).split("").map((c) => c + c).join("");
    return s.slice(0, 7).toLowerCase();
  }
  try {
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return fallback;
    ctx.fillStyle = "#000";
    ctx.fillStyle = s;
    return typeof ctx.fillStyle === "string" ? ctx.fillStyle : fallback;
  } catch {
    return fallback;
  }
}

function parseNumber(value: string, fallback = 0): number {
  const n = parseFloat(value);
  return isNaN(n) ? fallback : n;
}

// ---------- Color row ----------
// Props are the source of truth. `draft` only exists while the user is
// actively typing in the text input (committed on blur). The color picker
// is fully controlled by props — no local state required.
export function ColorRow({ spec, value, defaultValue, onCommit, contrast }: CommonProps & { contrast?: Contrast }) {
  const current = value || defaultValue;
  const [draft, setDraft] = useState<string | null>(null);
  const display = draft ?? current;
  const hex = toHex(display);

  return (
    <div className={styles.row}>
      <RowLabel spec={spec} />
      <div className={styles.colorCtrl}>
        <input
          type="color"
          value={hex}
          onChange={(e) => {
            setDraft(null);
            onCommit(e.target.value);
          }}
          aria-label={`${spec.label} color`}
        />
        <input
          type="text"
          value={display}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            if (draft != null && draft.trim() !== current) {
              onCommit(draft.trim());
            }
            setDraft(null);
          }}
          aria-label={`${spec.label} value`}
          spellCheck={false}
        />
      </div>
      {contrast && <ContrastReadout contrast={contrast} onApply={onCommit} />}
    </div>
  );
}

// ---------- Length / Duration row ----------
export function LengthRow({ spec, value, defaultValue, onCommit }: CommonProps) {
  const unit = spec.unit ?? "px";
  const num = parseNumber(value || defaultValue, parseNumber(defaultValue));

  function commit(n: number) {
    onCommit(`${n}${unit}`);
  }

  return (
    <div className={styles.row}>
      <RowLabel spec={spec} />
      <div className={styles.numCtrl}>
        <input
          type="range"
          min={spec.min}
          max={spec.max}
          step={spec.step}
          value={num}
          onChange={(e) => commit(parseFloat(e.target.value))}
          aria-label={`${spec.label} (${unit})`}
        />
        <input
          type="number"
          min={spec.min}
          max={spec.max}
          step={spec.step}
          value={num}
          onChange={(e) => commit(parseFloat(e.target.value || "0"))}
          aria-label={`${spec.label} numeric`}
        />
        <span className={styles.unit}>{unit}</span>
      </div>
    </div>
  );
}

// ---------- Number row ----------
export function NumberRow({ spec, value, defaultValue, onCommit }: CommonProps) {
  const num = parseNumber(value || defaultValue, parseNumber(defaultValue));
  return (
    <div className={styles.row}>
      <RowLabel spec={spec} />
      <div className={styles.numCtrl}>
        <input
          type="number"
          min={spec.min}
          max={spec.max}
          step={spec.step}
          value={num}
          onChange={(e) => onCommit(String(parseFloat(e.target.value || "0")))}
          aria-label={spec.label}
        />
      </div>
    </div>
  );
}

// ---------- String row ----------
export function StringRow({ spec, value, defaultValue, onCommit }: CommonProps) {
  const current = value || defaultValue;
  const [draft, setDraft] = useState<string | null>(null);
  const display = draft ?? current;

  return (
    <div className={`${styles.row} ${styles.rowStacked}`}>
      <RowLabel spec={spec} />
      <input
        type="text"
        className={styles.stringInput}
        value={display}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          if (draft != null && draft.trim() !== current) {
            onCommit(draft.trim());
          }
          setDraft(null);
        }}
        aria-label={spec.label}
        spellCheck={false}
      />
    </div>
  );
}

// ---------- Font row ----------
// Curated Google Fonts dropdown. On select: injects the <link> for the
// chosen family, then commits the full font stack into the token.
// The native <select> is OS-rendered, so we can't preview each option
// in its own face — the live page preview updates the moment you pick.
export function FontRow({ spec, value, defaultValue, onCommit }: CommonProps) {
  const category: FontCategory = spec.category ?? "sans";
  const options = FONT_OPTIONS[category];
  const current = value || defaultValue;
  const selected = detectFontOption(current, category);

  // Preload the currently-selected family on mount so the in-page
  // preview is correct after a theme swap (some themes ship a Google
  // family in their own @import; others rely on the editor's <link>).
  useEffect(() => {
    if (!selected.system) loadGoogleFont(selected.family, selected.weights);
  }, [selected.family, selected.weights, selected.system]);

  function handleChange(family: string) {
    const opt = options.find((o) => o.family === family);
    if (!opt) return;
    if (!opt.system) loadGoogleFont(opt.family, opt.weights);
    onCommit(buildFontStack(opt, category));
  }

  const previewStyle = selected.system
    ? { fontFamily: SYSTEM_STACK[category] }
    : { fontFamily: `'${selected.family}', ${SYSTEM_STACK[category]}` };

  return (
    <div className={`${styles.row} ${styles.rowStacked}`}>
      <RowLabel spec={spec} />
      <select
        className={styles.stringInput}
        value={selected.family}
        onChange={(e) => handleChange(e.target.value)}
        style={previewStyle}
        aria-label={spec.label}
      >
        {options.map((o) => (
          <option key={o.family} value={o.family}>
            {o.family}
          </option>
        ))}
      </select>
    </div>
  );
}
