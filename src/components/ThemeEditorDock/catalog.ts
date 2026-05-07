// Token catalog for the theme editor.
// Drives the dock's grouped rows. Mirrors the cia theme contract
// (scripts/theme-contract.json) — every required token has an entry.
//
// `mode = "both"` → token differs between light and dark blocks.
//   The active dock tab controls which mode is being edited.
// `mode = "shared"` → token is the same in light and dark.
//   Edits write to BOTH mode blocks so preview stays consistent
//   when the user flips modes.

export type RowType = "color" | "length" | "duration" | "number" | "string";

export type TokenSpec = {
  token: string;
  label: string;
  group: string;
  mode: "both" | "shared";
  type: RowType;
  unit?: string;       // "px", "ms", "" — for length/duration/number rows
  min?: number;
  max?: number;
  step?: number;
};

const G = {
  paper: "Paper & background",
  ink: "Ink & text",
  surface: "Surfaces",
  border: "Borders & lines",
  action: "Action (button) palette",
  brand: "Brand & accent",
  status: "Status (info / success / warning / error)",
  feedback: "Feedback shorthand",
  ai: "AI accent (--ai)",
  code: "Code & syntax",
  interactive: "Interactive states",
  guide: "Guides (margin / column rules)",
  misc: "Miscellaneous palette",
  radius: "Radii",
  rLegacy: "Radii (legacy r-*)",
  space: "Spacing",
  blur: "Blur",
  duration: "Motion — durations",
  ease: "Motion — easing",
  shadow: "Shadows",
  glow: "Glows",
  font: "Fonts (family)",
  fontMisc: "Type — size / weight / line-height",
  z: "Z-index",
} as const;

// Helper to keep the array readable.
function color(token: string, label: string, group: string, mode: "both" | "shared" = "both"): TokenSpec {
  return { token, label, group, mode, type: "color" };
}
function length(token: string, label: string, group: string, max = 64, min = 0, step = 1): TokenSpec {
  return { token, label, group, mode: "shared", type: "length", unit: "px", min, max, step };
}
function duration(token: string, label: string): TokenSpec {
  return { token, label, group: G.duration, mode: "shared", type: "duration", unit: "ms", min: 0, max: 1000, step: 10 };
}
function number(token: string, label: string, group: string, min = 0, max = 9999, step = 1): TokenSpec {
  return { token, label, group, mode: "shared", type: "number", min, max, step };
}
function str(token: string, label: string, group: string, mode: "both" | "shared" = "shared"): TokenSpec {
  return { token, label, group, mode, type: "string" };
}

