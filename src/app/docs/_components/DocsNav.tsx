"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import styles from "./DocsNav.module.scss";
import { docsNav } from "../nav.config";

export default function DocsNav({ label = "Docs navigation" }: { label?: string }) {
  const pathname = usePathname();
  return (
    <aside className={styles.sidebar} aria-label={label}>
      {docsNav.map((section) => (
        <div key={section.title}>
          <h4>{section.title}</h4>
          <ul>
            {section.items.map((item) => {
              const active = pathname === item.href;
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
