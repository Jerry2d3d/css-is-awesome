"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import styles from "./DocsNav.module.scss";
import { docsNav } from "../nav.config";

/**
 * Sidebar nav for the docs section.
 *
 * Why the `mounted` gate: with `output: "export"` + a shared layout, Next 15
 * pre-renders this client component once at build time and `usePathname()`
 * returns a route-segment value that doesn't match the per-page active item.
 * The static HTML therefore has *no* active link, but on the client
 * `usePathname()` resolves to the real path and we'd add an `isActive` class
 * + `aria-current="page"` to one anchor — that single-attribute delta is
 * exactly what produces React #418 ("Hydration failed... HTML didn't match")
 * on every /docs/* route.
 *
 * The fix is to render the SSR-equivalent (no active link) on the first
 * client render, then resolve the active item in an effect. The visible
 * delay is a single frame; no FOUC, no layout shift.
 */
export default function DocsNav({ label = "Docs navigation" }: { label?: string }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <aside className={styles.sidebar} aria-label={label}>
      {docsNav.map((section) => (
        <div key={section.title}>
          <h4>{section.title}</h4>
          <ul>
            {section.items.map((item) => {
              const active = mounted && pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={active ? styles.isActive : undefined}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </aside>
  );
}
