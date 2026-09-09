"use client";
import { useRef, useState } from "react";
import styles from "./demo.module.scss";

export default function Html5Demo() {
  const formRef = useRef<HTMLFormElement>(null);
  const [summary, setSummary] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;
    if (!form.checkValidity()) {
      const invalid = Array.from(form.elements).filter(
        (el): el is HTMLInputElement => el instanceof HTMLInputElement && el.willValidate && !el.validity.valid,
      );
      setSummary(
        `Fix ${invalid.length} field${invalid.length === 1 ? "" : "s"}: ${invalid
          .map((el) => el.labels?.[0]?.textContent)
          .join(", ")}`,
      );
      invalid[0]?.focus();
    } else {
      setSummary("Looks good — this demo doesn't actually submit anywhere.");
    }
  }

  return (
    <form ref={formRef} noValidate onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="demo-html5-email">Email</label>
        <input
          id="demo-html5-email"
          name="email"
          type="email"
          required
          aria-describedby="demo-html5-email-error"
        />
        <span className={styles.fieldError} id="demo-html5-email-error">
          Enter a valid email address.
        </span>
      </div>

      <div className={styles.field}>
        <label htmlFor="demo-html5-username">Username</label>
        <input
          id="demo-html5-username"
          name="username"
          type="text"
          required
          minLength={3}
          pattern="[a-zA-Z0-9_]+"
          aria-describedby="demo-html5-username-error"
        />
        <span className={styles.fieldError} id="demo-html5-username-error">
          3+ letters, numbers, or underscores.
        </span>
      </div>

      <div className={styles.field}>
        <label htmlFor="demo-html5-password">Password</label>
        <input
          id="demo-html5-password"
          name="password"
          type="password"
          required
          pattern=".{8,}"
          aria-describedby="demo-html5-password-error"
        />
        <span className={styles.fieldError} id="demo-html5-password-error">
          At least 8 characters.
        </span>
      </div>

      {summary && (
        <div className={styles.summary} role="alert">
          {summary}
        </div>
      )}

      <button type="submit" className={styles.submit}>
        Create account
      </button>
    </form>
  );
}
