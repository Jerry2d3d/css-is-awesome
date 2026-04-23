import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Alert.module.scss";

export type AlertStatus = "info" | "success" | "warning" | "error";

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  status?: AlertStatus;
  title?: ReactNode;
  icon?: ReactNode;
  onDismiss?: () => void;
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ status = "info", title, icon, onDismiss, className, children, ...rest }, ref) => {
    const classes = [styles.alert, styles[status], className].filter(Boolean).join(" ");
    return (
      <div
        ref={ref}
        role={status === "error" ? "alert" : "status"}
        aria-live={status === "error" ? "assertive" : "polite"}
        className={classes}
        {...rest}
      >
        {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
        <div className={styles.body}>
          {title && <p className={styles.title}>{title}</p>}
          {children && <div className={styles.message}>{children}</div>}
        </div>
        {onDismiss && (
          <button
            type="button"
            className={styles.dismiss}
            onClick={onDismiss}
            aria-label="Dismiss"
          >
            ×
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = "Alert";

export default Alert;
