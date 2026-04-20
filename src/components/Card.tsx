import type { CSSProperties, ReactNode } from "react";

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
  const classes = className ? `card ${className}` : "card";
  return (
    <div className={classes} style={style}>
      <h4>{title}</h4>
      {children && (bodyAs === "p" ? <p>{children}</p> : children)}
    </div>
  );
}
