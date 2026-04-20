import type { ReactNode } from "react";
import styles from "./StatChip.module.scss";

export type StatChipProps = {
  value: ReactNode;
  label: ReactNode;
};

export default function StatChip({ value, label }: StatChipProps) {
  return (
    <span className={styles.chip}>
      <strong>{value}</strong> {label}
    </span>
  );
}
