import type { ReactNode } from "react";
import styles from "./Seal.module.scss";

export default function Seal({ children }: { children: ReactNode }) {
  return <span className={styles.seal}>{children}</span>;
}
