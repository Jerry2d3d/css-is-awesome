import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import styles from "./Badge.module.scss";

export type BadgeStatus = "default" | "info" | "success" | "warning" | "error";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  status?: BadgeStatus;
  dot?: boolean;
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ status = "default", dot, className, children, ...rest }, ref) => {
    const classes = [
      styles.badge,
      status !== "default" && styles[status],
      dot && styles.dot,
      className,
    ]
      .filter(Boolean)
      .join(" ");
    return (
      <span ref={ref} className={classes} {...rest}>
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
export default Badge;
