import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import styles from "./Skeleton.module.scss";

export type SkeletonProps = HTMLAttributes<HTMLSpanElement> & {
  shape?: "rect" | "circle" | "text";
  width?: string | number;
  height?: string | number;
  lines?: number;
};

function toCss(v: string | number | undefined): string | undefined {
  if (v == null) return undefined;
  return typeof v === "number" ? `${v}px` : v;
}

export const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>(
  ({ shape = "rect", width, height, lines = 1, className, style, ...rest }, ref) => {
    const classes = [styles.skeleton, styles[shape], className].filter(Boolean).join(" ");

    const inlineStyle: React.CSSProperties = {
      ...(width != null ? { width: toCss(width) } : {}),
      ...(height != null ? { height: toCss(height) } : {}),
      ...style,
    };

    if (shape === "text" && lines > 1) {
      return (
        <span ref={ref} className={styles.textStack} aria-hidden="true" {...rest}>
          {Array.from({ length: lines }).map((_, i) => (
            <span
              key={i}
              className={classes}
              style={{
                ...inlineStyle,
                width: i === lines - 1 ? "60%" : inlineStyle.width ?? "100%",
              }}
            />
          ))}
        </span>
      );
    }

    return (
      <span
        ref={ref}
        className={classes}
        aria-hidden="true"
        style={inlineStyle}
        {...rest}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

export default Skeleton;
