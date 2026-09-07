// ============================================================
// Examples layout — the two-column examples shell (rail | content).
// Nested inside the (site) route group, which already provides the
// Nav / Main / Footer chrome; this sub-layout only adds the left rail
// and the prose content column. Mirrors the docs shell.
// ============================================================
import type { ReactNode } from "react";
import "./examples-shell.scss";
import ExamplesNav from "./_components/ExamplesNav";

export default function ExamplesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="examples-shell">
      <ExamplesNav />
      <article className="docs-content">{children}</article>
    </div>
  );
}
