import type { ReactNode } from "react";

export type StatChipProps = {
  value: ReactNode;
  label: ReactNode;
};

export default function StatChip({ value, label }: StatChipProps) {
  return (
    <span className="stat-chip">
      <strong>{value}</strong> {label}
    </span>
  );
}
