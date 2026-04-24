import type { ReactNode } from "react";
import SiteHeader from "@/components/SiteHeader";
import DocsNav from "./_components/DocsNav";
import DocsTOC from "./_components/DocsTOC";
import DocsPrevNext from "./_components/DocsPrevNext";

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
    </>
  );
}
