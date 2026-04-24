export type DocsNavItem = { label: string; href: string };
export type DocsNavSection = { title: string; items: DocsNavItem[] };

export const docsNav: DocsNavSection[] = [
  {
    title: "Getting started",
    items: [
      { label: "Introduction", href: "/docs" },
      { label: "Install", href: "/docs/install" },
    ],
  },
  {
    title: "Reference",
    items: [
      { label: "Tokens", href: "/docs/tokens" },
      { label: "Mixins", href: "/docs/mixins" },
      { label: "Utility classes", href: "/docs/utilities" },
    ],
  },
  {
    title: "Migration",
    items: [{ label: "From Bootstrap", href: "/docs/migration-bootstrap" }],
  },
];

export function flatNav(): DocsNavItem[] {
  return docsNav.flatMap((s) => s.items);
}

export function prevNext(pathname: string): { prev: DocsNavItem | null; next: DocsNavItem | null } {
  const flat = flatNav();
  const i = flat.findIndex((item) => item.href === pathname);
  if (i === -1) return { prev: null, next: null };
  return {
    prev: i > 0 ? flat[i - 1] : null,
    next: i < flat.length - 1 ? flat[i + 1] : null,
  };
}
