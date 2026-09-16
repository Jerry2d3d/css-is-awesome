---
name: color-picker
description: A colour input that starts at native <input type="color"> and upgrades to a custom OKLCH picker — hue, chroma, lightness and alpha sliders with a text fallback and a live swatch.
category: input
complexity: complex
cia-version: ">=1.0.0"
---

## Use this when

You need the user to choose a colour — a brand token in a settings screen, a tag colour, a chart series. Start with the **native variant** (`<input type="color">`): zero JS, the OS picker, keyboard and screen-reader support for free. Upgrade to the **custom variant** only when you need alpha, a wide-gamut / OKLCH value, or a picker whose look you actually control. If the user picks from a short fixed set, bail and use a row of preset swatches (`aria-pressed` buttons) instead — that is a toggle group, not a colour picker. The site's own theme editor at `/themes` is a full-page version of exactly this pattern: it is where cia's colour tokens get edited, and this recipe is the component-sized cut of it.

## Structure (raw HTML)

### Native variant (`<input type="color">`)

```html
<div class="my-color" data-cia-recipe="color-picker">
  <label for="my-brand" data-slot="label">Brand colour</label>
  <div data-slot="row">
    <input id="my-brand" data-slot="native" type="color" />
    <input
      data-slot="text"
      type="text"
      inputmode="text"
      spellcheck="false"
      autocomplete="off"
      pattern="^#[0-9a-fA-F]{6}$"
      aria-label="Brand colour as hex"
    />
  </div>
</div>
```

Notes on the markup:

- The native input **is** the value. The paired text field is the keyboard / screen-reader path: it shows the hex the picker holds and accepts a typed one. Both write to the same state.
- The browser owns the popup: eyedropper, palette, keyboard nav and announcements come from the OS. You cannot style the popup; you can style the swatch button (see Styling).
- `pattern` makes a malformed hex fail native constraint validation, so the same `:user-invalid` styling the [`form-validation-html5`](./form-validation-html5.md) recipe documents applies here with no extra work.

### Custom variant (OKLCH sliders)

```html
<div class="my-color" data-cia-recipe="color-picker" role="group" aria-labelledby="my-color-title">
  <span id="my-color-title" data-slot="label">Accent colour</span>

  <div data-slot="preview">
    <span data-slot="swatch" style="--swatch: oklch(62% 0.18 260 / 1)" aria-hidden="true"></span>
    <output data-slot="value" for="my-hue my-chroma my-light my-alpha" aria-live="off">oklch(62% 0.18 260 / 1)</output>
  </div>

  <label data-slot="field">
    <span>Hue</span>
    <input data-slot="range" type="range" min="0" max="360" step="1" value="260"
           aria-valuetext="Hue 260 degrees" id="my-hue" />
  </label>
  <label data-slot="field">
    <span>Chroma</span>
    <input data-slot="range" type="range" min="0" max="0.37" step="0.005" value="0.18"
           aria-valuetext="Chroma 0.18" id="my-chroma" />
  </label>
  <label data-slot="field">
    <span>Lightness</span>
    <input data-slot="range" type="range" min="0" max="100" step="1" value="62"
           aria-valuetext="Lightness 62 percent" id="my-light" />
  </label>
  <label data-slot="field">
    <span>Alpha</span>
    <input data-slot="range" type="range" min="0" max="1" step="0.01" value="1"
           aria-valuetext="Alpha 100 percent" id="my-alpha" />
  </label>

  <label data-slot="field">
    <span>Or type a value</span>
    <input data-slot="text" type="text" spellcheck="false" autocomplete="off"
           placeholder="hex or oklch(…)" />
  </label>
</div>
```

Notes on the markup:

- The four sliders are real `<input type="range">` elements, so Arrow / Home / End / PageUp / PageDown work natively and each one is a first-class form control. `aria-valuetext` turns the raw number into something meaningful ("Hue 260 degrees" rather than "260").
- The swatch's `style="--swatch: …"` is a **data binding, not appearance styling** — the live colour is the value being edited, so it has to travel with the element. The SCSS below consumes it via `background: var(--swatch)`; no colour, spacing or type is set inline. (`validate-recipes` flags every inline `style=` so this stays a conscious exception.)
- `<output>` is the semantic "computed result" element; `aria-live="off"` because every slider already announces its own `aria-valuetext` — a second announcement of the full string on every keystroke is noise, and the value is still readable on demand.
- The text field is the **numeric fallback**: a keyboard-only or screen-reader user can type `#rrggbb` or an `oklch()` string and the sliders sync to it (see Interactivity).

