import type { CSSProperties } from "react";
import styles from "./Logo.module.scss";

export type LogoProps = {
  size?: string;
  caption?: string;
  stage?: boolean;
};

export default function Logo({ size, caption = "overflow intentional", stage = true }: LogoProps) {
  const logoStyle = size
    ? ({ ["--logo-size" as string]: size } as CSSProperties)
    : undefined;

  const inner = (
    <div className={styles.logo} aria-label="CSS is Awesome" style={logoStyle}>
      <span>CSS</span>
      <span>IS</span>
      <span className={styles.overflow}>AWESOME</span>
    </div>
  );

  if (!stage) return inner;

  return (
    <div className={styles.stage}>
      {inner}
      {caption && (
        <span className={styles.caption} aria-hidden="true">{caption}</span>
      )}
    </div>
  );
}
