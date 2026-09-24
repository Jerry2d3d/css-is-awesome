---
name: toast
description: Transient notifications — a fixed, stacked region of auto-dismissing status messages with pause-on-hover, a close button and an optional action, announced through the right live-region role for their severity.
category: feedback
complexity: medium
cia-version: ">=1.0.0"
---

## Use this when

You need to tell the user something happened — "Saved", "Upload failed", "Message sent, Undo?" — without interrupting what they're doing. A toast is **non-blocking feedback that goes away on its own**. If the message needs a decision before the user can continue, bail and use the [`confirm-dialog`](./confirm-dialog.md) recipe; if it's a persistent condition (a form error, a degraded connection), use `cia.alert` inline where the problem is, not a toast that disappears.

Build it as **one region, many toasts**: a single fixed-position `<section>` that stacks every notification, rendered once at the app root. Each toast is an ordinary element inside it — no portals, no third-party library. The browser's live-region semantics do the announcing; ~40 lines of JS own the timers.

## Structure (raw HTML)

```html
<section data-cia-recipe="toast" aria-label="Notifications" data-slot="region">
  <div role="status" data-status="success" data-slot="toast">
    <span data-slot="icon" aria-hidden="true">✓</span>
    <div data-slot="body">
      <strong data-slot="title">Saved</strong>
      <span data-slot="message">Your changes are live.</span>
    </div>
    <button type="button" data-slot="action">Undo</button>
    <button type="button" data-slot="close" aria-label="Dismiss notification">×</button>
    <span data-slot="progress" aria-hidden="true"></span>
  </div>

  <div role="alert" data-status="error" data-slot="toast">
    <span data-slot="icon" aria-hidden="true">!</span>
    <div data-slot="body">
      <strong data-slot="title">Upload failed</strong>
      <span data-slot="message">The file exceeded 10 MB.</span>
    </div>
    <button type="button" data-slot="close" aria-label="Dismiss notification">×</button>
    <span data-slot="progress" aria-hidden="true"></span>
  </div>
</section>
```

Notes on the markup:

- **The region exists before the first toast.** Screen readers only reliably announce live-region changes when the region was already in the accessibility tree; a container that mounts *with* its first toast is often silent. Render `[data-slot="region"]` empty at app start.
- **`role` follows severity, not appearance.** `role="status"` (implicitly `aria-live="polite"`) for `info` and `success`; `role="alert"` (`aria-live="assertive"`) for `warning` and `error`. Put the role on the toast itself, not on the region — each toast is then announced once, when it appears, instead of the whole stack re-reading on every change.
- `data-status` carries the visual variant. It's a `data-*` attribute rather than a class because it's cosmetic; the semantic state is already in `role`.
- `[data-slot="progress"]` is the countdown bar — purely decorative, `aria-hidden`. The timer lives in JS; the bar just mirrors it.
- The close button is a real `<button>` with an accessible name. The `×` glyph alone is not a name.

## Styling (cia mixins)

```scss
// Toasts.module.scss — component stylesheet, so import the zero-emit barrel.
@use 'css-is-awesome/api' as cia;

.my-toasts {
  position: fixed;
  inset-block-end: cia.space(4);
  inset-inline-end: cia.space(4);
  z-index: cia.z(toast);
  inline-size: min(24rem, calc(100vw - #{cia.space(8)}));
  pointer-events: none; // the region itself never blocks clicks
  @include cia.stack($gap: 2);

  // Mobile: one full-width column pinned to the bottom edge.
  @include cia.mobile-only {
    inset-inline: cia.space(2);
    inset-block-end: cia.space(2);
    inline-size: auto;
  }
}

.my-toast {
  @include cia.toast-base;
  position: relative;
  overflow: hidden;
  pointer-events: auto;
  align-items: flex-start;
  border-inline-start: 4px solid var(--my-toast-accent, #{cia.color(info-default)});
  @include cia.animate(slide-up, fast);

  &[data-status="info"]    { --my-toast-accent: #{cia.color(info-default)}; }
  &[data-status="success"] { --my-toast-accent: #{cia.color(success-default)}; }
  &[data-status="warning"] { --my-toast-accent: #{cia.color(warning-default)}; }
  &[data-status="error"]   { --my-toast-accent: #{cia.color(error-default)}; }

  &[data-leaving] {
    @include cia.animate(fade-out, fast);
  }

  [data-slot="icon"] {
    flex: none;
    color: var(--my-toast-accent);
    @include cia.font(semibold, 3);
  }

  [data-slot="body"] {
    flex: 1;
    min-inline-size: 0;
    @include cia.stack($gap: 2xs);
  }

  [data-slot="title"] {
    @include cia.font(semibold, 2);
  }

  [data-slot="message"] {
    color: cia.color(text-secondary);
  }

  [data-slot="action"] {
    @include cia.btn(ghost);
    flex: none;
  }

  [data-slot="close"] {
    @include cia.btn-icon($size: 2rem);
    flex: none;
    color: cia.color(text-muted);
  }

  // Countdown bar: JS sets `--my-toast-duration`; hover/focus pauses it.
  [data-slot="progress"] {
    position: absolute;
    inset-block-end: 0;
    inset-inline-start: 0;
    block-size: 3px;
    inline-size: 100%;
    background: var(--my-toast-accent);
    transform-origin: left;
    animation: my-toast-countdown var(--my-toast-duration, 5s) linear forwards;
  }

  &:hover [data-slot="progress"],
  &:focus-within [data-slot="progress"] {
    animation-play-state: paused;
  }
}

@keyframes my-toast-countdown {
  from { transform: scaleX(1); }
  to   { transform: scaleX(0); }
}

@media (prefers-reduced-motion: reduce) {
  .my-toast [data-slot="progress"] {
    animation: none;
    opacity: 0.4;
  }
}
```