## Styling (cia mixins)

```scss
// MyColorPicker.module.scss — component stylesheet, so import the zero-emit barrel.
@use 'css-is-awesome/api' as cia;

.my-color {
  @include cia.stack(3);
  max-inline-size: 22rem;

  [data-slot="label"] { @include cia.label-base; }

  [data-slot="row"] { @include cia.cluster(2); }

  /* Native variant: the swatch button is the only styleable part */
  [data-slot="native"] {
    @include cia.input-base;
    inline-size: 3rem;
    block-size: 2.5rem;
    padding: cia.space(2xs);
    cursor: pointer;

    &::-webkit-color-swatch-wrapper { padding: 0; }
    &::-webkit-color-swatch { border: 0; border-radius: cia.radius(sm); }
    &::-moz-color-swatch { border: 0; border-radius: cia.radius(sm); }
  }

  [data-slot="text"] {
    @include cia.input-base;
    font-family: cia.font-family(mono);
    flex: 1;
  }

  /* Custom variant */
  [data-slot="preview"] { @include cia.cluster(3); }

  [data-slot="swatch"] {
    inline-size: 3rem;
    block-size: 3rem;
    border-radius: cia.radius(md);
    border: 1px solid cia.color(border-default);
    box-shadow: cia.shadow(1);
    /* The live colour arrives on the element as --swatch (see Structure) */
    background: var(--swatch);
    /* Checkerboard under the colour so alpha is visible */
    background-image: linear-gradient(var(--swatch), var(--swatch)),
      repeating-conic-gradient(cia.color(surface-muted) 0 25%, cia.color(surface-default) 0 50%);
    background-size: 100% 100%, 0.75rem 0.75rem;
  }

  [data-slot="value"] {
    font-family: cia.font-family(mono);
    font-size: cia.font-size(2);
    color: cia.color(text-secondary);
  }

  [data-slot="field"] {
    @include cia.stack(1);
    > span { @include cia.label-base($size: 1, $color: text-secondary); }
  }

  [data-slot="range"] {
    @include cia.slider-base;
  }

  /* Hue gets a real rainbow track so the slider explains itself */
  [data-slot="range"][id$='hue'] {
    &::-webkit-slider-runnable-track,
    &::-moz-range-track {
      background: linear-gradient(in oklch longer hue, oklch(70% 0.15 0), oklch(70% 0.15 360));
    }
  }
}
```

`cia.slider-base` styles the track and thumb for both engines and adds the focus ring; the recipe only overrides the hue track. `cia.input-base` on `<input type="color">` gives the swatch button the same border, radius and focus treatment as every other field — the popup itself ignores author CSS in every browser.

## Interactivity

Native variant: **zero JS** for the picker. One tiny sync keeps the text field honest: on the colour input's `input` event write `value` into the text field; on the text field's `change`, if it matches `/^#[0-9a-f]{6}$/i`, write it back into the colour input.

Custom variant: the consumer script owns four jobs, all small:

1. **Compose** — on any slider `input`, build `oklch(L% C H / A)` from the four values, write it to `--swatch` on the swatch element and to the `<output>`.
2. **Describe** — update each slider's `aria-valuetext` from its value ("Hue 260 degrees", "Lightness 62 percent").
3. **Parse** — on the text field's `change`, accept either `#rrggbb` (convert sRGB → OKLCH, below) or an `oklch()` string, and move all four sliders to match. Reject anything else by leaving the sliders alone and marking the field `aria-invalid="true"`.
4. **Emit** — fire your `change` callback with the `oklch()` string (and, if the consumer needs it, the nearest hex via the reverse conversion).

**Why OKLCH, not HSL.** HSL's lightness is not perceptual: `hsl(60 100% 50%)` (yellow) and `hsl(240 100% 50%)` (blue) claim the same lightness and are nowhere near it. OKLCH's L is perceptually uniform, so a lightness slider *looks* linear, and its hue stays stable as chroma changes — which is exactly why cia's own tokens are mixed with `color-mix()` in OKLCH. Browser floor for `oklch()` is Chrome ≥ 111, Safari ≥ 15.4, Firefox ≥ 113; for older engines swap the three colour sliders for HSL (see Variants) — the markup and the a11y work are identical.

