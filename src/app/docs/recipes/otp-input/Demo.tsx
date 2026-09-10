"use client";
import { useRef, useState } from "react";
import styles from "./demo.module.scss";

const LENGTH = 6;
const VALID_CODE = "123456";

export default function OtpInputDemo() {
  const [values, setValues] = useState<string[]>(Array(LENGTH).fill(""));
  const [invalid, setInvalid] = useState(false);
  const [result, setResult] = useState<"idle" | "success">("idle");
  const [announce, setAnnounce] = useState("");
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function checkComplete(next: string[]) {
    if (!next.every(Boolean)) return;
    const code = next.join("");
    if (code === VALID_CODE) {
      setInvalid(false);
      setResult("success");
    } else {
      setInvalid(true);
      setResult("idle");
      refs.current[0]?.focus();
      refs.current[0]?.select();
    }
  }

  function setDigit(i: number, digit: string) {
    const next = [...values];
    next[i] = digit;
    setValues(next);
    setInvalid(false);
    if (digit && i < LENGTH - 1) refs.current[i + 1]?.focus();
    checkComplete(next);
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !values[i] && i > 0) {
      refs.current[i - 1]?.focus();
      setDigit(i - 1, "");
    } else if (e.key === "ArrowLeft" && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < LENGTH - 1) {
      refs.current[i + 1]?.focus();
    }
  }

  function handlePaste(i: number, e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const chars = e.clipboardData.getData("text").replace(/\D/g, "").split("");
    if (!chars.length) return;
    const next = [...values];
    let cursor = i;
    for (const c of chars) {
      if (cursor >= LENGTH) break;
      next[cursor] = c;
      cursor++;
    }
    setValues(next);
    setInvalid(false);
    refs.current[Math.min(cursor, LENGTH - 1)]?.focus();
    setAnnounce("Code entered.");
    checkComplete(next);
  }

  function reset() {
    setValues(Array(LENGTH).fill(""));
    setInvalid(false);
    setResult("idle");
    refs.current[0]?.focus();
  }

  if (result === "success") {
    return (
      <div className={styles.successPanel} role="status">
        <p>Verified — code accepted.</p>
        <button type="button" className={styles.resetBtn} onClick={reset}>
          Reset demo
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className={styles.hint}>
        Try <code>{VALID_CODE}</code> — anything else shows an error. Paste a 6-digit string to try
        auto-distribution.
      </p>
      <div className={styles.otpInput} role="group" aria-label="Verification code">
        {values.map((v, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            autoComplete={i === 0 ? "one-time-code" : "off"}
            aria-label={`Digit ${i + 1} of ${LENGTH}`}
            value={v}
            data-filled={Boolean(v)}
            data-invalid={invalid}
            onChange={(e) => setDigit(i, e.target.value.replace(/\D/g, "").slice(-1))}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={(e) => handlePaste(i, e)}
          />
        ))}
      </div>
      {invalid && (
        <p className={styles.error} role="alert">
          Incorrect code. Try again.
        </p>
      )}
      <span className={styles.srOnly} aria-live="polite">
        {announce}
      </span>
    </div>
  );
}
