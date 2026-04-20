import type { CSSProperties, ReactNode } from "react";
import styles from "./Card.module.scss";

export type CardProps = {
  title: ReactNode;
  children?: ReactNode;
  bodyAs?: "p" | "none";
  style?: CSSProperties;
  className?: string;
};

export default function Card({
  title,
  children,
  bodyAs = "p",
  style,
  className,
}: CardProps) {
  const classes = [styles.card, className].filter(Boolean).join(" ");
  return (
    <div className={classes} style={style}>
      <h4 className={styles.title}>{title}</h4>
      {children &&
        (bodyAs === "p" ? <p className={styles.body}>{children}</p> : children)}
    </div>
  );
}
