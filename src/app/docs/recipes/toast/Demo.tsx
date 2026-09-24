"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./demo.module.scss";

type Status = "info" | "success" | "warning" | "error";

type Toast = {
  id: number;
  status: Status;
  title: string;
  message: string;
  duration: number;
  action?: { label: string; onClick: () => void };
};

const MAX = 3;
const DURATION = 6000;
const ICONS: Record<Status, string> = { info: "i", success: "✓", warning: "!", error: "!" };

const PRESETS: Record<Status, { title: string; message: string }> = {
  info: { title: "Heads up", message: "A new version of the docs is available." },
  success: { title: "Saved", message: "Your theme changes are live." },
  warning: { title: "Almost out of space", message: "You've used 92% of your quota." },
  error: { title: "Upload failed", message: "The file exceeded 10 MB." },
};

export default function ToastDemo() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [status, setStatus] = useState("");
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  function push(kind: Status) {
    const preset = PRESETS[kind];
    const action =
      kind === "success"
        ? { label: "Undo", onClick: () => setStatus("Undo pressed — changes reverted.") }
        : undefined;
    setToasts((list) =>
      [...list, { id: nextId.current++, status: kind, duration: DURATION, action, ...preset }].slice(
        -MAX,
      ),
    );
  }

  return (
    <div>
      <div className={styles.triggers} role="group" aria-label="Fire a toast">
        <button type="button" className={styles.triggerInfo} onClick={() => push("info")}>
          Info
        </button>
        <button type="button" className={styles.triggerSuccess} onClick={() => push("success")}>
          Success
        </button>
        <button type="button" className={styles.triggerWarning} onClick={() => push("warning")}>
          Warning
        </button>
        <button type="button" className={styles.triggerError} onClick={() => push("error")}>
          Error
        </button>
      </div>

      {/* The region is scoped to this stage so it never covers the docs chrome —
          in a real app it would be position: fixed at the app root. Rendered
          even when empty, so live-region announcements are reliable. */}
      <div className={styles.stage}>
        <p className={styles.stageHint}>Toasts appear here (bottom-right of this box).</p>
        <section className={styles.region} aria-label="Notifications" data-testid="toast-region">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
          ))}
        </section>
      </div>

      <p className={styles.status} role="status" data-testid="toast-status">
        {status}
      </p>
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const remaining = useRef(toast.duration);
  const startedAt = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [paused, setPaused] = useState(false);

  const start = useCallback(() => {
    if (toast.duration === 0 || timer.current) return;
    startedAt.current = Date.now();
    timer.current = setTimeout(onDismiss, remaining.current);
    setPaused(false);
  }, [toast.duration, onDismiss]);

  const pause = useCallback(() => {
    if (!timer.current) return;
    clearTimeout(timer.current);
    timer.current = null;
    remaining.current -= Date.now() - startedAt.current;
    setPaused(true);
  }, []);

  useEffect(() => {
    start();
    return () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
    };
  }, [start]);

  const assertive = toast.status === "warning" || toast.status === "error";

  return (
    <div
      className={styles.toast}
      role={assertive ? "alert" : "status"}
      data-status={toast.status}
      data-paused={paused || undefined}
      data-testid="toast"
      style={{ "--toast-duration": `${toast.duration}ms` } as React.CSSProperties}
      onMouseEnter={pause}
      onMouseLeave={start}
      onFocus={pause}
      onBlur={start}
    >
      <span className={styles.icon} aria-hidden="true">
        {ICONS[toast.status]}
      </span>
      <div className={styles.body}>
        <strong className={styles.title}>{toast.title}</strong>
        <span className={styles.message}>{toast.message}</span>
      </div>
      {toast.action && (
        <button
          type="button"
          className={styles.action}
          onClick={() => {
            toast.action?.onClick();
            onDismiss();
          }}
        >
          {toast.action.label}
        </button>
      )}
      <button
        type="button"
        className={styles.close}
        aria-label="Dismiss notification"
        onClick={onDismiss}
      >
        ×
      </button>
      <span className={styles.progress} aria-hidden="true" />
    </div>
  );
}
