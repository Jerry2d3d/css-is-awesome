"use client";
import { useState } from "react";
import styles from "./demo.module.scss";

type Status = "idle" | "submitting" | "error" | "authenticated";

const DEMO_EMAIL = "demo@example.com";
const DEMO_PASSWORD = "password123";

function simulateLogin(email: string, password: string): Promise<{ ok: boolean; message?: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        resolve({ ok: true });
      } else {
        resolve({ ok: false, message: "Invalid email or password." });
      }
    }, 700);
  });
}

export default function AuthFlowDemo() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [registeredBanner, setRegisteredBanner] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    setRegisteredBanner(false);

    const data = new FormData(e.currentTarget);
    try {
      const result = await simulateLogin(String(data.get("email") ?? ""), String(data.get("password") ?? ""));
      if (!result.ok) {
        setError(result.message ?? "Invalid email or password.");
        setStatus("error");
        return;
      }
      setStatus("authenticated");
    } finally {
      setStatus((s) => (s === "submitting" ? "idle" : s));
    }
  }

  function reset() {
    setStatus("idle");
    setError("");
    setRegisteredBanner(false);
  }

  return (
    <div className={styles.wrap}>
      <button type="button" className={styles.simulateBtn} onClick={() => setRegisteredBanner(true)}>
        Simulate arriving from registration
      </button>

      {status === "authenticated" ? (
        <div className={styles.authedPanel}>
          <p role="status">
            Signed in as <strong>{DEMO_EMAIL}</strong>. (This demo doesn&apos;t really navigate — in a real app this
            redirects to the app.)
          </p>
          <button type="button" className={styles.resetBtn} onClick={reset}>
            Reset demo
          </button>
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {registeredBanner && (
            <div className={styles.banner} data-variant="success" role="status">
              Account created successfully! Please log in.
            </div>
          )}
          {status === "error" && (
            <div className={styles.banner} data-variant="error" role="alert">
              {error}
            </div>
          )}

          <p className={styles.hint}>
            Try <code>{DEMO_EMAIL}</code> / <code>{DEMO_PASSWORD}</code> — anything else errors.
          </p>

          <div className={styles.field}>
            <label htmlFor="auth-flow-demo-email">Email</label>
            <input
              id="auth-flow-demo-email"
              name="email"
              type="email"
              required
              disabled={status === "submitting"}
              autoComplete="email"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="auth-flow-demo-password">Password</label>
            <input
              id="auth-flow-demo-password"
              name="password"
              type="password"
              required
              disabled={status === "submitting"}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={status === "submitting"}>
            {status === "submitting" ? "Logging in…" : "Log in"}
          </button>
        </form>
      )}
    </div>
  );
}