export const CATALOG: TokenSpec[] = [
  // ===== Paper & background =====
  color("--paper",         "Paper",         G.paper),
  color("--paper-raised",  "Paper raised",  G.paper),
  color("--paper-sunk",    "Paper sunk",    G.paper),
  color("--paper-glass",   "Paper glass",   G.paper),
  color("--background-default", "Background",         G.paper),
  color("--background-subtle",  "Background subtle",  G.paper),
  color("--background-navbar",  "Background navbar",  G.paper),

  // ===== Ink & text =====
  color("--ink",        "Ink",        G.ink),
  color("--ink-soft",   "Ink soft",   G.ink),
  color("--ink-faint",  "Ink faint",  G.ink),
  color("--text-primary",    "Text primary",    G.ink),
  color("--text-secondary",  "Text secondary",  G.ink),
  color("--text-tertiary",   "Text tertiary",   G.ink),
  color("--text-muted",      "Text muted",      G.ink),
  color("--text-inverse",    "Text inverse",    G.ink),
  color("--text-link",       "Text link",       G.ink),
  color("--text-link-hover", "Text link hover", G.ink),
  color("--muted",           "Muted",           G.ink),

  // ===== Surfaces =====
  color("--surface-default",  "Surface",          G.surface),
  color("--surface-subtle",   "Surface subtle",   G.surface),
  color("--surface-muted",    "Surface muted",    G.surface),
  color("--surface-raised",   "Surface raised",   G.surface),
  color("--surface-sunk",     "Surface sunk",     G.surface),
  color("--surface-emphasis", "Surface emphasis", G.surface),
  color("--surface-glass",    "Surface glass",    G.surface),

  // ===== Borders & lines =====
  color("--border-default",  "Border",           G.border),
  color("--border-subtle",   "Border subtle",    G.border),
  color("--border-emphasis", "Border emphasis",  G.border),
  color("--border-focus",    "Border focus",     G.border),
  color("--hair",            "Hair",             G.border),
  color("--hair-soft",       "Hair soft",        G.border),

  // ===== Action palette =====
  color("--action-primary-default",   "Primary default",   G.action),
  color("--action-primary-hover",     "Primary hover",     G.action),
  color("--action-primary-active",    "Primary active",    G.action),
  color("--action-primary-wash",      "Primary wash",      G.action),
  color("--action-secondary-default", "Secondary default", G.action),
  color("--action-secondary-hover",   "Secondary hover",   G.action),
  color("--action-secondary-active",  "Secondary active",  G.action),
  color("--action-secondary-wash",    "Secondary wash",    G.action),
  color("--action-tertiary-default",  "Tertiary default",  G.action),
  color("--action-tertiary-hover",    "Tertiary hover",    G.action),
  color("--action-tertiary-active",   "Tertiary active",   G.action),
  color("--action-tertiary-wash",     "Tertiary wash",     G.action),

  // ===== Brand & accent =====
  color("--brand-primary",       "Brand primary",       G.brand),
  color("--brand-primary-hover", "Brand primary hover", G.brand),
  color("--shu",         "Shu (red accent)",  G.brand),
  color("--shu-wash",    "Shu wash",          G.brand),
  color("--ochre",       "Ochre (accent)",    G.brand),
  color("--ochre-wash",  "Ochre wash",        G.brand),
  color("--graphite",    "Graphite",          G.brand),

  // ===== Status =====
  color("--info-default",    "Info",         G.status),
  color("--info-subtle",     "Info subtle",  G.status),
  color("--info-text",       "Info text",    G.status),
  color("--success-default", "Success",        G.status),
  color("--success-subtle",  "Success subtle", G.status),
  color("--success-text",    "Success text",   G.status),
  color("--warning-default", "Warning",        G.status),
  color("--warning-subtle",  "Warning subtle", G.status),
  color("--warning-text",    "Warning text",   G.status),
  color("--error-default",   "Error",          G.status),
  color("--error-subtle",    "Error subtle",   G.status),
  color("--error-text",      "Error text",     G.status),

  // ===== Feedback shorthand =====
  color("--feedback-info",    "Feedback info",    G.feedback),
  color("--feedback-success", "Feedback success", G.feedback),
  color("--feedback-warning", "Feedback warning", G.feedback),
  color("--feedback-error",   "Feedback error",   G.feedback),

  // ===== AI accent =====
  color("--ai",      "AI",       G.ai),
  color("--ai-ink",  "AI ink",   G.ai),
  color("--ai-wash", "AI wash",  G.ai),

  // ===== Code & syntax =====
  color("--code-bg",     "Code bg",     G.code),
  color("--code-ink",    "Code ink",    G.code),
  color("--code-muted",  "Code muted",  G.code),
  color("--code-accent", "Code accent", G.code),
  color("--code-blue",   "Code blue",   G.code),
  color("--code-green",  "Code green",  G.code),

  // ===== Interactive states =====
  color("--interactive-hover",  "Interactive hover",  G.interactive),
  color("--interactive-active", "Interactive active", G.interactive),

  // ===== Guides =====
  color("--guide",       "Guide",       G.guide),
  color("--guide-soft",  "Guide soft",  G.guide),

  // ===== Radii (shared) =====
  length("--radius-sm",   "Radius sm",   G.radius, 24),
  length("--radius-md",   "Radius md",   G.radius, 24),
  length("--radius-lg",   "Radius lg",   G.radius, 32),
  length("--radius-xl",   "Radius xl",   G.radius, 48),
  length("--radius-full", "Radius full", G.radius, 9999, 0, 1),

  // ===== Legacy radii (shared) =====
  length("--r-sm", "r-sm (legacy)", G.rLegacy, 24),
  length("--r-md", "r-md (legacy)", G.rLegacy, 24),
  length("--r-lg", "r-lg (legacy)", G.rLegacy, 32),

  // ===== Spacing (shared) =====
  length("--space-2xs", "Space 2xs", G.space, 16),
  length("--space-xs",  "Space xs",  G.space, 16),
  length("--space-sm",  "Space sm",  G.space, 24),
  length("--space-md",  "Space md",  G.space, 32),
  length("--space-lg",  "Space lg",  G.space, 64),
  length("--space-xl",  "Space xl",  G.space, 128),

  // ===== Blur (shared) =====
  length("--blur-sm", "Blur sm", G.blur, 24),
  length("--blur-md", "Blur md", G.blur, 48),
  length("--blur-lg", "Blur lg", G.blur, 80),

  // ===== Durations (shared) =====
  duration("--duration-fast",   "Fast"),
  duration("--duration-normal", "Normal"),
  duration("--duration-slow",   "Slow"),

  // ===== Easing (shared, free-form string) =====
  str("--ease", "Ease", G.ease, "shared"),

  // ===== Shadows (shared, free-form string) =====
  str("--shadow-sm",  "Shadow sm",  G.shadow, "shared"),
  str("--shadow-md",  "Shadow md",  G.shadow, "shared"),
  str("--shadow-lg",  "Shadow lg",  G.shadow, "shared"),
  str("--shadow-xl",  "Shadow xl",  G.shadow, "shared"),
  str("--shadow-2xl", "Shadow 2xl", G.shadow, "shared"),

  // ===== Glows (shared, free-form string) =====
  str("--glow-sm", "Glow sm", G.glow, "shared"),
  str("--glow-md", "Glow md", G.glow, "shared"),
  str("--glow-lg", "Glow lg", G.glow, "shared"),

  // ===== Fonts (shared, free-form string) =====
  str("--font-primary", "Font primary", G.font, "shared"),
  str("--font-display", "Font display", G.font, "shared"),
  str("--font-sans",    "Font sans",    G.font, "shared"),
  str("--font-serif",   "Font serif",   G.font, "shared"),
  str("--font-mono",    "Font mono",    G.font, "shared"),
  str("--font-script",  "Font script",  G.font, "shared"),

  // ===== Type scalar (shared) =====
  length("--font-size-base", "Font size base (px)", G.fontMisc, 24, 10, 1),
  number("--font-weight-medium", "Font weight medium", G.fontMisc, 100, 900, 100),
  number("--line-height-normal", "Line height normal", G.fontMisc, 1, 2, 0.05),

  // ===== Z-index (shared) =====
  number("--z-sticky",   "z sticky",   G.z, 0, 9999),
  number("--z-dropdown", "z dropdown", G.z, 0, 9999),
  number("--z-backdrop", "z backdrop", G.z, 0, 9999),
  number("--z-modal",    "z modal",    G.z, 0, 9999),
  number("--z-popover",  "z popover",  G.z, 0, 9999),
  number("--z-tooltip",  "z tooltip",  G.z, 0, 9999),
];

