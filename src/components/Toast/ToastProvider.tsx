"use client";
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import Toast from "./Toast";
import type { ToastStatus, ToastAction } from "./Toast";
import styles from "./Toast.module.scss";

export type ToastInput = {
  id?: string;
  status?: ToastStatus;
  title?: ReactNode;
  description?: ReactNode;
  action?: ToastAction;
  duration?: number;   // ms, default 5000; 0 = don't auto-dismiss
};

export type ToastContextValue = {
  toast: (input: ToastInput) => string;
  dismiss: (id: string) => void;
  clear: () => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

type Placement =
  | "top-right"
  | "top-left"
  | "top-center"
  | "bottom-right"
  | "bottom-left"
  | "bottom-center";

export type ToastProviderProps = {
  children: ReactNode;
  placement?: Placement;
  max?: number;
  defaultDuration?: number;
};

type ToastRecord = {
  id: string;
  status: ToastStatus;
  title?: ReactNode;
  description?: ReactNode;
  action?: ToastAction;
  duration: number;
};

export function ToastProvider({
  children,
  placement = "bottom-right",
  max = 3,
  defaultDuration = 5000,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const timers = useRef<Map<string, number>>(new Map());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const clearTimer = useCallback((id: string) => {
    const t = timers.current.get(id);
    if (t != null) {
      window.clearTimeout(t);
      timers.current.delete(id);
    }
  }, []);

  const dismiss = useCallback(
    (id: string) => {
      clearTimer(id);
      setToasts((list) => list.filter((t) => t.id !== id));
    },
    [clearTimer]
  );

  const clear = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current.clear();
    setToasts([]);
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id =
        input.id ?? `cia-toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const duration = input.duration ?? defaultDuration;
      setToasts((list) => {
        const next: ToastRecord = {
          id,
          status: input.status ?? "info",
          title: input.title,
          description: input.description,
          action: input.action,
          duration,
        };
        const combined = [...list, next];
        if (combined.length > max) {
          const [removed, ...rest] = combined;
          clearTimer(removed.id);
          return rest;
        }
        return combined;
      });

      if (duration > 0) {
        const timer = window.setTimeout(() => dismiss(id), duration);
        timers.current.set(id, timer);
      }

      return id;
    },
    [defaultDuration, max, clearTimer, dismiss]
  );

  const ctx = useMemo(() => ({ toast, dismiss, clear }), [toast, dismiss, clear]);

  // Pause auto-dismiss on hover over the whole stack
  const handleEnter = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current.clear();
  };
  const handleLeave = () => {
    toasts.forEach((t) => {
      if (t.duration > 0 && !timers.current.has(t.id)) {
        const timer = window.setTimeout(() => dismiss(t.id), t.duration);
        timers.current.set(t.id, timer);
      }
    });
  };

  useEffect(() => {
    const timersMap = timers.current;
    return () => {
      timersMap.forEach((t) => window.clearTimeout(t));
      timersMap.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className={[styles.stack, styles[`placement-${placement}`]].join(" ")}
            role="region"
            aria-label="Notifications"
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
          >
            {toasts.map((t) => (
              <Toast
                key={t.id}
                id={t.id}
                status={t.status}
                title={t.title}
                description={t.description}
                action={t.action}
                onDismiss={dismiss}
              />
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

export default ToastProvider;
