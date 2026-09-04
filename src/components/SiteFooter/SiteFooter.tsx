"use client";
// SiteFooter — the footer region of the site shell ((site)/layout.tsx).
// Mirrors the header nav so every page ends with wayfinding, plus the
// project's external homes. Client component only for the pathname-based
// aria-current (same mounted gate as SiteHeader / DocsDock).
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./SiteFooter.module.scss";

const NAV = [
  { id: "home",     label: "Home",     href: "/" },
  { id: "docs",     label: "Docs",     href: "/docs" },
  { id: "themes",   label: "Themes",   href: "/themes" },
  { id: "examples", label: "Examples", href: "/examples" },
  { id: "compare",  label: "Compare",  href: "/compare" },
  { id: "showcase", label: "Showcase", href: "/showcase" },
  { id: "blog",     label: "Blog",     href: "/blog" },
  { id: "about",    label: "About",    href: "/about" },
];

function sectionOf(path: string): string {
  if (path === "/") return "home";
  return path.split("/").filter(Boolean)[0] ?? "";
}

export default function SiteFooter({
  hideAtDockWidths = false,
}: {
  // Docs routes ship the DocsDock below 1024px — the dock owns the bottom
  // edge there, so the footer bows out at those widths.
  hideAtDockWidths?: boolean;
} = {}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const current = mounted ? sectionOf(pathname) : "";

  return (
    <footer className={hideAtDockWidths ? `${styles.footer} ${styles.yieldToDock}` : styles.footer}>
      <div className={styles.inner}>
        <nav className={styles.nav} aria-label="Footer">
          {NAV.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              aria-current={item.id === current ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className={styles.meta}>
          <a href="https://github.com/Jerry2d3d/css-is-awesome">GitHub</a>
          <span aria-hidden="true">·</span>
          <a href="https://www.npmjs.com/package/css-is-awesome">npm</a>
          <span aria-hidden="true">·</span>
          <span>MIT</span>
        </div>
        <p className={styles.signoff}>
          built with <code>css-is-awesome</code> — drawn by hand
        </p>
      </div>
    </footer>
  );
}