The conversion is ~30 lines of plain arithmetic (Björn Ottosson's published matrices); every framework example below imports it from this one module:

```js
// color-math.js — sRGB <-> OKLCH, no dependencies.
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const gam = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const clamp01 = (x) => Math.min(1, Math.max(0, x));

/** "#rrggbb" -> { l: 0-100, c: 0-0.4, h: 0-360 } */
export function hexToOklch(hex) {
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
  return { l: L * 100, c: Math.hypot(a, bb), h };
}

/** { l, c, h } -> "#rrggbb" (gamut-clipped to sRGB) */
export function oklchToHex({ l, c, h }) {
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
  return "#" + rgb.map((v) => Math.round(clamp01(gam(v)) * 255).toString(16).padStart(2, "0")).join("");
}

export function oklchToString({ l, c, h }, alpha = 1) {
  return `oklch(${l.toFixed(0)}% ${c.toFixed(3)} ${h.toFixed(0)} / ${alpha})`;
}

/** Accepts "#rrggbb" or "oklch(L C H / A)"; returns { l, c, h, alpha } or null */
export function parseColor(text) {
  const fromHex = hexToOklch(text);
  if (fromHex) return { ...fromHex, alpha: 1 };
  const m = /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+)(%?))?\s*\)$/i.exec(text.trim());
  if (!m) return null;
  const l = m[2] ? Number(m[1]) : Number(m[1]) * 100;
  const alpha = m[5] === undefined ? 1 : m[6] ? Number(m[5]) / 100 : Number(m[5]);
  return { l, c: Number(m[3]), h: Number(m[4]) % 360, alpha };
}
```

Edge cases:

- **SSR:** render the sliders with their default `value` attributes and the swatch's `--swatch` already composed on the server — the first paint is correct before hydration, and nothing here touches `window` at module load.
- **Out-of-gamut:** OKLCH can express colours sRGB cannot show. `oklchToHex` clips; if you show the hex alongside the OKLCH string, say so in the UI ("nearest sRGB").
- **Dragging performance:** compose on `input`, but debounce the *emit* to `change` (pointer-up) if the consumer re-renders something expensive on every value.

## A11y checklist

- [ ] The native `<input type="color">` has a visible, associated `<label>` — not just a placeholder swatch ([WCAG 2.2 SC 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html))
- [ ] Every slider is a real `<input type="range">` with an accessible name (wrapping `<label>` or `aria-labelledby`) so it gets the slider role, Arrow / Home / End keys and value announcements natively ([APG Slider Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/))
- [ ] Each slider carries `aria-valuetext` that says what the number means ("Hue 260 degrees", "Alpha 40 percent"), updated on every change ([WCAG 2.2 SC 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html))
- [ ] A text field accepts a typed hex / `oklch()` value and syncs the sliders — keyboard-only and screen-reader users never depend on dragging ([WCAG 2.2 SC 2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html))
- [ ] The chosen colour is exposed as text (`<output>` / the text field), not only as the swatch's fill ([WCAG 2.2 SC 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html))
- [ ] A rejected text value sets `aria-invalid="true"` and an adjacent message says why, rather than silently ignoring the input ([WCAG 2.2 SC 3.3.1 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html))
- [ ] Slider thumbs meet the 24 × 24 px minimum target size (`cia.slider-base`'s default thumb is 1.1rem ≈ 17.6px — raise `$thumb-size` to `1.5rem` for pointer-heavy UIs) ([WCAG 2.2 SC 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html))
- [ ] The swatch is `aria-hidden` — it is a preview of a value that is already announced, not information of its own ([WAI-ARIA: aria-hidden](https://www.w3.org/TR/wai-aria-1.2/#aria-hidden))

## Framework examples

All four examples implement the custom OKLCH variant: four sliders, a live swatch, an `<output>`, and a text field that accepts hex or `oklch()`. Each imports the `color-math.js` module from Interactivity. The native variant needs no framework code beyond binding `value`.

### React

```tsx
"use client";
import { useState } from "react";
import { parseColor, oklchToString } from "./color-math";
import styles from "./MyColorPicker.module.scss";

type Oklch = { l: number; c: number; h: number; alpha: number };
const DEFAULT: Oklch = { l: 62, c: 0.18, h: 260, alpha: 1 };

export default function MyColorPicker({ onChange }: { onChange?: (value: string) => void }) {
  const [color, setColor] = useState<Oklch>(DEFAULT);
  const [text, setText] = useState("");
  const [invalid, setInvalid] = useState(false);
  const value = oklchToString(color, color.alpha);

  function update(patch: Partial<Oklch>) {
    const next = { ...color, ...patch };
    setColor(next);
    onChange?.(oklchToString(next, next.alpha));
  }

  function commitText() {
    const parsed = parseColor(text);
    if (!parsed) return setInvalid(true);
    setInvalid(false);
    update(parsed);
  }

  const sliders = [
    { key: "h", label: "Hue", min: 0, max: 360, step: 1, text: `Hue ${Math.round(color.h)} degrees` },
    { key: "c", label: "Chroma", min: 0, max: 0.37, step: 0.005, text: `Chroma ${color.c.toFixed(3)}` },
    { key: "l", label: "Lightness", min: 0, max: 100, step: 1, text: `Lightness ${Math.round(color.l)} percent` },
    { key: "alpha", label: "Alpha", min: 0, max: 1, step: 0.01, text: `Alpha ${Math.round(color.alpha * 100)} percent` },
  ] as const;

  return (
    <div className={styles.myColor} role="group" aria-labelledby="my-color-title">
      <span id="my-color-title">Accent colour</span>
      <div className={styles.preview}>
        <span className={styles.swatch} style={{ ["--swatch" as string]: value }} aria-hidden="true" />
        <output aria-live="off">{value}</output>
      </div>
      {sliders.map((s) => (
        <label key={s.key} className={styles.field}>
          <span>{s.label}</span>
          <input
            type="range"
            min={s.min}
            max={s.max}
            step={s.step}
            value={color[s.key]}
            aria-valuetext={s.text}
            id={s.key === "h" ? "my-hue" : undefined}
            onChange={(e) => update({ [s.key]: Number(e.target.value) })}
          />
        </label>
      ))}
      <label className={styles.field}>
        <span>Or type a value</span>
        <input
          type="text"
          spellCheck={false}
          placeholder="hex or oklch(…)"
          value={text}
          aria-invalid={invalid || undefined}
          onChange={(e) => setText(e.target.value)}
          onBlur={commitText}
          onKeyDown={(e) => e.key === "Enter" && commitText()}
        />
      </label>
      {invalid && <p role="alert">Enter a 6-digit hex or an oklch() value.</p>}
    </div>
  );
}
```

### Vue

```vue
<script setup>
import { computed, reactive, ref } from "vue";
import { parseColor, oklchToString } from "./color-math";

const emit = defineEmits(["change"]);
const color = reactive({ l: 62, c: 0.18, h: 260, alpha: 1 });
const text = ref("");
const invalid = ref(false);
const value = computed(() => oklchToString(color, color.alpha));

const sliders = [
  { key: "h", label: "Hue", min: 0, max: 360, step: 1, text: () => `Hue ${Math.round(color.h)} degrees` },
  { key: "c", label: "Chroma", min: 0, max: 0.37, step: 0.005, text: () => `Chroma ${color.c.toFixed(3)}` },
  { key: "l", label: "Lightness", min: 0, max: 100, step: 1, text: () => `Lightness ${Math.round(color.l)} percent` },
  { key: "alpha", label: "Alpha", min: 0, max: 1, step: 0.01, text: () => `Alpha ${Math.round(color.alpha * 100)} percent` },
];

function set(key, v) {
  color[key] = Number(v);
  emit("change", value.value);
}
function commitText() {
  const parsed = parseColor(text.value);
  invalid.value = !parsed;
  if (parsed) {
    Object.assign(color, parsed);
    emit("change", value.value);
  }
}
</script>

<template>
  <div class="my-color" role="group" aria-labelledby="my-color-title">
    <span id="my-color-title" data-slot="label">Accent colour</span>
    <div data-slot="preview">
      <span data-slot="swatch" :style="{ '--swatch': value }" aria-hidden="true"></span>
      <output data-slot="value" aria-live="off">{{ value }}</output>
    </div>
    <label v-for="s in sliders" :key="s.key" data-slot="field">
      <span>{{ s.label }}</span>
      <input
        data-slot="range"
        type="range"
        :min="s.min"
        :max="s.max"
        :step="s.step"
        :value="color[s.key]"
        :aria-valuetext="s.text()"
        :id="s.key === 'h' ? 'my-hue' : undefined"
        @input="set(s.key, $event.target.value)"
      />
    </label>
    <label data-slot="field">
      <span>Or type a value</span>
      <input
        data-slot="text"
        type="text"
        spellcheck="false"
        placeholder="hex or oklch(…)"
        v-model="text"
        :aria-invalid="invalid || undefined"
        @blur="commitText"
        @keydown.enter="commitText"
      />
    </label>
    <p v-if="invalid" role="alert">Enter a 6-digit hex or an oklch() value.</p>
  </div>
</template>
```

### Svelte

```svelte
<script>
  import { createEventDispatcher } from "svelte";
  import { parseColor, oklchToString } from "./color-math";

  const dispatch = createEventDispatcher();
  let color = { l: 62, c: 0.18, h: 260, alpha: 1 };
  let text = "";
  let invalid = false;
  $: value = oklchToString(color, color.alpha);

  const sliders = [
    { key: "h", label: "Hue", min: 0, max: 360, step: 1, text: (c) => `Hue ${Math.round(c.h)} degrees` },
    { key: "c", label: "Chroma", min: 0, max: 0.37, step: 0.005, text: (c) => `Chroma ${c.c.toFixed(3)}` },
    { key: "l", label: "Lightness", min: 0, max: 100, step: 1, text: (c) => `Lightness ${Math.round(c.l)} percent` },
    { key: "alpha", label: "Alpha", min: 0, max: 1, step: 0.01, text: (c) => `Alpha ${Math.round(c.alpha * 100)} percent` },
  ];

  function set(key, v) {
    color = { ...color, [key]: Number(v) };
    dispatch("change", oklchToString(color, color.alpha));
  }
  function commitText() {
    const parsed = parseColor(text);
    invalid = !parsed;
    if (parsed) {
      color = parsed;
      dispatch("change", oklchToString(color, color.alpha));
    }
  }
</script>

<div class="my-color" role="group" aria-labelledby="my-color-title">
  <span id="my-color-title" data-slot="label">Accent colour</span>
  <div data-slot="preview">
    <span data-slot="swatch" style="--swatch: {value}" aria-hidden="true"></span>
    <output data-slot="value" aria-live="off">{value}</output>
  </div>
  {#each sliders as s (s.key)}
    <label data-slot="field">
      <span>{s.label}</span>
      <input
        data-slot="range"
        type="range"
        min={s.min}
        max={s.max}
        step={s.step}
        value={color[s.key]}
        aria-valuetext={s.text(color)}
        id={s.key === "h" ? "my-hue" : undefined}
        on:input={(e) => set(s.key, e.currentTarget.value)}
      />
    </label>
  {/each}
  <label data-slot="field">
    <span>Or type a value</span>
    <input
      data-slot="text"
      type="text"
      spellcheck="false"
      placeholder="hex or oklch(…)"
      bind:value={text}
      aria-invalid={invalid || undefined}
      on:blur={commitText}
      on:keydown={(e) => e.key === "Enter" && commitText()}
    />
  </label>
  {#if invalid}<p role="alert">Enter a 6-digit hex or an oklch() value.</p>{/if}
</div>
```

### Vanilla (Web Component)

```js
import { parseColor, oklchToString } from "./color-math.js";

const SLIDERS = [
  { key: "h", label: "Hue", min: 0, max: 360, step: 1, text: (c) => `Hue ${Math.round(c.h)} degrees` },
  { key: "c", label: "Chroma", min: 0, max: 0.37, step: 0.005, text: (c) => `Chroma ${c.c.toFixed(3)}` },
  { key: "l", label: "Lightness", min: 0, max: 100, step: 1, text: (c) => `Lightness ${Math.round(c.l)} percent` },
  { key: "alpha", label: "Alpha", min: 0, max: 1, step: 0.01, text: (c) => `Alpha ${Math.round(c.alpha * 100)} percent` },
];

class MyColorPicker extends HTMLElement {
  color = { l: 62, c: 0.18, h: 260, alpha: 1 };

  connectedCallback() {
    this.innerHTML = `
      <div class="my-color" role="group" aria-labelledby="my-color-title">
        <span id="my-color-title" data-slot="label">Accent colour</span>
        <div data-slot="preview">
          <span data-slot="swatch" aria-hidden="true"></span>
          <output data-slot="value" aria-live="off"></output>
        </div>
        ${SLIDERS.map(
          (s) => `<label data-slot="field"><span>${s.label}</span>
            <input data-slot="range" type="range" min="${s.min}" max="${s.max}" step="${s.step}"
                   data-key="${s.key}" ${s.key === "h" ? 'id="my-hue"' : ""} /></label>`,
        ).join("")}
        <label data-slot="field"><span>Or type a value</span>
          <input data-slot="text" type="text" spellcheck="false" placeholder="hex or oklch(…)" /></label>
        <p role="alert" hidden>Enter a 6-digit hex or an oklch() value.</p>
      </div>`;

    this.querySelectorAll('[data-slot="range"]').forEach((input) => {
      input.addEventListener("input", () => {
        this.color = { ...this.color, [input.dataset.key]: Number(input.value) };
        this.render();
        this.dispatchEvent(new CustomEvent("change", { detail: this.value }));
      });
    });

    const text = this.querySelector('[data-slot="text"]');
    const commit = () => {
      const parsed = parseColor(text.value);
      this.querySelector("[role='alert']").hidden = Boolean(parsed);
      if (parsed) {
        text.removeAttribute("aria-invalid");
        this.color = parsed;
        this.render();
        this.dispatchEvent(new CustomEvent("change", { detail: this.value }));
      } else {
        text.setAttribute("aria-invalid", "true");
      }
    };
    text.addEventListener("change", commit);
    this.render();
  }

  get value() {
    return oklchToString(this.color, this.color.alpha);
  }

  render() {
    this.querySelector('[data-slot="swatch"]').style.setProperty("--swatch", this.value);
    this.querySelector('[data-slot="value"]').textContent = this.value;
    this.querySelectorAll('[data-slot="range"]').forEach((input) => {
      const s = SLIDERS.find((x) => x.key === input.dataset.key);
      input.value = String(this.color[s.key]);
      input.setAttribute("aria-valuetext", s.text(this.color));
    });
  }
}
customElements.define("my-color-picker", MyColorPicker);
```

## Variants

### HSL fallback (pre-OKLCH engines)

Same markup, same a11y — only the value composition changes. Chroma becomes Saturation (0–100 %), and the `oklch()` string becomes `hsl(H S% L% / A)`. Because HSL lightness is not perceptual, expect the lightness slider to feel uneven across hues; that is the trade, not a bug.

```scss
// Only the hue track changes — HSL engines can't do `in oklch longer hue`.
.my-color [data-slot="range"][id$='hue'] {
  &::-webkit-slider-runnable-track,
  &::-moz-range-track {
    background: linear-gradient(
      to right,
      hsl(0 80% 60%), hsl(60 80% 60%), hsl(120 80% 60%),
      hsl(180 80% 60%), hsl(240 80% 60%), hsl(300 80% 60%), hsl(360 80% 60%)
    );
  }
}
```

### Preset swatches beside the picker

A row of `<button aria-pressed>` swatches (each with its `--swatch` binding and a text `aria-label`) for the "pick from the brand palette, or customise" case. The active one is `aria-pressed="true"`; clicking one calls the same `update()` as the sliders.

```scss
.my-color [data-slot="presets"] {
  @include cia.cluster(1);

  button {
    @include cia.button-reset;
    inline-size: 1.75rem;
    block-size: 1.75rem;
    border-radius: cia.radius(full);
    border: 2px solid transparent;
    background: var(--swatch);
    @include cia.focus-ring;

    &[aria-pressed="true"] { border-color: cia.color(action-primary-default); }
  }
}
```

## Pitfalls

- **Don't try to style the native popup.** `::-webkit-color-swatch` reaches the swatch *button*; the picker that opens is OS/browser chrome in every engine. If the design needs a styled panel, that is the custom variant, full stop.
- **Don't use `<input type="color">` for alpha.** It is opaque sRGB hex only, by spec. Alpha means the custom variant.
- **Don't ship `oklch()` without the floor check.** Below Chrome 111 / Safari 15.4 / Firefox 113 the whole colour declaration is dropped and the swatch renders transparent. Feature-detect with `CSS.supports("color", "oklch(50% 0.1 0)")` and fall back to the HSL variant.
- **Don't announce the composed string on every keystroke.** Leave `<output>` at `aria-live="off"`; the slider's own `aria-valuetext` already tells the user what changed.
- **Don't drop the text fallback.** A slider-only picker is unusable with a switch device or a screen reader that doesn't expose range drag well — the typed path is the accessible path, not a convenience.

## Related recipes

- [`form-validation-html5`](./form-validation-html5.md) — the `:user-invalid` styling the native variant's hex field inherits for free
