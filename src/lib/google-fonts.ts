// Curated Google Fonts catalog + dynamic <link> loader for the theme
// editor's font picker. The list is hand-picked (not the full Google
// Fonts API) so consumers get meaningful choices without an API key or
// a runtime catalog fetch.
//
// New fonts: append to the right FONT_OPTIONS category. Use the exact
// family name Google Fonts uses (case + spaces matter). Default weight
// axis (`300;400;500;600;700`) works for variable fonts; override with
// `weights` for display/script faces that ship fewer weights.

export type FontCategory = "sans" | "serif" | "mono" | "display" | "script";

export type FontOption = {
  family: string;     // Google Fonts family name (or "System default" for no-load)
  weights?: string;   // axis spec passed to fonts.googleapis.com (default 300-700)
  system?: boolean;   // skip the network load; use the category's SYSTEM_STACK
};

// Per-category fallback stack appended after the Google family (or used
// alone when "System default" is picked). These match what most themes
// already ship today.
export const SYSTEM_STACK: Record<FontCategory, string> = {
  sans:    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  serif:   "Georgia, 'Times New Roman', serif",
  mono:    "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
  display: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  script:  "'Brush Script MT', 'Lucida Handwriting', cursive",
};

const DEFAULT_WEIGHTS = "300;400;500;600;700";

export const FONT_OPTIONS: Record<FontCategory, FontOption[]> = {
  sans: [
    { family: "System default", system: true },
    { family: "Inter" },
    { family: "Roboto" },
    { family: "Open Sans" },
    { family: "Lato" },
    { family: "Montserrat" },
    { family: "Poppins" },
    { family: "Source Sans 3" },
    { family: "Work Sans" },
    { family: "Nunito" },
    { family: "Manrope" },
    { family: "DM Sans" },
    { family: "IBM Plex Sans" },
    { family: "Plus Jakarta Sans" },
    { family: "Public Sans" },
    { family: "Outfit" },
  ],
  serif: [
    { family: "System default", system: true },
    { family: "Lora" },
    { family: "Playfair Display", weights: "400;500;600;700;800" },
    { family: "Merriweather", weights: "300;400;700;900" },
    { family: "Crimson Pro" },
    { family: "Cormorant Garamond", weights: "300;400;500;600;700" },
    { family: "EB Garamond" },
    { family: "Source Serif 4" },
    { family: "IBM Plex Serif", weights: "300;400;500;600;700" },
    { family: "PT Serif", weights: "400;700" },
    { family: "Newsreader" },
    { family: "Fraunces" },
  ],
  mono: [
    { family: "System default", system: true },
    { family: "JetBrains Mono" },
    { family: "Fira Code" },
    { family: "Source Code Pro" },
    { family: "IBM Plex Mono", weights: "300;400;500;600;700" },
    { family: "Roboto Mono" },
    { family: "Space Mono", weights: "400;700" },
    { family: "Inconsolata" },
    { family: "DM Mono", weights: "300;400;500" },
  ],
  display: [
    { family: "System default", system: true },
    { family: "Bebas Neue", weights: "400" },
    { family: "Anton", weights: "400" },
    { family: "Oswald" },
    { family: "Archivo Black", weights: "400" },
    { family: "Abril Fatface", weights: "400" },
    { family: "Righteous", weights: "400" },
    { family: "Alfa Slab One", weights: "400" },
    { family: "Permanent Marker", weights: "400" },
    { family: "Pacifico", weights: "400" },
    { family: "Lobster", weights: "400" },
  ],
  script: [
    { family: "System default", system: true },
    { family: "Caveat" },
    { family: "Shadows Into Light", weights: "400" },
    { family: "Dancing Script" },
    { family: "Sacramento", weights: "400" },
    { family: "Great Vibes", weights: "400" },
    { family: "Kalam", weights: "300;400;700" },
    { family: "Indie Flower", weights: "400" },
    { family: "Satisfy", weights: "400" },
  ],
};

// Idempotent runtime loader. Injects a single <link> into <head> per
// family+weights pair; safe to call from any client component on every
// render. SSR/no-document guarded.
const LOADED = new Set<string>();
export function loadGoogleFont(family: string, weights?: string): void {
  if (typeof document === "undefined") return;
  if (!family || family === "System default") return;
  const w = weights ?? DEFAULT_WEIGHTS;
  const key = `${family}::${w}`;
  if (LOADED.has(key)) return;
  const id = `gf-${family.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${w.replace(/[^0-9]/g, "")}`;
  if (document.getElementById(id)) { LOADED.add(key); return; }
  const familyParam = encodeURIComponent(family).replace(/%20/g, "+");
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${familyParam}:wght@${w}&display=swap`;
  document.head.appendChild(link);
  LOADED.add(key);
}

// Build the CSS value to write into the --font-* token. System picks
// just emit the fallback stack; Google picks wrap the family in quotes
// and append the category fallback.
export function buildFontStack(option: FontOption, category: FontCategory): string {
  const fallback = SYSTEM_STACK[category];
  if (option.system) return fallback;
  return `'${option.family}', ${fallback}`;
}

// Inverse: given a token value, figure out which option in FONT_OPTIONS
// is currently selected. Matches the first family name found anywhere
// in the string; falls back to "System default" if no Google family is
// detected.
export function detectFontOption(value: string, category: FontCategory): FontOption {
  const opts = FONT_OPTIONS[category];
  if (!value) return opts[0];
  for (const opt of opts) {
    if (opt.system) continue;
    if (value.includes(`'${opt.family}'`) || value.includes(`"${opt.family}"`) || value.includes(opt.family)) {
      return opt;
    }
  }
  return opts[0];
}
