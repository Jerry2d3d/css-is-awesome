"use client";
import { useRef, useState } from "react";
import styles from "./demo.module.scss";

function simulateWrite(shouldFail: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => (shouldFail ? reject(new Error("simulated failure")) : resolve()), 400);
  });
}

export default function SuccessStatesDemo() {
  // Pattern 1 — inline checkmark, valid once 3+ characters are typed.
  const [nameValid, setNameValid] = useState(false);

  // Pattern 2 — summary banner, shown once on "submit".
  const [submitted, setSubmitted] = useState(false);

  // Pattern 3 — optimistic toggle. Every OTHER toggle is simulated to fail
  // (deterministic, not random, so the rollback is reliably demoable/testable).
  const [checked, setChecked] = useState(false);
  const [failed, setFailed] = useState(false);
  const attempts = useRef(0);

  async function handleToggle(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.checked;
    setChecked(next); // optimistic
    attempts.current += 1;
    const shouldFail = attempts.current % 2 === 0;
    try {
      await simulateWrite(shouldFail);
    } catch {
      setChecked(!next); // rollback
      setFailed(true);
      setTimeout(() => setFailed(false), 2000);
    }
  }

  return (
    <>
      <div className={styles.field} data-status={nameValid ? "valid" : "idle"}>
        <label htmlFor="demo-success-name">Display name</label>
        <div className={styles.inputWrap}>
          <input
            id="demo-success-name"
            onChange={(e) => setNameValid(e.target.value.trim().length >= 3)}
          />
          <span className={styles.check} aria-hidden="true" />
        </div>
        <p style={{ fontSize: "0.8em", opacity: 0.7 }}>Pattern 1: type 3+ characters.</p>
      </div>

      <button type="button" onClick={() => setSubmitted(true)}>
        Simulate submit
      </button>
      {submitted && (
        <div className={styles.banner} data-kind="success" role="status">
          Account created — check your email to verify.
        </div>
      )}
      <p style={{ fontSize: "0.8em", opacity: 0.7, maxWidth: "22rem" }}>Pattern 2, above.</p>

      <label className={styles.toggle} data-failed={failed}>
        <input type="checkbox" checked={checked} onChange={handleToggle} />
        Email me weekly digests
      </label>
      <p style={{ fontSize: "0.8em", opacity: 0.7, maxWidth: "22rem" }}>
        Pattern 3: every other toggle is simulated to fail and rolls back —
        toggle it a few times to see both outcomes.
      </p>
    </>
  );
}
