import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Divider.module.scss";

export type DividerProps = HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
  children?: ReactNode; // optional label for horizontal dividers
};

export const Divider = forwardRef<HTMLDivElement, DividerProps>(
  ({ orientation = "horizontal", className, children, ...rest }, ref) => {
    const classes = [
      styles.divider,
      orientation === "vertical" && styles.vertical,
      children && styles.withLabel,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    if (children && orientation === "horizontal") {
      return (
        <div
          ref={ref}
          role="separator"
          aria-orientation="horizontal"
          className={classes}
          {...rest}
        >
          <span className={styles.line} aria-hidden="true" />
          <span className={styles.label}>{children}</span>
          <span className={styles.line} aria-hidden="true" />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation={orientation}
        className={classes}
        {...rest}
      />
    );
  }
);

Divider.displayName = "Divider";
export default Divider;
