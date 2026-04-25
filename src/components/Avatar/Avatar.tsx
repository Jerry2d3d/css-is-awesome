"use client";
import { forwardRef, useState } from "react";
import type { HTMLAttributes } from "react";
import Image from "next/image";
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

// Pixel dimensions mirror the size classes in Avatar.module.scss
// (.sm 1.75rem, .md 2.5rem, .lg 3.25rem, .xl 4.5rem at the default 16px root).
// next/image requires explicit width/height; the wrapper span still controls
// the rendered size via CSS, so these act as intrinsic ratio + LCP hints.
const SIZE_PX: Record<NonNullable<AvatarProps["size"]>, number> = {
  sm: 28,
  md: 40,
  lg: 52,
  xl: 72,
};

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  ({ src, alt, name, size = "md", className, ...rest }, ref) => {
    const [broken, setBroken] = useState(false);
    const classes = [styles.avatar, styles[size], className].filter(Boolean).join(" ");

    if (src && !broken) {
      const px = SIZE_PX[size];
      return (
        <span ref={ref} className={classes} {...rest}>
          <Image
            className={styles.img}
            src={src}
            alt={alt ?? name ?? ""}
            width={px}
            height={px}
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
