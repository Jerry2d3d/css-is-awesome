import type { ReactNode } from "react";
import styles from "./DraftStamp.module.scss";

export default function DraftStamp({ children }: { children: ReactNode }) {
  return (
    <div className={styles.stamp} aria-hidden="true">
      {children}
    </div>
  );
}
