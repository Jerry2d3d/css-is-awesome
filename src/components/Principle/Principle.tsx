import type { ReactNode } from "react";
import styles from "./Principle.module.scss";

export type PrincipleProps = {
  num: number | string;
  title: ReactNode;
  children: ReactNode;
};

export default function Principle({ num, title, children }: PrincipleProps) {
  return (
    <div className={styles.principle}>
      <div className={styles.num}>{num}</div>
      <h4>{title}</h4>
      <p>{children}</p>
    </div>
  );
}
