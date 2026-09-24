"use client";
import { useRef, useState } from "react";
import styles from "./demo.module.scss";

const TAKEN = new Set(["admin", "root", "test", "cia"]);

// Simulated endpoint — a real project replaces this body with
// fetch(url, { signal }); AbortController cancellation works identically
// either way (see the recipe's Pitfalls section on why a static export
// can't have a real Route Handler here).
function checkUsername(username: string, signal: AbortSignal): Promise<{ available: boolean }> {
  return new Promise((resolve, reject) => {
    const delay = setTimeout(() => resolve({ available: !TAKEN.has(username.toLowerCase()) }), 600);
    signal.addEventListener("abort", () => {
      clearTimeout(delay);
      reject(new DOMException("aborted", "AbortError"));
    });
  });
}

type Status = "idle" | "checking" | "available" | "taken";

export default function AsyncDemo() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const controllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.trim();
    clearTimeout(timerRef.current);
    controllerRef.current?.abort();

    if (value.length < 3) {
      setStatus("idle");
      setMessage("");
      return;
    }

    setStatus("checking");
    setMessage("Checking availability…");

    timerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      controllerRef.current = controller;
      try {
        const { available } = await checkUsername(value, controller.signal);
        setStatus(available ? "available" : "taken");
        setMessage(available ? `"${value}" is available.` : `"${value}" is already taken.`);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setStatus("idle");
          setMessage("Couldn't check right now — try again.");
        }
      }
    }, 500);
  }

  return (
    <div className={styles.field} data-status={status}>
      <label htmlFor="demo-async-username">Username</label>
      <div className={styles.inputWrap}>
        <input
          id="demo-async-username"
          autoComplete="off"
          onChange={handleChange}
          aria-busy={status === "checking"}
          aria-describedby="demo-async-status"
        />
        <span className={styles.spinner} aria-hidden="true" />
      </div>
      <span className={styles.status} id="demo-async-status" role="status">
        {message}
      </span>
      <p style={{ fontSize: "0.8em", opacity: 0.7 }}>
        Try &ldquo;admin&rdquo; (taken) vs. anything else (available). Type
        quickly through a few names to see the in-flight cancellation —
        only the last one you stop on ever resolves.
      </p>
    </div>
  );
}
