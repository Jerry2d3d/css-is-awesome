---
name: file-upload
description: A drag-and-drop file picker built on the native <input type="file"> — the input stays the source of truth, a labelled drop zone adds drag states, and a file list shows per-file progress, validation errors and remove buttons.
category: input
complexity: medium
cia-version: ">=1.0.0"
---

## Use this when

You need users to hand you files — avatars, attachments, CSV imports, documents — with the modern "drop it here or browse" affordance. Build it **around** the native `<input type="file">`, never instead of it: the input already owns the OS file dialog, the `accept` filter, `multiple`, keyboard activation, form participation and every assistive-technology contract. The drop zone is a progressive enhancement layered on top; the JS only listens for drag events, validates what arrived, and renders the list. If you just need a plain "Choose file" button with no drag target and no list, skip this recipe — a bare `<input type="file">` styled with `cia.btn` is enough.

## Structure (raw HTML)

```html
<div data-cia-recipe="file-upload">
  <!-- The native input IS the control. It is visually hidden, not removed, and
       it sits OUTSIDE the label so the label's `for` is its accessible name. -->
  <input
    id="attachments"
    type="file"
    data-slot="input"
    accept="image/*,.pdf"
    multiple
    aria-describedby="attachments-hint"
  />

  <!-- The drop zone is a <label for>: click and keyboard "browse" open the OS
       dialog natively, with no role="button" re-implementation. -->
  <label for="attachments" data-slot="zone">
    <span data-slot="zone-title">Drag &amp; drop files here</span>
    <span data-slot="zone-action">or browse</span>
    <span id="attachments-hint" data-slot="zone-hint">Images or PDF · up to 3 files · 2 MB each</span>
  </label>

  <!-- Announcements: selection count + zone-level rejections -->
  <p data-slot="status" aria-live="polite"></p>
  <p data-slot="error" role="alert" hidden></p>

  <!-- Selected files -->
  <ul data-slot="list" aria-label="Selected files">
    <li data-slot="item">
      <span data-slot="name">photo.png</span>
      <span data-slot="size">1.2 MB</span>
      <div data-slot="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="60" aria-label="Uploading photo.png">
        <div data-slot="fill" style="inline-size: 60%"></div>
      </div>
      <button type="button" data-slot="remove" aria-label="Remove photo.png">×</button>
    </li>
    <li data-slot="item" data-error="true">
      <span data-slot="name">notes.txt</span>
      <span data-slot="size">4 KB</span>
      <span data-slot="item-error">File type not allowed</span>
      <button type="button" data-slot="remove" aria-label="Remove notes.txt">×</button>
    </li>
  </ul>
</div>
```

Notes on the markup:

- **The input is a sibling of the label, not a child.** With `<label for>` the whole drop zone becomes the input's click target and accessible name for free. Nesting the input *inside* the label also works, but then a click on the visually-hidden input's own box double-fires in some browsers.
- **`data-drag-over` is an attribute the script toggles on the zone**, never a class. Consumers own every class name in this system; the recipe only promises the attribute, so the styling below targets `[data-drag-over]`.
- `accept` is a **hint** to the OS dialog, not a guarantee — a drop bypasses it entirely, so the script validates again (see Interactivity).
- The `style="inline-size: 60%"` on the fill is the one legitimate inline style here: a live progress value is data, not appearance. The bar's colour, height and radius all come from `cia.progress`.
- The `role="progressbar"` element carries `aria-valuenow` so the value is announced; the `aria-label` names *which* file so multiple bars aren't ambiguous.

## Styling (cia mixins)

