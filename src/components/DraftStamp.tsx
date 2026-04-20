import type { ReactNode } from "react";

export default function DraftStamp({ children }: { children: ReactNode }) {
  return (
    <div className="draft-stamp" aria-hidden="true">
      {children}
    </div>
  );
}
