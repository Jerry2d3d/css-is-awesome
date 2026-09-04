// ============================================================
// Docs layout — full replacement for src/app/docs/layout.tsx
// One change vs. the current file: renders <DocsDock /> after the
// shell. The dock is display:none above 1024px, so desktop is
// byte-for-byte identical in behavior.
// ============================================================
import type { ReactNode } from "react";
import SiteHeader from "@/components/SiteHeader";
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
    </>
  );
}