```scss
// FileUpload.module.scss — component stylesheet, so import the zero-emit barrel.
@use 'css-is-awesome/api' as cia;

.my-upload {
  @include cia.stack($gap: 3);

  // The native input stays in the DOM and the tab order — just not on screen.
  [data-slot="input"] {
    @include cia.sr-only;
  }

  [data-slot="zone"] {
    @include cia.stack($gap: 1);
    align-items: center;
    text-align: center;
    padding: cia.space(6) cia.space(4);
    border: 2px dashed cia.color(border-default);
    border-radius: cia.radius(lg);
    background: cia.color(surface-subtle);
    color: cia.color(text-secondary);
    cursor: pointer;
    @include cia.transition(border-color, background-color);

    &:hover {
      border-color: cia.color(border-emphasis);
    }

    // Drag-over is an ATTRIBUTE toggled by the script — consumers own classes.
    &[data-drag-over] {
      border-color: cia.color(action-primary-default);
      background: cia.color(action-primary-wash);
    }
  }

  // The zone is a <label>, so the focus ring belongs on it when the (hidden)
  // input it labels has keyboard focus.
  [data-slot="input"]:focus-visible + [data-slot="zone"] {
    outline: none;
    box-shadow: 0 0 0 3px cia.color(border-focus);
  }

  [data-slot="input"]:disabled + [data-slot="zone"] {
    @include cia.disabled;
  }

  [data-slot="zone-title"] {
    @include cia.font(semibold, 3);
    color: cia.color(text-primary);
  }

  [data-slot="zone-action"] {
    color: cia.color(text-link);
    text-decoration: underline;
  }

  [data-slot="zone-hint"] {
    @include cia.font(reg, 1);
    color: cia.color(text-muted);
  }

  [data-slot="status"] {
    margin: 0;
    @include cia.font(reg, 1);
    color: cia.color(text-muted);
  }

  [data-slot="error"] {
    margin: 0;
    @include cia.font(reg, 2);
    color: cia.color(error-text);
  }

  [data-slot="list"] {
    @include cia.list-reset;
    @include cia.stack($gap: 2);
  }

  [data-slot="item"] {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    align-items: center;
    column-gap: cia.space(3);
    row-gap: cia.space(1);
    padding: cia.space(2) cia.space(3);
    border: 1px solid cia.color(border-default);
    border-radius: cia.radius(md);
    background: cia.color(surface-default);

    &[data-error="true"] {
      border-color: cia.color(error-default);
    }
  }

  [data-slot="name"] {
    @include cia.truncate;
    @include cia.font(medium, 2);
  }

  [data-slot="size"] {
    @include cia.font(reg, 1);
    color: cia.color(text-muted);
  }

  // The bar spans the full row under name + size.
  [data-slot="progress"] {
    grid-column: 1 / -1;
    @include cia.progress($height: 0.375rem);
  }

  [data-slot="item-error"] {
    grid-column: 1 / -1;
    @include cia.font(reg, 1);
    color: cia.color(error-text);
  }

  [data-slot="remove"] {
    @include cia.btn-icon($size: 2rem, $r: full);
    color: cia.color(text-muted);
  }
}
```

`cia.progress` already styles the `[data-slot='fill']` child — you only set its `inline-size` from the live value. The epic sketch mentioned `cia.frame` for the zone; `frame` is an aspect-ratio media box, so it only belongs here in the image-preview variant below.

## Interactivity

The browser does most of it. Clicking or pressing Enter/Space on the zone opens the OS dialog because the zone is the input's `<label>`. The script's whole job is four small things:

1. **Read the selection** — on the input's `change` event, take `input.files`, then clear `input.value = ""` so picking the same file twice still fires `change`.
2. **Accept a drop** — on the zone, `preventDefault()` on `dragover` (otherwise the browser navigates to the file) and read `event.dataTransfer.files` on `drop`. Toggle the `data-drag-over` attribute on `dragenter` / `dragleave` / `drop`. Use a counter or check `relatedTarget` on `dragleave`, because it fires every time the cursor crosses a child element.
3. **Validate** every incoming `File` — `accept` again (a drop ignores the attribute), `size > maxSize`, and the running count against `maxFiles`. Keep rejected files **in the list with an error** rather than silently dropping them: the user needs to see *what* was refused and why. A count overflow is a zone-level error, announced with `role="alert"`.
4. **Render + announce** — write "3 files selected" into the polite live region after every change, and mirror real upload progress (from `XMLHttpRequest.upload.onprogress` or `fetch` + a `ReadableStream`) into each row's `aria-valuenow` and fill width.

