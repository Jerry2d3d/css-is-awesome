"use client";
import { forwardRef } from "react";
import type { ReactNode } from "react";
import styles from "./Toast.module.scss";

export type ToastStatus = "info" | "success" | "warning" | "error";

export type ToastAction = {
  label: string;
  onClick: () => void;
};

export type ToastProps = {
  id: string;
  status?: ToastStatus;
  title?: ReactNode;
  description?: ReactNode;
  action?: ToastAction;
  onDismiss?: (id: string) => void;
};

export const Toast = forwardRef<HTMLDivElement, ToastProps>(
  ({ id, status = "info", title, description, action, onDismiss }, ref) => {
    return (
      <div
        ref={ref}
        role={status === "error" ? "alert" : "status"}
        aria-live={status === "error" ? "assertive" : "polite"}
        className={[styles.toast, styles[status]].join(" ")}
      >
        <div className={styles.body}>
          {title && <p className={styles.title}>{title}</p>}
          {description && <div className={styles.description}>{description}</div>}
        </div>
        {action && (
          <button
            type="button"
            className={styles.action}
            onClick={() => {
              action.onClick();
              onDismiss?.(id);
            }}
          >
            {action.label}
          </button>
        )}
        <button
          type="button"
          className={styles.dismiss}
          onClick={() => onDismiss?.(id)}
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    );
  }
);
Toast.displayName = "Toast";

export default Toast;
