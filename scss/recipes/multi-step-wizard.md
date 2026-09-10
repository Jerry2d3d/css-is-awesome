---
name: multi-step-wizard
description: Step orchestration (current step, per-step validation gating, error summary) built on cia's existing stepper mixin.
category: forms
complexity: medium
cia-version: ">=1.0.0"
---

## Use this when

You're building an onboarding flow or a checkout — several logical steps, each with its own fields, navigated with Back/Next and a final Submit. This recipe is the **orchestration logic** (which step is current, whether the current step is allowed to advance, how the error summary reads) — the visual step indicator itself is cia's existing `stepper` mixin, cross-linked rather than restyled. Field-level validation inside a given step is [`form-validation-html5`](./form-validation-html5.md) or whichever validation recipe you're already using — this recipe wraps around it, one step at a time.

## Structure (raw HTML)

```html
<div data-cia-recipe="multi-step-wizard">
  <ol data-slot="stepper" aria-hidden="true">
    <li data-status="completed"><span data-slot="circle">✓</span><span data-slot="label">Account</span></li>
    <li data-status="active"><span data-slot="circle">2</span><span data-slot="label">Profile</span></li>
    <li data-status="upcoming"><span data-slot="circle">3</span><span data-slot="label">Review</span></li>
  </ol>
  <p data-slot="step-status" aria-live="polite">Step 2 of 3: Profile</p>

  <div data-slot="error-summary" role="alert" hidden>
    Please fix the highlighted fields before continuing.
  </div>

  <div data-slot="step" role="group" aria-label="Profile">
    <!-- current step's fields go here -->
  </div>

  <div data-slot="nav">
    <button type="button" data-slot="back">Back</button>
    <button type="button" data-slot="next">Next</button>
    <!-- data-slot="submit" replaces data-slot="next" only on the last step -->
  </div>
</div>
```

Notes on the markup:
- `[data-slot="stepper"]` is `aria-hidden="true"` — it's a visual progress indicator, and `[data-slot="step-status"]`'s `aria-live="polite"` text ("Step 2 of 3: Profile") is what actually gets announced on a step change, once, in plain language. Exposing both would double-announce the same information in two different shapes.
- The error summary element exists in the markup `hidden` by default and is only revealed (and its `role="alert"` allowed to fire) on a failed Next/Submit attempt — never shown pre-emptively.
- `[data-slot="step"]` is a single `role="group"` region whose content is swapped per step, not three parallel step containers toggled with `hidden` — screen reader users landing in the group hear one label ("Profile"), not stale content from a step they've left.
- The Back/Next/Submit row lives outside `[data-slot="step"]` so it never gets replaced along with step content.

## Styling (cia mixins)

```scss
// MultiStepWizard.module.scss
@use 'css-is-awesome/api' as cia;

[data-slot="stepper"] {
  @include cia.stepper;
  margin-block-end: cia.space(5);
}

[data-slot="step-status"] {
  @include cia.sr-only;
}

[data-slot="error-summary"] {
  @include cia.pad(3);
  border-radius: cia.radius(md);
  background: cia.color(error-subtle);
  color: cia.color(error-text);
  margin-block-end: cia.space(4);
}

[data-slot="step"] {
  @include cia.stack($gap: 4);
  margin-block-end: cia.space(5);
}

[data-slot="nav"] {
  @include cia.toolbar($gap: 3);
}
[data-slot="back"]   { @include cia.btn(ghost); }
[data-slot="next"],
[data-slot="submit"] { @include cia.btn(primary); }
```

## Interactivity

- **State:** `currentStep` (an index), plus each step's own validity (however the step's own fields report it — a `validate()` callback per step is the simplest contract).
- **Back:** always allowed, disabled only on step 0. Going back never runs the leaving step's own validator — a half-filled step never gets marked errored just because the user retreated from it. It's validated again on the way forward, and again on Submit.
- **Next:** runs the *current* step's validator. Passes → advance `currentStep`, move focus to the new step's first field, announce the new step via `[data-slot="step-status"]`. Fails → reveal the error summary, keep the step, don't advance.
- **Submit** (replaces Next only on the **last** step): re-runs **every** step's validator, not only the ones visited — a step a user skipped past via a prior "allow skip on error" setting still has to pass before final submit. Any failure blocks submission and reveals the summary; all pass → fire the real submit handler.
- **Rendered button, not two DOM nodes:** Next and Submit are the same slot with a different label/handler depending on `currentStep === lastStep`, so there's exactly one primary action button in the tab order at any time, never a hidden duplicate.

## A11y checklist

