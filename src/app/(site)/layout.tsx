// ============================================================
// (site) route group layout — the page control system.
// Every route in this group gets the same shell: Nav / Main / Footer,
// one grid with named areas (see site-shell.scss). The landing page
// lives OUTSIDE this group on purpose — it keeps its clean wordmark
// identity with no standard chrome.
// Pages no longer render SiteHeader themselves; the shell owns it.
// ============================================================
import type { ReactNode } from "react";
import "./site-shell.scss";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="site">
      <SiteHeader />
      <main className="site-main">{children}</main>
      <SiteFooter />
    </div>
  );
}
