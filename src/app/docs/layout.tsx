// ============================================================
// Docs layout — full replacement for src/app/docs/layout.tsx
// One change vs. the current file: renders <DocsDock /> after the
// shell. The dock is display:none above 1024px, so desktop is
// byte-for-byte identical in behavior.
// ============================================================
import type { ReactNode } from "react";
import "./docs-shell.scss";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import DocsNav from "./_components/DocsNav";
import DocsTOC from "./_components/DocsTOC";
import DocsPrevNext from "./_components/DocsPrevNext";
import DocsDock from "./_components/DocsDock";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader current="docs" />
      <div className="docs-shell">
        <DocsNav />
        <article className="docs-content">
          {children}
          <DocsPrevNext />
        </article>
        <DocsTOC />
      </div>
      <DocsDock />
      {/* Interim: this route still lives outside the (site) shell (dev-server file locks block the move) - the shell provides the footer once it moves in; remove this then. Below lg the DocsDock owns the bottom edge, so the footer hides there. */}
      <SiteFooter hideAtDockWidths />
    </>
  );
}
