import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Tag.module.scss";

export type TagProps = HTMLAttributes<HTMLSpanElement> & {
  icon?: ReactNode;
  onRemove?: () => void;
};

export const Tag = forwardRef<HTMLSpanElement, TagProps>(
  ({ icon, onRemove, className, children, ...rest }, ref) => {
    const classes = [
      styles.tag,
      onRemove && styles.removable,
      className,
    ].filter(Boolean).join(" ");
    return (
      <span ref={ref} className={classes} {...rest}>
        {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
        <span className={styles.label}>{children}</span>
        {onRemove && (
          <button
            type="button"
            className={styles.remove}
            onClick={onRemove}
            aria-label="Remove"
          >
            ×
          </button>
        )}
      </span>
    );
  }
);

Tag.displayName = "Tag";
export default Tag;