`cia.toast-base` gives the surface, shadow, radius, padding and type; the recipe only adds the position, the status accent and the countdown bar. `cia.animate()` handles `prefers-reduced-motion` on its own (it collapses the enter/exit animation to ~0ms); the countdown bar is a hand-written keyframe, so its reduced-motion rule is written out explicitly.

## Interactivity

The browser can't do this one without JS — there's no native "auto-dismiss" primitive — but the script is small and has exactly four jobs:

1. **Push** — create a toast element, set `role`/`data-status`, append it to the region, start a timer for `duration` ms (default 5000; use `0` to mean "sticky, close manually").
2. **Pause / resume** — on `mouseenter` and `focusin` clear the timer and remember how much time was left; on `mouseleave` and `focusout` restart with the remainder. The CSS `animation-play-state: paused` on hover/focus-within keeps the bar in step for free.
3. **Dismiss** — set `data-leaving`, wait for the exit animation's `animationend` (or a short fallback timeout for reduced-motion users), then remove the element. Called by the timer, the close button, or an action button.
4. **Cap the stack** — when more than `max` (say 3) toasts are visible, dismiss the oldest first. An unbounded stack is a bug, not a feature.

Edge cases:

- **Reduced motion.** `animationend` never fires when `animation-duration` is `0.01ms` in a reliable way across engines — always race it against a `setTimeout` fallback so the element is removed either way.
- **SSR.** The region renders empty on the server; toasts only ever exist client-side. Never read `window` or start a timer at module load.
- **Unmount.** Clear every pending timer when the region unmounts (framework examples below all do) or a toast fires `onDismiss` into a dead component.
- **Same message twice.** Pushing an identical toast while one is visible should *reset its timer*, not stack a duplicate — dedupe on `title + message`.

## A11y checklist

