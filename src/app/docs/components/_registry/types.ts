import type { ReactNode } from "react";

/**
 * One component's documentation as DATA. The template (ComponentDoc) is
 * written once; adding a component to the docs is adding an entry, not
 * markup. (Pattern from the Boiler docs-page handoff, 2026-09-04.)
 */
export type DocTab = {
  label: string;
  content: ReactNode;
};

export type DocEntry = {
  slug: string;
  /** Display name — the article's <h1>. */
  name: string;
  /** Category chip above the title, e.g. "Interactive component". */
  category: string;
  /** One-line description under the title. */
  oneLiner: ReactNode;
  /** Badge strings rendered in the header, e.g. "0 KB JS". */
  badges: string[];
  /** Live demo, rendered on the checkerboard stage. */
  demo: ReactNode;
  /** Import line + minimal example(s). */
  usage: ReactNode;
  /** Inputs / Tokens / Accessibility / Source / comparisons — per entry. */
  tabs: DocTab[];
  /** Footer links (source pointer, related recipe, back link…). */
  footerLinks: { label: string; href: string }[];
};