- [ ] The visual stepper is `aria-hidden`; a separate `aria-live="polite"` text element is what's actually announced on step change, in one sentence, not the raw list-item markup ([WCAG 2.2 SC 4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html))
- [ ] The current step's content is a single `role="group"` with an `aria-label` naming that step, replaced per-step rather than several regions toggled with `hidden` ([WAI-ARIA: group role](https://www.w3.org/TR/wai-aria-1.2/#group))
- [ ] On advancing to a new step, focus moves to that step's first focusable field, not left on the Next button that's no longer in the same visual position
- [ ] The error summary is `role="alert"` and only fires when a validation attempt actually fails — never present-but-hidden-by-CSS in a way a screen reader would still read
- [ ] The active step's stepper indicator (even though `aria-hidden`) is styled distinctly and isn't the *only* way sighted users can tell which step is current — the step-status text is visible too, not screen-reader-only

## Framework examples

### React

```tsx
"use client";
import { useState } from "react";
import styles from "./MultiStepWizard.module.scss";

type Step = { label: string; content: React.ReactNode; validate?: () => boolean };

export default function MultiStepWizard({ steps, onSubmit }: { steps: Step[]; onSubmit: () => void }) {
  const [current, setCurrent] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const isLast = current === steps.length - 1;

  function handleNext() {
    const step = steps[current];
    if (step.validate && !step.validate()) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    setCurrent((c) => Math.min(c + 1, steps.length - 1));
  }

  function handleSubmit() {
    const allValid = steps.every((s) => !s.validate || s.validate());
    if (!allValid) {
      setShowErrors(true);
      return;
    }
    onSubmit();
  }

  return (
    <div>
      <ol className={styles.stepper} aria-hidden="true">
        {steps.map((s, i) => (
          <li key={s.label} data-status={i < current ? "completed" : i === current ? "active" : "upcoming"}>
            <span data-slot="circle">{i < current ? "✓" : i + 1}</span>
            <span data-slot="label">{s.label}</span>
          </li>
        ))}
      </ol>
      <p className={styles.stepStatus} aria-live="polite">
        Step {current + 1} of {steps.length}: {steps[current].label}
      </p>

      {showErrors && (
        <div className={styles.errorSummary} role="alert">
          Please fix the highlighted fields before continuing.
        </div>
      )}

      <div className={styles.step} role="group" aria-label={steps[current].label}>
        {steps[current].content}
      </div>

      <div className={styles.nav}>
        <button type="button" disabled={current === 0} onClick={() => setCurrent((c) => Math.max(0, c - 1))}>
          Back
        </button>
        {isLast ? (
          <button type="button" onClick={handleSubmit}>
            Submit
          </button>
        ) : (
          <button type="button" onClick={handleNext}>
            Next
          </button>
        )}
      </div>
    </div>
  );
}
```

### Vue

```vue
<script setup>
import { ref, computed } from "vue";

const props = defineProps<{ steps: { label: string; validate?: () => boolean }[] }>();
const emit = defineEmits(["submit"]);

const current = ref(0);
const showErrors = ref(false);
const isLast = computed(() => current.value === props.steps.length - 1);

function next() {
  const step = props.steps[current.value];
  if (step.validate && !step.validate()) {
    showErrors.value = true;
    return;
  }
  showErrors.value = false;
  current.value = Math.min(current.value + 1, props.steps.length - 1);
}
function submit() {
  const allValid = props.steps.every((s) => !s.validate || s.validate());
  if (!allValid) {
    showErrors.value = true;
    return;
  }
  emit("submit");
}
</script>

<template>
  <div>
    <ol class="stepper" aria-hidden="true">
      <li v-for="(s, i) in steps" :key="s.label" :data-status="i < current ? 'completed' : i === current ? 'active' : 'upcoming'">
        <span data-slot="circle">{{ i < current ? "✓" : i + 1 }}</span>
        <span data-slot="label">{{ s.label }}</span>
      </li>
    </ol>
    <p class="step-status" aria-live="polite">Step {{ current + 1 }} of {{ steps.length }}: {{ steps[current].label }}</p>

    <div v-if="showErrors" class="error-summary" role="alert">Please fix the highlighted fields before continuing.</div>

    <div class="step" role="group" :aria-label="steps[current].label">
      <slot :name="`step-${current}`" />
    </div>

    <div class="nav">
      <button type="button" :disabled="current === 0" @click="current = Math.max(0, current - 1)">Back</button>
      <button type="button" @click="isLast ? submit() : next()">{{ isLast ? "Submit" : "Next" }}</button>
    </div>
  </div>
</template>
```

### Svelte

