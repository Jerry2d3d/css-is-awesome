import { forwardRef, Children } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Avatar.module.scss";

export type AvatarGroupProps = HTMLAttributes<HTMLSpanElement> & {
  max?: number;
  children: ReactNode;
};

export const AvatarGroup = forwardRef<HTMLSpanElement, AvatarGroupProps>(
  ({ max, className, children, ...rest }, ref) => {
    const arr = Children.toArray(children);
    const visible = typeof max === "number" ? arr.slice(0, max) : arr;
    const overflow = typeof max === "number" ? Math.max(0, arr.length - max) : 0;
    const classes = [styles.group, className].filter(Boolean).join(" ");

    return (
      <span ref={ref} className={classes} {...rest}>
        {visible}
        {overflow > 0 && (
          <span
            className={[styles.avatar, styles.md, styles.placeholder, styles.overflow].join(" ")}
          >
            +{overflow}
          </span>
        )}
      </span>
    );
  }
);

AvatarGroup.displayName = "AvatarGroup";

export default AvatarGroup;
