import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import styles from "./Progress.module.scss";

export type ProgressProps = HTMLAttributes<HTMLDivElement> & {
  value?: number;        // 0–100. If undefined → indeterminate
  max?: number;          // default 100
  label?: string;        // visible label, optional
  size?: "sm" | "md" | "lg";
};

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ value, max = 100, label, size = "md", className, ...rest }, ref) => {
    const indeterminate = value === undefined;
    const pct = indeterminate ? 0 : Math.max(0, Math.min(100, (value / max) * 100));
    const classes = [
      styles.wrap,
      size !== "md" && styles[size],
      indeterminate && styles.indeterminate,
      className,
    ].filter(Boolean).join(" ");
    return (
      <div
        ref={ref}
        className={classes}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={indeterminate ? undefined : value}
        aria-label={label}
        {...rest}
      >
        <div className={styles.track}>
          <div
            className={styles.fill}
            style={indeterminate ? undefined : { width: `${pct}%` }}
          />
        </div>
        {label && <div className={styles.label}>{label}</div>}
      </div>
    );
  }
);

Progress.displayName = "Progress";
export default Progress;
