export type DocsNavItem = { label: string; href: string };
export type DocsNavSection = { title: string; items: DocsNavItem[] };

export const docsNav: DocsNavSection[] = [
  {
    title: "Getting started",
    items: [
      { label: "Introduction", href: "/docs" },
      { label: "Three tiers", href: "/docs/three-tiers" },
      { label: "Install", href: "/docs/install" },
    ],
  },
  {
    title: "Reference",
    items: [
      { label: "Tokens", href: "/docs/tokens" },
      { label: "Mixins", href: "/docs/mixins" },
      { label: "Utility classes", href: "/docs/utilities" },
      { label: "Animation", href: "/docs/animation" },
      { label: "Accessibility", href: "/docs/a11y" },
      { label: "Testing", href: "/docs/testing" },
      { label: "Browser support", href: "/docs/browser-support" },
      { label: "MCP server", href: "/docs/mcp" },
    ],
  },
  {
    title: "Patterns",
    items: [
      { label: "Composition", href: "/docs/composition" },
      { label: "Mobile", href: "/docs/mobile" },
      { label: "Recipes", href: "/docs/recipes" },
    ],
  },
  {
    title: "Authoring",
    items: [
      { label: "Themes", href: "/docs/authoring/themes" },
      { label: "Icons", href: "/docs/authoring/icons" },
    ],
  },
  {
    title: "Migration",
    items: [
      { label: "From Bootstrap", href: "/docs/migration-bootstrap" },
      { label: "From Tailwind", href: "/docs/migration-tailwind" },
    ],
  },
  {
    title: "Help",
    items: [
      { label: "FAQ", href: "/docs/faq" },
      { label: "Roadmap", href: "/docs/roadmap" },
    ],
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
