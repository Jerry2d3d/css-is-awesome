import type { ReactNode } from "react";

export type PrincipleProps = {
  num: number | string;
  title: ReactNode;
  children: ReactNode;
};

export default function Principle({ num, title, children }: PrincipleProps) {
  return (
    <div className="principle">
      <div className="principle__num">{num}</div>
      <h4>{title}</h4>
      <p>{children}</p>
    </div>
  );
}
