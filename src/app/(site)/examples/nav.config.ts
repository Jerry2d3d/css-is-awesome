// ============================================================
// Examples section nav — plain, fs-free data (imported by the
// client ExamplesNav rail AND the server index page). Keep it a
// pure data module: pulling anything that reaches into node:fs
// here would panic Turbopack when the client rail imports it.
// ============================================================
export type ExampleNavItem = { slug: string; label: string; description: string };

export const examplesNav: ExampleNavItem[] = [
  {
    slug: "marketing-hero",
    label: "Marketing hero",
    description: "A centered landing hero — script kicker, display headline, two calls to action.",
  },
  {
    slug: "pricing",
    label: "Pricing",
    description: "A three-up card grid with a highlighted middle tier and a seal.",
  },
  {
    slug: "form",
    label: "Form",
    description: "A stacked contact form — labelled email + message with send/cancel.",
  },
  {
    slug: "dropdown",
    label: "Dropdown",
    description: "The house dropdown: a full-width trigger and an anchor-positioned menu, zero JS.",
  },
  {
    slug: "hamburger-drawer",
    label: "Hamburger + drawer",
    description: "Three bars that morph into an X off aria-expanded, opening an edge drawer.",
  },
  {
    slug: "footer",
    label: "Footer",
    description: "A simple site footer — logo and copyright on the left, links on the right.",
  },
  {
    slug: "print-to-pdf",
    label: "Print to PDF",
    description: "A real invoice you can Ctrl+P — screen chrome drops, links become followable URLs, and the sheet numbers itself. Zero JS, no PDF library.",
  },
  {
    slug: "letterhead",
    label: "Letterhead & footer",
    description: "A printable letter — a print-only letterhead header and a footer pinned to the foot of the sheet, both reading the print palette. Ctrl+P to see them appear.",
  },
];

export const exampleHref = (slug: string): string => `/examples/${slug}`;