```svelte
<script>
  export let steps; // { label, validate? }[]
  export let onSubmit = () => {};

  let current = 0;
  let showErrors = false;
  $: isLast = current === steps.length - 1;

  function next() {
    const step = steps[current];
    if (step.validate && !step.validate()) {
      showErrors = true;
      return;
    }
    showErrors = false;
    current = Math.min(current + 1, steps.length - 1);
  }
  function submit() {
    const allValid = steps.every((s) => !s.validate || s.validate());
    if (!allValid) {
      showErrors = true;
      return;
    }
    onSubmit();
  }
</script>

<ol class="stepper" aria-hidden="true">
  {#each steps as s, i}
    <li data-status={i < current ? "completed" : i === current ? "active" : "upcoming"}>
      <span data-slot="circle">{i < current ? "✓" : i + 1}</span>
      <span data-slot="label">{s.label}</span>
    </li>
  {/each}
</ol>
<p class="step-status" aria-live="polite">Step {current + 1} of {steps.length}: {steps[current].label}</p>

{#if showErrors}
  <div class="error-summary" role="alert">Please fix the highlighted fields before continuing.</div>
{/if}

<div class="step" role="group" aria-label={steps[current].label}>
  <slot name="step" {current} />
</div>

<div class="nav">
  <button type="button" disabled={current === 0} on:click={() => (current = Math.max(0, current - 1))}>Back</button>
  <button type="button" on:click={isLast ? submit : next}>{isLast ? "Submit" : "Next"}</button>
</div>
```

### Vanilla (Web Component)

```js
class MultiStepWizard extends HTMLElement {
  constructor() {
    super();
    this.steps = []; // set by the consumer: [{ label, render(container), validate }]
    this.current = 0;
  }

  connectedCallback() {
    this.innerHTML = `
      <ol data-slot="stepper" aria-hidden="true"></ol>
      <p data-slot="step-status" aria-live="polite"></p>
      <div data-slot="error-summary" role="alert" hidden>Please fix the highlighted fields before continuing.</div>
      <div data-slot="step" role="group"></div>
      <div data-slot="nav">
        <button type="button" data-slot="back">Back</button>
        <button type="button" data-slot="next">Next</button>
      </div>
    `;
    this.querySelector('[data-slot="back"]').addEventListener("click", () => this._go(this.current - 1, false));
    this.querySelector('[data-slot="next"]').addEventListener("click", () => this._advance());
    this._render();
  }

  _advance() {
    const step = this.steps[this.current];
    if (step.validate && !step.validate()) {
      this.querySelector('[data-slot="error-summary"]').hidden = false;
      return;
    }
    this.querySelector('[data-slot="error-summary"]').hidden = true;
    if (this.current === this.steps.length - 1) {
      const allValid = this.steps.every((s) => !s.validate || s.validate());
      if (allValid) this.dispatchEvent(new CustomEvent("wizard-submit"));
      return;
    }
    this._go(this.current + 1, true);
  }

  _go(i) {
    this.current = Math.max(0, Math.min(i, this.steps.length - 1));
    this._render();
  }

  _render() {
    const stepper = this.querySelector('[data-slot="stepper"]');
    stepper.innerHTML = this.steps
      .map(
        (s, i) =>
          `<li data-status="${i < this.current ? "completed" : i === this.current ? "active" : "upcoming"}">
            <span data-slot="circle">${i < this.current ? "✓" : i + 1}</span>
            <span data-slot="label">${s.label}</span>
          </li>`,
      )
      .join("");
    this.querySelector('[data-slot="step-status"]').textContent =
      `Step ${this.current + 1} of ${this.steps.length}: ${this.steps[this.current].label}`;
    const stepEl = this.querySelector('[data-slot="step"]');
    stepEl.setAttribute("aria-label", this.steps[this.current].label);
    stepEl.innerHTML = "";
    this.steps[this.current].render(stepEl);
    this.querySelector('[data-slot="back"]').disabled = this.current === 0;
    this.querySelector('[data-slot="next"]').textContent = this.current === this.steps.length - 1 ? "Submit" : "Next";
  }
}
customElements.define("multi-step-wizard", MultiStepWizard);
```

## Pitfalls

- **Don't validate the step being left when the user clicks Back.** It punishes retreating from a half-filled step with an error state the user didn't ask for yet — only forward navigation and Submit should trigger validation.
- **Don't render all steps' DOM at once and toggle visibility.** A hidden step's fields are still in the tab order in some browsers unless every one is carefully `inert`ed, and a single swapped `[data-slot="step"]` sidesteps the whole problem.
- **Don't let Submit trust only the currently-visited steps.** A user who used a "skip on error" affordance to jump ahead can reach the last step with an earlier step still invalid — Submit must re-check everything.

## Related recipes

- [`form-validation-html5`](./form-validation-html5.md) — what a single step's own field validation should look like
- [`auth-flow`](./auth-flow.md) — the submit/loading/error handling pattern once the wizard's final step actually submits somewhere