- [ ] Info/success toasts use `role="status"`; warning/error toasts use `role="alert"` — assertive interruptions are reserved for things the user must know now ([WAI-ARIA 1.2: status role](https://www.w3.org/TR/wai-aria-1.2/#status), [alert role](https://www.w3.org/TR/wai-aria-1.2/#alert))
- [ ] The notification region is present in the DOM before the first toast is pushed, so live-region announcements are reliable ([WAI-ARIA APG: Alert pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alert/))
- [ ] Auto-dismiss pauses on hover and on keyboard focus, and any toast with an action gives the user enough time to reach it — or doesn't auto-dismiss at all ([WCAG 2.2 SC 2.2.1 Timing Adjustable](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html))
- [ ] Severity is conveyed by the icon, the title and the role — never by the accent colour alone ([WCAG 2.2 SC 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html))
- [ ] The close button has an accessible name ("Dismiss notification"), and every action is a real `<button>` reachable by keyboard ([WCAG 2.2 SC 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html))
- [ ] Toasts don't steal focus when they appear — focus stays where the user was working; the toast is announced, not focused ([WCAG 2.2 SC 3.2.1 On Focus](https://www.w3.org/WAI/WCAG22/Understanding/on-focus.html))
- [ ] Enter/exit motion respects `prefers-reduced-motion` ([WCAG 2.2 SC 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html))

## Framework examples

All four implement the same spec: a `toast()` function, a stacked region, per-toast auto-dismiss with pause-on-hover/focus, a close button and an optional action.

### React

```tsx
"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import styles from "./Toasts.module.scss";

type Status = "info" | "success" | "warning" | "error";
type Toast = {
  id: number;
  status: Status;
  title: string;
  message?: string;
  duration: number;
  action?: { label: string; onClick: () => void };
};

const ToastContext = createContext<(t: Omit<Toast, "id" | "duration"> & { duration?: number }) => void>(() => {});
export const useToast = () => useContext(ToastContext);

const ICONS: Record<Status, string> = { info: "i", success: "✓", warning: "!", error: "!" };
const MAX = 3;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const push = useCallback((t: Omit<Toast, "id" | "duration"> & { duration?: number }) => {
    setToasts((list) => {
      const next = [...list, { ...t, id: nextId.current++, duration: t.duration ?? 5000 }];
      return next.slice(-MAX); // cap the stack, oldest first
    });
  }, []);

  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      {/* Region is always rendered, even when empty — see A11y checklist */}
      <section className={styles.myToasts} aria-label="Notifications">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </section>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const remaining = useRef(toast.duration);
  const startedAt = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback(() => {
    if (toast.duration === 0) return;
    startedAt.current = Date.now();
    timer.current = setTimeout(onDismiss, remaining.current);
  }, [toast.duration, onDismiss]);

  const pause = useCallback(() => {
    if (!timer.current) return;
    clearTimeout(timer.current);
    timer.current = null;
    remaining.current -= Date.now() - startedAt.current;
  }, []);

  useEffect(() => {
    start();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [start]);

  const assertive = toast.status === "warning" || toast.status === "error";

  return (
    <div
      className={styles.myToast}
      role={assertive ? "alert" : "status"}
      data-status={toast.status}
      style={{ "--my-toast-duration": `${toast.duration}ms` } as React.CSSProperties}
      onMouseEnter={pause}
      onMouseLeave={start}
      onFocus={pause}
      onBlur={start}
    >
      <span data-slot="icon" aria-hidden="true">{ICONS[toast.status]}</span>
      <div data-slot="body">
        <strong data-slot="title">{toast.title}</strong>
        {toast.message && <span data-slot="message">{toast.message}</span>}
      </div>
      {toast.action && (
        <button type="button" data-slot="action" onClick={() => { toast.action?.onClick(); onDismiss(); }}>
          {toast.action.label}
        </button>
      )}
      <button type="button" data-slot="close" aria-label="Dismiss notification" onClick={onDismiss}>
        ×
      </button>
      {toast.duration > 0 && <span data-slot="progress" aria-hidden="true" />}
    </div>
  );
}
```

The `style` attribute here sets only the `--my-toast-duration` custom property that the countdown bar reads — a per-instance value that can't come from a stylesheet, not an appearance override.

### Vue

```vue
<script setup>
import { ref, onBeforeUnmount } from "vue";

const MAX = 3;
const ICONS = { info: "i", success: "✓", warning: "!", error: "!" };
const toasts = ref([]);
const timers = new Map(); // id → { handle, remaining, startedAt }
let nextId = 0;

function dismiss(id) {
  const t = timers.get(id);
  if (t?.handle) clearTimeout(t.handle);
  timers.delete(id);
  toasts.value = toasts.value.filter((x) => x.id !== id);
}
function start(id) {
  const t = timers.get(id);
  if (!t || t.remaining <= 0) return;
  t.startedAt = Date.now();
  t.handle = setTimeout(() => dismiss(id), t.remaining);
}
function pause(id) {
  const t = timers.get(id);
  if (!t?.handle) return;
  clearTimeout(t.handle);
  t.handle = null;
  t.remaining -= Date.now() - t.startedAt;
}
function push({ status = "info", title, message, duration = 5000, action }) {
  const id = nextId++;
  toasts.value = [...toasts.value, { id, status, title, message, duration, action }].slice(-MAX);
  if (duration > 0) {
    timers.set(id, { handle: null, remaining: duration, startedAt: 0 });
    start(id);
  }
}
onBeforeUnmount(() => timers.forEach((t) => t.handle && clearTimeout(t.handle)));

defineExpose({ push });
</script>

<template>
  <section class="my-toasts" aria-label="Notifications">
    <div
      v-for="t in toasts"
      :key="t.id"
      class="my-toast"
      :role="t.status === 'warning' || t.status === 'error' ? 'alert' : 'status'"
      :data-status="t.status"
      :style="{ '--my-toast-duration': t.duration + 'ms' }"
      @mouseenter="pause(t.id)"
      @mouseleave="start(t.id)"
      @focusin="pause(t.id)"
      @focusout="start(t.id)"
    >
      <span data-slot="icon" aria-hidden="true">{{ ICONS[t.status] }}</span>
      <div data-slot="body">
        <strong data-slot="title">{{ t.title }}</strong>
        <span v-if="t.message" data-slot="message">{{ t.message }}</span>
      </div>
      <button v-if="t.action" type="button" data-slot="action" @click="t.action.onClick(); dismiss(t.id)">
        {{ t.action.label }}
      </button>
      <button type="button" data-slot="close" aria-label="Dismiss notification" @click="dismiss(t.id)">×</button>
      <span v-if="t.duration > 0" data-slot="progress" aria-hidden="true"></span>
    </div>
  </section>
</template>
```

### Svelte

```svelte
<script>
  import { onDestroy } from "svelte";

  const MAX = 3;
  const ICONS = { info: "i", success: "✓", warning: "!", error: "!" };
  let toasts = [];
  const timers = new Map();
  let nextId = 0;

  function dismiss(id) {
    const t = timers.get(id);
    if (t?.handle) clearTimeout(t.handle);
    timers.delete(id);
    toasts = toasts.filter((x) => x.id !== id);
  }
  function start(id) {
    const t = timers.get(id);
    if (!t || t.remaining <= 0) return;
    t.startedAt = Date.now();
    t.handle = setTimeout(() => dismiss(id), t.remaining);
  }
  function pause(id) {
    const t = timers.get(id);
    if (!t?.handle) return;
    clearTimeout(t.handle);
    t.handle = null;
    t.remaining -= Date.now() - t.startedAt;
  }
  export function push({ status = "info", title, message, duration = 5000, action }) {
    const id = nextId++;
    toasts = [...toasts, { id, status, title, message, duration, action }].slice(-MAX);
    if (duration > 0) {
      timers.set(id, { handle: null, remaining: duration, startedAt: 0 });
      start(id);
    }
  }
  onDestroy(() => timers.forEach((t) => t.handle && clearTimeout(t.handle)));
</script>

<section class="my-toasts" aria-label="Notifications">
  {#each toasts as t (t.id)}
    <div
      class="my-toast"
      role={t.status === "warning" || t.status === "error" ? "alert" : "status"}
      data-status={t.status}
      style="--my-toast-duration: {t.duration}ms"
      on:mouseenter={() => pause(t.id)}
      on:mouseleave={() => start(t.id)}
      on:focusin={() => pause(t.id)}
      on:focusout={() => start(t.id)}
    >
      <span data-slot="icon" aria-hidden="true">{ICONS[t.status]}</span>
      <div data-slot="body">
        <strong data-slot="title">{t.title}</strong>
        {#if t.message}<span data-slot="message">{t.message}</span>{/if}
      </div>
      {#if t.action}
        <button type="button" data-slot="action" on:click={() => { t.action.onClick(); dismiss(t.id); }}>
          {t.action.label}
        </button>
      {/if}
      <button type="button" data-slot="close" aria-label="Dismiss notification" on:click={() => dismiss(t.id)}>×</button>
      {#if t.duration > 0}<span data-slot="progress" aria-hidden="true"></span>{/if}
    </div>
  {/each}
</section>
```

### Vanilla (Web Component)

```js
const ICONS = { info: "i", success: "✓", warning: "!", error: "!" };
const MAX = 3;

class MyToasts extends HTMLElement {
  connectedCallback() {
    this.setAttribute("role", "region");
    this.setAttribute("aria-label", "Notifications");
    this.classList.add("my-toasts");
  }

  push({ status = "info", title, message = "", duration = 5000, action } = {}) {
    while (this.children.length >= MAX) this.dismiss(this.firstElementChild);

    const el = document.createElement("div");
    el.className = "my-toast";
    el.dataset.status = status;
    el.setAttribute("role", status === "warning" || status === "error" ? "alert" : "status");
    el.style.setProperty("--my-toast-duration", `${duration}ms`);
    el.innerHTML = `
      <span data-slot="icon" aria-hidden="true">${ICONS[status]}</span>
      <div data-slot="body">
        <strong data-slot="title"></strong>
        <span data-slot="message"></span>
      </div>
      ${action ? '<button type="button" data-slot="action"></button>' : ""}
      <button type="button" data-slot="close" aria-label="Dismiss notification">×</button>
      ${duration > 0 ? '<span data-slot="progress" aria-hidden="true"></span>' : ""}`;
    el.querySelector('[data-slot="title"]').textContent = title;
    el.querySelector('[data-slot="message"]').textContent = message;
    el.querySelector('[data-slot="close"]').addEventListener("click", () => this.dismiss(el));
    if (action) {
      const btn = el.querySelector('[data-slot="action"]');
      btn.textContent = action.label;
      btn.addEventListener("click", () => { action.onClick(); this.dismiss(el); });
    }

    // Timer with pause/resume on hover + focus.
    let remaining = duration, startedAt = 0, handle = null;
    const start = () => {
      if (remaining <= 0) return;
      startedAt = Date.now();
      handle = setTimeout(() => this.dismiss(el), remaining);
    };
    const pause = () => {
      if (!handle) return;
      clearTimeout(handle);
      handle = null;
      remaining -= Date.now() - startedAt;
    };
    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", start);
    el.addEventListener("focusin", pause);
    el.addEventListener("focusout", start);
    el._stop = () => handle && clearTimeout(handle);

    this.append(el);
    if (duration > 0) start();
    return el;
  }

  dismiss(el) {
    if (!el || el.hasAttribute("data-leaving")) return;
    el._stop?.();
    el.setAttribute("data-leaving", "");
    // Race animationend against a fallback so reduced-motion users aren't stuck.
    const remove = () => el.remove();
    el.addEventListener("animationend", remove, { once: true });
    setTimeout(remove, 400);
  }
}
customElements.define("my-toasts", MyToasts);

// Usage: <my-toasts></my-toasts> once at the app root, then
// document.querySelector("my-toasts").push({ status: "success", title: "Saved" });
```

## Variants

### Top layer via `[popover="manual"]`

If the toast region can be covered by a `<dialog>` or another stacking context you don't control, promote it to the browser's top layer with the Popover API — `popover="manual"` means no light-dismiss and no Esc-to-close, exactly what a persistent region wants. Browser floor: Chrome ≥114, Safari ≥17, Firefox ≥125; the `position: fixed` default above is the fallback everywhere else.

```html
<section data-cia-recipe="toast" aria-label="Notifications" data-slot="region" popover="manual"></section>
```

```scss
@use 'css-is-awesome/api' as cia;

.my-toasts[popover] {
  // Popovers reset to the centre of the viewport with a border and padding —
  // re-pin the region and clear the UA styling.
  inset: auto cia.space(4) cia.space(4) auto;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  overflow: visible;
}
```

Call `region.showPopover()` once at startup (guarded by `"showPopover" in region`) and leave it open; `z-index` is irrelevant in the top layer.

### Top-of-screen placement

Swap the block edge — useful when the bottom of the viewport is already occupied by a dock or a bottom nav (see the [`bottom-nav`](./bottom-nav.md) recipe).

```scss
@use 'css-is-awesome/api' as cia;

.my-toasts {
  inset-block-end: auto;
  inset-block-start: cia.space(4);
}
.my-toast {
  @include cia.animate(slide-down, fast);
}
```

## Pitfalls

- **Don't put `aria-live` on the region and `role="alert"` on the toasts.** Nesting live regions makes some screen readers announce twice and others not at all. One live role, on the toast, is enough.
- **Don't mount the region lazily with the first toast.** The first notification is the one that gets swallowed — the region has to exist first.
- **Don't auto-dismiss a toast that carries an action** unless the timer is generous and pauses on hover/focus. A "Undo" that vanishes before the user can reach it fails WCAG 2.2.1 and, worse, feels like a trap.
- **Don't rely on `animationend` alone to remove the element.** With `prefers-reduced-motion` (or a stylesheet that never loaded) the event may never fire and the toast stays forever — always race a fallback timeout.
- **Don't let the stack grow unbounded.** Cap it (3 is plenty) and drop the oldest; a wall of ten toasts is noise, not feedback.

## Related recipes

- [`confirm-dialog`](./confirm-dialog.md) — for feedback that needs a decision before the user can continue
- [`form-validation-async`](./form-validation-async.md) — a natural producer of success/error toasts after a server round-trip
- [`bottom-nav`](./bottom-nav.md) — when the bottom edge is taken, use the top-of-screen variant above
