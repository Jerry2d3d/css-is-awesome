"use client";
import { useRef, useState } from "react";
import styles from "./demo.module.scss";

type FormState = { email: string; password: string; name: string };

const STEP_LABELS = ["Account", "Profile", "Review"];

export default function MultiStepWizardDemo() {
  const [current, setCurrent] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormState>({ email: "", password: "", name: "" });
  const stepRef = useRef<HTMLDivElement>(null);
  const isLast = current === STEP_LABELS.length - 1;

  function validateStep(i: number): boolean {
    if (i === 0) return form.email.trim() !== "" && form.password.trim().length >= 6;
    return true; // Profile (optional) and Review have nothing to validate
  }

  function focusFirstField() {
    const first = stepRef.current?.querySelector<HTMLElement>("input, textarea, select");
    first?.focus();
  }

  function goTo(i: number, announce: boolean) {
    setCurrent(i);
    if (announce) requestAnimationFrame(focusFirstField);
  }

  function handleBack() {
    setShowErrors(false);
    goTo(Math.max(0, current - 1), true);
  }

  function handleNext() {
    if (!validateStep(current)) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    goTo(Math.min(current + 1, STEP_LABELS.length - 1), true);
  }

  function handleSubmit() {
    const allValid = STEP_LABELS.every((_, i) => validateStep(i));
    if (!allValid) {
      setShowErrors(true);
      return;
    }
    setSubmitted(true);
  }

  function reset() {
    setCurrent(0);
    setShowErrors(false);
    setSubmitted(false);
    setForm({ email: "", password: "", name: "" });
  }

  if (submitted) {
    return (
      <div className={styles.successPanel} role="status">
        <p>
          Submitted — welcome, <strong>{form.name || form.email}</strong>.
        </p>
        <button type="button" className={styles.resetBtn} onClick={reset}>
          Reset demo
        </button>
      </div>
    );
  }

  return (
    <div>
      <ol className={styles.stepper} aria-hidden="true">
        {STEP_LABELS.map((label, i) => (
          <li key={label} data-status={i < current ? "completed" : i === current ? "active" : "upcoming"}>
            <span data-slot="circle">{i < current ? "✓" : i + 1}</span>
            <span data-slot="label">{label}</span>
          </li>
        ))}
      </ol>
      <p className={styles.stepStatus} aria-live="polite">
        Step {current + 1} of {STEP_LABELS.length}: {STEP_LABELS[current]}
      </p>

      {showErrors && (
        <div className={styles.errorSummary} role="alert">
          {current === 0 ? "Email and a password of at least 6 characters are required." : "Please fix the highlighted fields before continuing."}
        </div>
      )}

      <div className={styles.step} role="group" aria-label={STEP_LABELS[current]} ref={stepRef}>
        {current === 0 && (
          <>
            <div className={styles.field}>
              <label htmlFor="wizard-email">Email</label>
              <input
                id="wizard-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="wizard-password">Password</label>
              <input
                id="wizard-password"
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
            </div>
          </>
        )}
        {current === 1 && (
          <div className={styles.field}>
            <label htmlFor="wizard-name">Name (optional)</label>
            <input id="wizard-name" type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
        )}
        {current === 2 && (
          <dl className={styles.review}>
            <div>
              <dt>Email</dt>
              <dd>{form.email || "—"}</dd>
            </div>
            <div>
              <dt>Name</dt>
              <dd>{form.name || "—"}</dd>
            </div>
          </dl>
        )}
      </div>

      <div className={styles.nav}>
        <button type="button" className={styles.backBtn} disabled={current === 0} onClick={handleBack}>
          Back
        </button>
        {isLast ? (
          <button type="button" className={styles.submitBtn} onClick={handleSubmit}>
            Submit
          </button>
        ) : (
          <button type="button" className={styles.nextBtn} onClick={handleNext}>
            Next
          </button>
        )}
      </div>
    </div>
  );
}
