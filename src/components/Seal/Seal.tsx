import type { ReactNode } from "react";

export default function Seal({ children }: { children: ReactNode }) {
  return <span className="seal">{children}</span>;
}