SSR: nothing here touches `File`, `FileReader`, `DataTransfer` or `window` at module load — only inside event handlers — so the component renders on the server as a plain labelled input, which is also the correct no-JS fallback.

## A11y checklist

- [ ] The native `<input type="file">` is present, in the tab order, and named by a real `<label for>` — visually hidden with `cia.sr-only`, never `display: none` ([WCAG 2.2 SC 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html))
- [ ] Keyboard users can open the file dialog with Enter or Space on the focused input — no `role="button"` re-implementation needed ([WCAG 2.2 SC 2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html))
- [ ] The focus ring is visible on the zone when the hidden input has keyboard focus (`:focus-visible + [data-slot="zone"]`) ([WCAG 2.2 SC 2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html))
- [ ] The selected-file count is announced via a polite live region after every add or remove ([WAI-ARIA: aria-live](https://www.w3.org/TR/wai-aria-1.2/#aria-live))
- [ ] Zone-level rejections (too many files) use `role="alert"`; per-file rejections are visible text in the row, not colour alone ([WCAG 2.2 SC 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html))
- [ ] Each progress bar is `role="progressbar"` with `aria-valuenow` and an `aria-label` naming the file ([WAI-ARIA: progressbar role](https://www.w3.org/TR/wai-aria-1.2/#progressbar))
- [ ] Every remove button has an `aria-label` that names its file ("Remove photo.png"), not just "×" ([WCAG 2.2 SC 2.4.6 Headings and Labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html))
- [ ] The zone's dashed border and drag-over state meet non-text contrast against the surface ([WCAG 2.2 SC 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html))
- [ ] Drag-and-drop is an enhancement — the same result is reachable through the dialog, so no pointer-only path exists ([WCAG 2.2 SC 2.5.7 Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html))

## Framework examples

All four implement the same spec: `accept="image/*,.pdf"`, at most 3 files, 2 MB each, rejected files stay listed with an error, a polite count announcement, and progress driven by whatever `uploadFile()` you plug in.

### React

```tsx
"use client";
import { useId, useRef, useState } from "react";
import styles from "./FileUpload.module.scss";

type Item = { id: string; file: File; error?: string; progress?: number };

const ACCEPT = "image/*,.pdf";
const MAX_FILES = 3;
const MAX_BYTES = 2 * 1024 * 1024;

function fileId(f: File) {
  return `${f.name}-${f.size}-${f.lastModified}`;
}
function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
function matchesAccept(f: File, accept: string) {
  return accept.split(",").map((t) => t.trim().toLowerCase()).some((t) =>
    t.startsWith(".") ? f.name.toLowerCase().endsWith(t) : t.endsWith("/*") ? f.type.startsWith(t.slice(0, -1)) : f.type === t,
  );
}
function validate(f: File): string | undefined {
  if (!matchesAccept(f, ACCEPT)) return "File type not allowed";
  if (f.size > MAX_BYTES) return `File exceeds ${formatBytes(MAX_BYTES)}`;
  return undefined;
}

export default function FileUpload({ onFiles }: { onFiles?: (files: File[]) => void }) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [zoneError, setZoneError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const dragDepth = useRef(0);

  function addFiles(list: FileList | null) {
    if (!list) return;
    setZoneError("");
    setItems((prev) => {
      const next = [...prev];
      const seen = new Set(prev.map((i) => i.id));
      for (const file of Array.from(list)) {
        if (seen.has(fileId(file))) continue;
        if (next.length >= MAX_FILES) {
          setZoneError(`You can upload at most ${MAX_FILES} files`);
          break;
        }
        next.push({ id: fileId(file), file, error: validate(file) });
      }
      onFiles?.(next.filter((i) => !i.error).map((i) => i.file));
      return next;
    });
  }

  return (
    <div className={styles.myUpload}>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={ACCEPT}
        multiple
        aria-describedby={`${id}-hint`}
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <label
        htmlFor={id}
        data-slot="zone"
        data-drag-over={dragOver || undefined}
        onDragEnter={(e) => { e.preventDefault(); dragDepth.current++; setDragOver(true); }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => { if (--dragDepth.current === 0) setDragOver(false); }}
        onDrop={(e) => { e.preventDefault(); dragDepth.current = 0; setDragOver(false); addFiles(e.dataTransfer.files); }}
      >
        <span data-slot="zone-title">Drag &amp; drop files here</span>
        <span data-slot="zone-action">or browse</span>
        <span id={`${id}-hint`} data-slot="zone-hint">Images or PDF · up to {MAX_FILES} files · {formatBytes(MAX_BYTES)} each</span>
      </label>

      <p data-slot="status" aria-live="polite">
        {items.length === 0 ? "" : `${items.length} file${items.length === 1 ? "" : "s"} selected`}
      </p>
      {zoneError && <p data-slot="error" role="alert">{zoneError}</p>}

      {items.length > 0 && (
        <ul data-slot="list" aria-label="Selected files">
          {items.map((item) => (
            <li key={item.id} data-slot="item" data-error={item.error ? "true" : undefined}>
              <span data-slot="name">{item.file.name}</span>
              <span data-slot="size">{formatBytes(item.file.size)}</span>
              <button
                type="button"
                data-slot="remove"
                aria-label={`Remove ${item.file.name}`}
                onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
              >
                ×
              </button>
              {item.error ? (
                <span data-slot="item-error">{item.error}</span>
              ) : (
                typeof item.progress === "number" && (
                  <div data-slot="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={item.progress} aria-label={`Uploading ${item.file.name}`}>
                    <div data-slot="fill" style={{ inlineSize: `${item.progress}%` }} />
                  </div>
                )
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Vue

```vue
<script setup>
import { ref, computed } from "vue";

const ACCEPT = "image/*,.pdf";
const MAX_FILES = 3;
const MAX_BYTES = 2 * 1024 * 1024;
const emit = defineEmits(["files"]);

const items = ref([]);
const zoneError = ref("");
const dragOver = ref(false);
let dragDepth = 0;

const fileId = (f) => `${f.name}-${f.size}-${f.lastModified}`;
const formatBytes = (n) => (n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1048576).toFixed(1)} MB`);
const matchesAccept = (f) =>
  ACCEPT.split(",").map((t) => t.trim().toLowerCase()).some((t) =>
    t.startsWith(".") ? f.name.toLowerCase().endsWith(t) : t.endsWith("/*") ? f.type.startsWith(t.slice(0, -1)) : f.type === t,
  );
const validate = (f) => (!matchesAccept(f) ? "File type not allowed" : f.size > MAX_BYTES ? `File exceeds ${formatBytes(MAX_BYTES)}` : undefined);

const status = computed(() => (items.value.length ? `${items.value.length} file${items.value.length === 1 ? "" : "s"} selected` : ""));

function addFiles(list) {
  if (!list) return;
  zoneError.value = "";
  const seen = new Set(items.value.map((i) => i.id));
  for (const file of Array.from(list)) {
    if (seen.has(fileId(file))) continue;
    if (items.value.length >= MAX_FILES) {
      zoneError.value = `You can upload at most ${MAX_FILES} files`;
      break;
    }
    items.value.push({ id: fileId(file), file, error: validate(file) });
  }
  emit("files", items.value.filter((i) => !i.error).map((i) => i.file));
}
function onChange(e) {
  addFiles(e.target.files);
  e.target.value = "";
}
function onDrop(e) {
  dragDepth = 0;
  dragOver.value = false;
  addFiles(e.dataTransfer.files);
}
function remove(id) {
  items.value = items.value.filter((i) => i.id !== id);
}
</script>

<template>
  <div class="my-upload">
    <input id="upload" type="file" :accept="ACCEPT" multiple aria-describedby="upload-hint" @change="onChange" />
    <label
      for="upload"
      data-slot="zone"
      :data-drag-over="dragOver || undefined"
      @dragenter.prevent="dragDepth++; dragOver = true"
      @dragover.prevent
      @dragleave="if (--dragDepth === 0) dragOver = false"
      @drop.prevent="onDrop"
    >
      <span data-slot="zone-title">Drag &amp; drop files here</span>
      <span data-slot="zone-action">or browse</span>
      <span id="upload-hint" data-slot="zone-hint">Images or PDF · up to {{ MAX_FILES }} files · {{ formatBytes(MAX_BYTES) }} each</span>
    </label>

    <p data-slot="status" aria-live="polite">{{ status }}</p>
    <p v-if="zoneError" data-slot="error" role="alert">{{ zoneError }}</p>

    <ul v-if="items.length" data-slot="list" aria-label="Selected files">
      <li v-for="item in items" :key="item.id" data-slot="item" :data-error="item.error ? 'true' : undefined">
        <span data-slot="name">{{ item.file.name }}</span>
        <span data-slot="size">{{ formatBytes(item.file.size) }}</span>
        <button type="button" data-slot="remove" :aria-label="`Remove ${item.file.name}`" @click="remove(item.id)">×</button>
        <span v-if="item.error" data-slot="item-error">{{ item.error }}</span>
        <div
          v-else-if="typeof item.progress === 'number'"
          data-slot="progress"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-valuenow="item.progress"
          :aria-label="`Uploading ${item.file.name}`"
        >
          <div data-slot="fill" :style="{ inlineSize: `${item.progress}%` }"></div>
        </div>
      </li>
    </ul>
  </div>
</template>
```

### Svelte

```svelte
<script>
  const ACCEPT = "image/*,.pdf";
  const MAX_FILES = 3;
  const MAX_BYTES = 2 * 1024 * 1024;
  export let onFiles = (files) => {};

  let items = [];
  let zoneError = "";
  let dragOver = false;
  let dragDepth = 0;

  const fileId = (f) => `${f.name}-${f.size}-${f.lastModified}`;
  const formatBytes = (n) => (n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1048576).toFixed(1)} MB`);
  const matchesAccept = (f) =>
    ACCEPT.split(",").map((t) => t.trim().toLowerCase()).some((t) =>
      t.startsWith(".") ? f.name.toLowerCase().endsWith(t) : t.endsWith("/*") ? f.type.startsWith(t.slice(0, -1)) : f.type === t,
    );
  const validate = (f) => (!matchesAccept(f) ? "File type not allowed" : f.size > MAX_BYTES ? `File exceeds ${formatBytes(MAX_BYTES)}` : undefined);

  $: status = items.length ? `${items.length} file${items.length === 1 ? "" : "s"} selected` : "";

  function addFiles(list) {
    if (!list) return;
    zoneError = "";
    const seen = new Set(items.map((i) => i.id));
    for (const file of Array.from(list)) {
      if (seen.has(fileId(file))) continue;
      if (items.length >= MAX_FILES) {
        zoneError = `You can upload at most ${MAX_FILES} files`;
        break;
      }
      items = [...items, { id: fileId(file), file, error: validate(file) }];
    }
    onFiles(items.filter((i) => !i.error).map((i) => i.file));
  }
</script>

<div class="my-upload">
  <input
    id="upload"
    type="file"
    accept={ACCEPT}
    multiple
    aria-describedby="upload-hint"
    on:change={(e) => { addFiles(e.currentTarget.files); e.currentTarget.value = ""; }}
  />
  <label
    for="upload"
    data-slot="zone"
    data-drag-over={dragOver || undefined}
    on:dragenter|preventDefault={() => { dragDepth++; dragOver = true; }}
    on:dragover|preventDefault
    on:dragleave={() => { if (--dragDepth === 0) dragOver = false; }}
    on:drop|preventDefault={(e) => { dragDepth = 0; dragOver = false; addFiles(e.dataTransfer.files); }}
  >
    <span data-slot="zone-title">Drag &amp; drop files here</span>
    <span data-slot="zone-action">or browse</span>
    <span id="upload-hint" data-slot="zone-hint">Images or PDF · up to {MAX_FILES} files · {formatBytes(MAX_BYTES)} each</span>
  </label>

  <p data-slot="status" aria-live="polite">{status}</p>
  {#if zoneError}<p data-slot="error" role="alert">{zoneError}</p>{/if}

  {#if items.length}
    <ul data-slot="list" aria-label="Selected files">
      {#each items as item (item.id)}
        <li data-slot="item" data-error={item.error ? "true" : undefined}>
          <span data-slot="name">{item.file.name}</span>
          <span data-slot="size">{formatBytes(item.file.size)}</span>
          <button type="button" data-slot="remove" aria-label={`Remove ${item.file.name}`} on:click={() => (items = items.filter((i) => i.id !== item.id))}>×</button>
          {#if item.error}
            <span data-slot="item-error">{item.error}</span>
          {:else if typeof item.progress === "number"}
            <div data-slot="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={item.progress} aria-label={`Uploading ${item.file.name}`}>
              <div data-slot="fill" style:inline-size={`${item.progress}%`}></div>
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</div>
```

### Vanilla (Web Component)

```js
class FileUpload extends HTMLElement {
  static ACCEPT = "image/*,.pdf";
  static MAX_FILES = 3;
  static MAX_BYTES = 2 * 1024 * 1024;

  connectedCallback() {
    const id = `upload-${Math.random().toString(36).slice(2, 8)}`;
    this.classList.add("my-upload");
    this.innerHTML = `
      <input id="${id}" type="file" data-slot="input" accept="${FileUpload.ACCEPT}" multiple aria-describedby="${id}-hint" />
      <label for="${id}" data-slot="zone">
        <span data-slot="zone-title">Drag &amp; drop files here</span>
        <span data-slot="zone-action">or browse</span>
        <span id="${id}-hint" data-slot="zone-hint">Images or PDF · up to ${FileUpload.MAX_FILES} files · 2 MB each</span>
      </label>
      <p data-slot="status" aria-live="polite"></p>
      <p data-slot="error" role="alert" hidden></p>
      <ul data-slot="list" aria-label="Selected files" hidden></ul>`;

    this.items = [];
    const input = this.querySelector("[data-slot=input]");
    const zone = this.querySelector("[data-slot=zone]");
    let depth = 0;

    input.addEventListener("change", () => { this.addFiles(input.files); input.value = ""; });
    zone.addEventListener("dragenter", (e) => { e.preventDefault(); depth++; zone.setAttribute("data-drag-over", ""); });
    zone.addEventListener("dragover", (e) => e.preventDefault());
    zone.addEventListener("dragleave", () => { if (--depth === 0) zone.removeAttribute("data-drag-over"); });
    zone.addEventListener("drop", (e) => { e.preventDefault(); depth = 0; zone.removeAttribute("data-drag-over"); this.addFiles(e.dataTransfer.files); });
    this.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-slot=remove]");
      if (btn) { this.items = this.items.filter((i) => i.id !== btn.dataset.id); this.render(); }
    });
  }

  validate(f) {
    const ok = FileUpload.ACCEPT.split(",").map((t) => t.trim().toLowerCase()).some((t) =>
      t.startsWith(".") ? f.name.toLowerCase().endsWith(t) : t.endsWith("/*") ? f.type.startsWith(t.slice(0, -1)) : f.type === t,
    );
    if (!ok) return "File type not allowed";
    if (f.size > FileUpload.MAX_BYTES) return "File exceeds 2 MB";
  }

  addFiles(list) {
    const error = this.querySelector("[data-slot=error]");
    error.hidden = true;
    const seen = new Set(this.items.map((i) => i.id));
    for (const file of Array.from(list ?? [])) {
      const id = `${file.name}-${file.size}-${file.lastModified}`;
      if (seen.has(id)) continue;
      if (this.items.length >= FileUpload.MAX_FILES) {
        error.textContent = `You can upload at most ${FileUpload.MAX_FILES} files`;
        error.hidden = false;
        break;
      }
      this.items.push({ id, file, error: this.validate(file) });
    }
    this.render();
    this.dispatchEvent(new CustomEvent("files", { detail: this.items.filter((i) => !i.error).map((i) => i.file) }));
  }

  render() {
    const list = this.querySelector("[data-slot=list]");
    const status = this.querySelector("[data-slot=status]");
    const n = this.items.length;
    status.textContent = n ? `${n} file${n === 1 ? "" : "s"} selected` : "";
    list.hidden = n === 0;
    list.innerHTML = this.items.map((i) => `
      <li data-slot="item" ${i.error ? 'data-error="true"' : ""}>
        <span data-slot="name">${i.file.name}</span>
        <span data-slot="size">${Math.round(i.file.size / 1024)} KB</span>
        <button type="button" data-slot="remove" data-id="${i.id}" aria-label="Remove ${i.file.name}">×</button>
        ${i.error ? `<span data-slot="item-error">${i.error}</span>` : ""}
      </li>`).join("");
  }
}
customElements.define("file-upload", FileUpload);
```

## Variants

### Image preview

When every accepted file is an image, swap the text row for a thumbnail grid. `cia.frame` gives each preview a fixed aspect ratio with `object-fit: cover`; the `URL.createObjectURL(file)` you set on the `<img>` must be revoked (`URL.revokeObjectURL`) when the item is removed or the component unmounts, or the memory leaks.

```scss
@use 'css-is-awesome/api' as cia;

.my-upload [data-slot="list"] {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
  gap: cia.space(3);
}

.my-upload [data-slot="preview"] {
  @include cia.frame(1);
  border-radius: cia.radius(md);
}
```

### Single file, replace on pick

Drop `multiple` and set `MAX_FILES = 1`; in `addFiles`, start from an empty list instead of the previous one so a new pick replaces the old. Everything else — validation, announcement, progress — is unchanged.

### Compact

For a form row rather than a hero drop target, shrink the zone to a single line: `@include cia.cluster($gap: 2)` on the zone instead of `stack`, `padding: cia.space(3) cia.space(4)`, and drop the hint into the field's help text.

## Pitfalls

- **Don't `display: none` the input.** It leaves the tab order, the label stops working for keyboard users, and some screen readers no longer expose the control. `cia.sr-only` is the whole reason the recipe works.
- **`accept` is not validation.** The OS dialog filters by it, but a drag-and-drop bypasses it entirely and users can switch the dialog's filter to "All files". Re-check type *and* size in the script.
- **`dragleave` fires on every child boundary.** Without a depth counter (or a `relatedTarget` check) the drag-over highlight flickers as the cursor crosses the zone's own `<span>`s.
- **Reset `input.value` after reading `files`.** Otherwise selecting the same file a second time (after removing it) fires no `change` event.
- **Don't nest the input inside `role="button"`.** A `<label>` already gives you click + keyboard activation; wrapping a real input in a fake button double-announces and double-fires.
- **Object URLs leak.** If you add the image-preview variant, revoke every `createObjectURL` you make.

## Related recipes

- [`form-validation-html5`](./form-validation-html5.md) — the same "native constraint first, style it" doctrine applied to the rest of the form
- [`multi-step-wizard`](./multi-step-wizard.md) — where an upload step usually lives in an onboarding or application flow
