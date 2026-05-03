// Theme-init helper for SSR / Next.js App Router consumers.
//
// Theme swaps work via `<html data-theme="...">`. If you set the attribute
// in a useEffect, you get a flash-of-default-theme before hydration. The
// fix is an inline <script> in <head> (or as the first child of <html>)
// that runs synchronously before paint and sets the attribute from
// storage or system preference.
//
// Usage in Next.js App Router (app/layout.tsx):
//
//   import { getThemeInitScript } from "css-is-awesome/theme-init";
//
//   export default function RootLayout({ children }) {
//     return (
//       <html lang="en" suppressHydrationWarning>
//         <head>
//           <script dangerouslySetInnerHTML={{ __html: getThemeInitScript({
//             defaultTheme: "prism-light",
//             darkTheme: "prism-dark",
//             storageKey: "app-theme",
//           }) }} />
//         </head>
//         <body>{children}</body>
//       </html>
//     );
//   }
//
// `suppressHydrationWarning` on <html> is required because the script
// mutates the DOM before React hydrates — without it React warns about
// the server/client mismatch on the data-theme attribute.

export type ThemeInitOptions = {
  /**
   * Theme name to use when no value is stored AND prefers-color-scheme
   * resolves to light (or no preference). Defaults to "sketchbook".
   */
  defaultTheme?: string;
  /**
   * Theme name to use when prefers-color-scheme resolves to dark and no
   * value is stored. Pass undefined to ignore system preference and always
   * fall back to defaultTheme. Defaults to undefined.
   */
  darkTheme?: string;
  /**
   * localStorage key to read from. Defaults to "cia-theme".
   */
  storageKey?: string;
  /**
   * Element to set the `data-theme` attribute on. Defaults to "html".
   * Pass "body" if your theme.css scopes selectors there instead.
   */
  target?: "html" | "body";
};

/**
 * Returns an IIFE source string ready to drop into a script tag's content.
 * The script is self-contained — no runtime dependencies, ~250 bytes.
 *
 * Resolution order: stored value → prefers-color-scheme → defaultTheme.
 * Fails silently if storage is unavailable (Safari private mode etc.).
 */
export function getThemeInitScript(options: ThemeInitOptions = {}): string {
  const {
    defaultTheme = "sketchbook",
    darkTheme,
    storageKey = "cia-theme",
    target = "html",
  } = options;

  const targetExpr =
    target === "body"
      ? "document.body"
      : "document.documentElement";

  // JSON.stringify produces JS-safe quoted strings.
  const sk = JSON.stringify(storageKey);
  const dt = JSON.stringify(defaultTheme);
  const dk = darkTheme ? JSON.stringify(darkTheme) : "null";

  return `(function(){try{var s=localStorage.getItem(${sk});if(s){${targetExpr}.setAttribute('data-theme',s);return;}var d=${dk};if(d&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches){${targetExpr}.setAttribute('data-theme',d);return;}${targetExpr}.setAttribute('data-theme',${dt});}catch(e){${targetExpr}.setAttribute('data-theme',${dt});}})();`;
}
