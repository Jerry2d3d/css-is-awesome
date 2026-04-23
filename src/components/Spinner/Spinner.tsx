import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import styles from "./Spinner.module.scss";

export type SpinnerProps = HTMLAttributes<HTMLSpanElement> & {
  size?: "sm" | "md" | "lg";
  label?: string; // accessible label; default "Loading"
};

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ size = "md", label = "Loading", className, ...rest }, ref) => {
    const classes = [
      styles.spinner,
      size !== "md" && styles[size],
      className,
    ]
      .filter(Boolean)
      .join(" ");
    return (
      <span
        ref={ref}
        role="status"
        aria-label={label}
        className={classes}
        {...rest}
      >
        <span className={styles.sr}>{label}</span>
      </span>
    );
  }
);

Spinner.displayName = "Spinner";

export default Spinner;
