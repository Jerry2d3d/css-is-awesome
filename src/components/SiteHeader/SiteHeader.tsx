// ============================================================
// SiteHeader — full replacement for src/components/SiteHeader/SiteHeader.tsx
//
// Desktop (≥1025px): unchanged — inline nav row + theme controls.
// Mobile (≤1024px): the 8-link nav row hides; a hamburger appears
// and drops the site menu down from under the header as a
// two-column paper panel. Checkbox-driven, so this component stays
// a SERVER component — no "use client", no hydration cost.
// ============================================================
import styles from "./SiteHeader.module.scss";
import Link from "next/link";
import LogoMark from "@/components/LogoMark";
import LightDarkToggle from "@/components/LightDarkToggle";
import ThemeSelect from "@/components/ThemeSelect";

type NavId = "home" | "docs" | "themes" | "examples" | "compare" | "showcase" | "blog" | "about";

const NAV: { id: NavId; label: string; href: string }[] = [
  { id: "home",     label: "Home",     href: "/" },
  { id: "docs",     label: "Docs",     href: "/docs" },
  { id: "themes",   label: "Themes",   href: "/themes" },
  { id: "examples", label: "Examples", href: "/examples" },
  { id: "compare",  label: "Compare",  href: "/compare" },
  { id: "showcase", label: "Showcase", href: "/showcase" },
  { id: "blog",     label: "Blog",     href: "/blog" },
  { id: "about",    label: "About",    href: "/about" },
];

export default function SiteHeader({ current }: { current: NavId }) {
  return (
    <header className={styles.header}>
      {/* hamburger state — checkbox keeps this a server component */}
      <input type="checkbox" id="site-menu" className={styles.menuCheck} />

      <div className={styles.inner}>
        <label className={styles.burger} htmlFor="site-menu" aria-label="Site menu">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="13" y2="17" />
          </svg>
        </label>

        <Link className={styles.brand} href="/">
          <LogoMark />
          CSS is Awesome
        </Link>

        <nav className={styles.nav}>
          {NAV.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={item.id === current ? styles.isActive : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.themeControls}>
          <ThemeSelect />
          <LightDarkToggle />
        </div>
      </div>

      {/* mobile drop-down site menu */}
      <label className={styles.menuScrim} htmlFor="site-menu" aria-hidden="true" />
      <nav className={styles.menuPanel} aria-label="Site menu">
        <ul>
          {NAV.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={item.id === current ? styles.isHere : undefined}
                aria-current={item.id === current ? "page" : undefined}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
