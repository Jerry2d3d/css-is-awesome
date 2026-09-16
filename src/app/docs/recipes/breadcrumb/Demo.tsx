"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./demo.module.scss";

type Crumb = { label: string; href: string };

const SHORT_TRAIL: Crumb[] = [
  { label: "Home", href: "#home" },
  { label: "Docs", href: "#docs" },
  { label: "Recipes", href: "#recipes" },
  { label: "Breadcrumb", href: "#breadcrumb" },
];

const DEEP_TRAIL: Crumb[] = [
  { label: "Home", href: "#home" },
  { label: "Admin", href: "#admin" },
  { label: "Organisations", href: "#orgs" },
  { label: "Acme Corp", href: "#acme" },
  { label: "Projects", href: "#projects" },
  { label: "Website redesign", href: "#redesign" },
  { label: "Settings", href: "#settings" },
];

// Demo links go nowhere — swallow the navigation so the page doesn't jump.
function stop(e: React.MouseEvent<HTMLAnchorElement>) {
  e.preventDefault();
}

function Trail({ crumbs, label }: { crumbs: Crumb[]; label: string }) {
  const last = crumbs.length - 1;
  return (
    <nav aria-label={label}>
      <ol className={styles.breadcrumb}>
        {crumbs.map((crumb, i) => (
          <li key={crumb.href}>
            {i === last ? (
              <span aria-current="page">{crumb.label}</span>
            ) : (
              <a href={crumb.href} onClick={stop}>
                {crumb.label}
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function CollapsedTrail({ crumbs, label }: { crumbs: Crumb[]; label: string }) {
  const [expanded, setExpanded] = useState(false);
  const firstRevealed = useRef<HTMLAnchorElement>(null);
  const last = crumbs.length - 1;

  // The ellipsis button disappears once pressed; move focus onto the first
  // revealed link so a keyboard user isn't dropped at <body>.
  useEffect(() => {
    if (expanded) firstRevealed.current?.focus();
  }, [expanded]);

  // Keep the first crumb and the last two; fold the rest behind "…".
  const head = crumbs.slice(0, 1);
  const hidden = crumbs.slice(1, last - 1);
  const tail = crumbs.slice(last - 1);

  const renderCrumb = (crumb: Crumb, isLast: boolean) => (
    <li key={crumb.href}>
      {isLast ? (
        <span aria-current="page">{crumb.label}</span>
      ) : (
        <a href={crumb.href} onClick={stop}>
          {crumb.label}
        </a>
      )}
    </li>
  );

  return (
    <nav aria-label={label}>
      <ol className={styles.breadcrumb}>
        {head.map((c) => renderCrumb(c, false))}
        {expanded ? (
          hidden.map((c, i) => (
            <li key={c.href}>
              <a href={c.href} onClick={stop} ref={i === 0 ? firstRevealed : undefined}>
                {c.label}
              </a>
            </li>
          ))
        ) : (
          <li>
            <button
              type="button"
              className={styles.expand}
              aria-expanded={false}
              aria-label="Show all pages"
              onClick={() => setExpanded(true)}
            >
              …
            </button>
          </li>
        )}
        {tail.map((c, i) => renderCrumb(c, i === tail.length - 1))}
      </ol>
    </nav>
  );
}

export default function BreadcrumbDemo() {
  return (
    <div className={styles.demo}>
      <p className={styles.caption}>Plain trail — four levels, current page is not a link:</p>
      <Trail crumbs={SHORT_TRAIL} label="Breadcrumb" />

      <p className={styles.caption}>
        Deep trail — seven levels collapsed to first + … + last two. Press the
        ellipsis to reveal the middle:
      </p>
      <CollapsedTrail crumbs={DEEP_TRAIL} label="Breadcrumb (collapsed example)" />
    </div>
  );
}