// Distinct group order for the dock body.
export const GROUPS: string[] = Array.from(
  new Set(CATALOG.map((t) => t.group)),
);

// ---------- Categories — top-level tab nav inside the dock body ----------
// Splits the 22 groups into broader sections so the user is not
// scrolling through everything at once.

export type Category = "color" | "layout" | "type" | "motion";

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "color",  label: "Color" },
  { id: "layout", label: "Layout" },
  { id: "type",   label: "Type" },
  { id: "motion", label: "Motion" },
];

const GROUP_CATEGORY: Record<string, Category> = {
  [G.paper]:       "color",
  [G.ink]:         "color",
  [G.surface]:     "color",
  [G.border]:      "color",
  [G.action]:      "color",
  [G.brand]:       "color",
  [G.status]:      "color",
  [G.feedback]:    "color",
  [G.ai]:          "color",
  [G.code]:        "color",
  [G.interactive]: "color",
  [G.guide]:       "color",
  [G.misc]:        "color",
  [G.radius]:      "layout",
  [G.rLegacy]:     "layout",
  [G.space]:       "layout",
  [G.blur]:        "layout",
  [G.font]:        "type",
  [G.fontMisc]:    "type",
  [G.duration]:    "motion",
  [G.ease]:        "motion",
  [G.shadow]:      "motion",
  [G.glow]:        "motion",
  [G.z]:           "motion",
};

export function categoryFor(group: string): Category {
  return GROUP_CATEGORY[group] ?? "color";
}

export function groupsForCategory(cat: Category): string[] {
  return GROUPS.filter((g) => categoryFor(g) === cat);
}

// ---------- Sub-pages — within a category ----------
// Categories with > ~5 groups split into named sub-pages to keep the
// panel from becoming a long scroll. Categories that already fit on one
// page have a single page entry and no sub-tab strip is rendered.

export type SubPage = { id: string; label: string; groups: string[] };

export const SUB_PAGES: Record<Category, SubPage[]> = {
  color: [
    {
      id: "foundation",
      label: "Foundation",
      groups: [G.paper, G.ink, G.surface, G.border],
    },
    {
      id: "components",
      label: "Components",
      groups: [G.action, G.brand, G.ai, G.code, G.interactive],
    },
    {
      id: "status",
      label: "Status",
      groups: [G.status, G.feedback, G.guide],
    },
  ],
  layout: [
    { id: "all", label: "Layout", groups: groupsForCategory("layout") },
  ],
  type: [
    { id: "all", label: "Type", groups: groupsForCategory("type") },
  ],
  motion: [
    { id: "all", label: "Motion", groups: groupsForCategory("motion") },
  ],
};
