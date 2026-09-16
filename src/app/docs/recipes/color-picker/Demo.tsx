"use client";
import { useState } from "react";
import styles from "./demo.module.scss";

// ─── Colour math (sRGB <-> OKLCH, Björn Ottosson's matrices) ────────────────
// Self-contained so the demo has no dependency. No hex literals anywhere in
// this file: every default is derived from numbers.

type Oklch = { l: number; c: number; h: number; alpha: number };

const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const gam = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const toHex2 = (n: number) => n.toString(16).padStart(2, "0");

function rgbToHex([r, g, b]: number[]): string {
  return "#" + [r, g, b].map(toHex2).join("");
}

function hexToOklch(hex: string): Oklch | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const [r, g, b] = [0, 2, 4].map((i) => lin(parseInt(m[1].slice(i, i + 2), 16) / 255));
  const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const h = ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360;
  return { l: L * 100, c: Math.hypot(a, bb), h, alpha: 1 };
}

function oklchToHex({ l, c, h }: Oklch): string {
  const a = c * Math.cos((h * Math.PI) / 180);
  const bb = c * Math.sin((h * Math.PI) / 180);
  const L = l / 100;
  const l_ = (L + 0.3963377774 * a + 0.2158037573 * bb) ** 3;
  const m_ = (L - 0.1055613458 * a - 0.0638541728 * bb) ** 3;
  const s_ = (L - 0.0894841775 * a - 1.291485548 * bb) ** 3;
  const rgb = [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
  return rgbToHex(rgb.map((v) => Math.round(clamp01(gam(v)) * 255)));
}

function oklchToString({ l, c, h, alpha }: Oklch): string {
  return `oklch(${l.toFixed(0)}% ${c.toFixed(3)} ${h.toFixed(0)} / ${alpha})`;
}

function parseColor(text: string): Oklch | null {
  const fromHex = hexToOklch(text);
  if (fromHex) return fromHex;
  const m = /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+)(%?))?\s*\)$/i.exec(
    text.trim(),
  );
  if (!m) return null;
  const l = m[2] ? Number(m[1]) : Number(m[1]) * 100;
  const alpha = m[5] === undefined ? 1 : m[6] ? Number(m[5]) / 100 : Number(m[5]);
  return { l, c: Number(m[3]), h: Number(m[4]) % 360, alpha };
}

// ─── Demo ───────────────────────────────────────────────────────────────────

const DEFAULT_HEX = rgbToHex([58, 95, 205]);
const DEFAULT_OKLCH: Oklch = { l: 62, c: 0.18, h: 260, alpha: 1 };

const SLIDERS = [
  { key: "h", label: "Hue", min: 0, max: 360, step: 1, text: (c: Oklch) => `Hue ${Math.round(c.h)} degrees` },
  { key: "c", label: "Chroma", min: 0, max: 0.37, step: 0.005, text: (c: Oklch) => `Chroma ${c.c.toFixed(3)}` },
  { key: "l", label: "Lightness", min: 0, max: 100, step: 1, text: (c: Oklch) => `Lightness ${Math.round(c.l)} percent` },
  { key: "alpha", label: "Alpha", min: 0, max: 1, step: 0.01, text: (c: Oklch) => `Alpha ${Math.round(c.alpha * 100)} percent` },
] as const;

export default function ColorPickerDemo() {
  // Native variant state
  const [hex, setHex] = useState(DEFAULT_HEX);
  const [hexText, setHexText] = useState(DEFAULT_HEX);

  // Custom variant state
  const [color, setColor] = useState<Oklch>(DEFAULT_OKLCH);
  const [text, setText] = useState("");
  const [invalid, setInvalid] = useState(false);
  const value = oklchToString(color);
  const nearestHex = oklchToHex(color);

  function commitHexText() {
    if (/^#?[0-9a-f]{6}$/i.test(hexText.trim())) {
      const normalized = (hexText.trim().startsWith("#") ? "" : "#") + hexText.trim().toLowerCase();
      setHex(normalized);
      setHexText(normalized);
    } else {
      setHexText(hex);
    }
  }

  function commitText() {
    const parsed = parseColor(text);
    if (!parsed) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    setColor(parsed);
  }

  return (
    <div className={styles.demo}>
      <section className={styles.block} data-demo="native" aria-labelledby="cp-native-title">
        <h3 id="cp-native-title" className={styles.blockTitle}>
          Native variant
        </h3>
        <div className={styles.myColor}>
          <label htmlFor="cp-brand" className={styles.label}>
            Brand colour
          </label>
          <div className={styles.row}>
            <input
              id="cp-brand"
              className={styles.native}
              type="color"
              value={hex}
              onChange={(e) => {
                setHex(e.target.value);
                setHexText(e.target.value);
              }}
            />
            <input
              className={styles.text}
              type="text"
              spellCheck={false}
              autoComplete="off"
              pattern="^#[0-9a-fA-F]{6}$"
              aria-label="Brand colour as hex"
              value={hexText}
              onChange={(e) => setHexText(e.target.value)}
              onBlur={commitHexText}
              onKeyDown={(e) => e.key === "Enter" && commitHexText()}
            />
          </div>
        </div>
      </section>

      <section className={styles.block} data-demo="custom" aria-labelledby="cp-custom-title">
        <h3 id="cp-custom-title" className={styles.blockTitle}>
          Custom OKLCH variant
        </h3>
        <div className={styles.myColor} role="group" aria-labelledby="cp-accent-title">
          <span id="cp-accent-title" className={styles.label}>
            Accent colour
          </span>
          <div className={styles.preview}>
            <span
              className={styles.swatch}
              style={{ ["--swatch" as string]: value }}
              aria-hidden="true"
              data-slot="swatch"
            />
            <div className={styles.readout}>
              <output className={styles.value} aria-live="off" data-slot="value">
                {value}
              </output>
              <span className={styles.nearest}>nearest sRGB: {nearestHex}</span>
            </div>
          </div>

          {SLIDERS.map((s) => (
            <label key={s.key} className={styles.field}>
              <span>{s.label}</span>
              <input
                className={styles.range}
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={color[s.key]}
                aria-valuetext={s.text(color)}
                id={s.key === "h" ? "cp-hue" : undefined}
                onChange={(e) => {
                  setColor({ ...color, [s.key]: Number(e.target.value) });
                  setInvalid(false);
                }}
              />
            </label>
          ))}

          <label className={styles.field}>
            <span>Or type a value</span>
            <input
              className={styles.text}
              type="text"
              spellCheck={false}
              autoComplete="off"
              placeholder="hex or oklch(…)"
              value={text}
              aria-invalid={invalid || undefined}
              onChange={(e) => setText(e.target.value)}
              onBlur={commitText}
              onKeyDown={(e) => e.key === "Enter" && commitText()}
            />
          </label>
          {invalid && (
            <p className={styles.error} role="alert">
              Enter a 6-digit hex or an oklch() value.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
