import { forwardRef, useState } from "react";
import type { HTMLAttributes } from "react";
import styles from "./Avatar.module.scss";

export type AvatarProps = HTMLAttributes<HTMLSpanElement> & {
  src?: string;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
};

function initials(name?: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  ({ src, alt, name, size = "md", className, ...rest }, ref) => {
    const [broken, setBroken] = useState(false);
    const classes = [styles.avatar, styles[size], className].filter(Boolean).join(" ");

    if (src && !broken) {
      return (
        <span ref={ref} className={classes} {...rest}>
          <img
            className={styles.img}
            src={src}
            alt={alt ?? name ?? ""}
            onError={() => setBroken(true)}
          />
        </span>
      );
    }

    return (
      <span
        ref={ref}
        className={[classes, styles.placeholder].join(" ")}
        aria-label={alt ?? name}
        {...rest}
      >
        {initials(name) || "?"}
      </span>
    );
  }
);

Avatar.displayName = "Avatar";

export default Avatar;
