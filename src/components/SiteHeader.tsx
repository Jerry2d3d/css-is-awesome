import "./SiteHeader.scss";
import Link from "next/link";
import LogoMark from "./LogoMark";

type NavId = "home" | "docs" | "examples" | "blog" | "about";

const NAV: { id: NavId; label: string; href: string }[] = [
  { id: "home",     label: "Home",     href: "/" },
  { id: "docs",     label: "Docs",     href: "/docs" },
  { id: "examples", label: "Examples", href: "/examples" },
  { id: "blog",     label: "Blog",     href: "/blog" },
  { id: "about",    label: "About",    href: "/about" },
];

export default function SiteHeader({ current }: { current: NavId }) {
  return (
    <header className="docs-header">
      <div className="docs-header__inner">
        <Link className="docs-header__brand" href="/">
          <LogoMark />
          CSS is Awesome
        </Link>
        <nav className="docs-header__nav">
          {NAV.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={item.id === current ? "is-active" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
