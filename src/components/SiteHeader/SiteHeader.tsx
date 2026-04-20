import styles from "./SiteHeader.module.scss";
import Link from "next/link";
import LogoMark from "@/components/LogoMark";

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
      <div className={styles.inner}>
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
      </div>
    </header>
  );
}
