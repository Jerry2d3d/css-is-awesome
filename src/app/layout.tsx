import type { Metadata } from "next";
import LaunchGate from "@/components/LaunchGate";
import { asset } from "@/lib/asset";
import "./globals.css";
// Global print layer — emits cia's @page box + the --is-print control plane.
// Must be a global stylesheet: print-base writes its own :root.
import "./print.scss";

export const metadata: Metadata = {
  title: "CSS is Awesome — a tiny design system",
  description:
    "A token-driven SCSS design system with a one-file theme swap, mixin-first API, and dogfooded docs.",
};

// Pre-hydration: read cookie and set <html data-theme> before first paint.
// The attribute starts as "sketchbook-light" (the default) in the static HTML;
// this script rewrites it when a returning visitor has a cookie set.
// suppressHydrationWarning on <html> covers the attribute mutation.
//
// Validation: a-z and hyphen only — prevents attribute injection while
// accepting any current or future theme name (suffixed v0.7 names AND the
// deprecated unsuffixed v0.6 aliases that resolve via public/theme.css).
const SET_THEME_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|;\\s*)cia-theme=([^;]+)/);var t=m&&/^[a-z-]+$/.test(m[1])?m[1]:"sketchbook-light";document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="sketchbook-light" suppressHydrationWarning>
      <body>
        {/* Inline script FIRST in body — browsers execute it synchronously
            before any visible body content paints, so the theme attribute
            is already correct by the time CSS is applied. */}
        <script dangerouslySetInnerHTML={{ __html: SET_THEME_SCRIPT }} />
        {/* React 19 hoists <link rel="stylesheet"> with precedence into <head>
            for us — no raw <head> children, no hydration mismatch.
            theme.css is the bundle: all 24 themes as :root[data-theme="..."]
            blocks. Standalone theme files also emit a bare :root so they work
            with no attribute, but the bundle has that stripped — otherwise
            every theme would match :root at once and the last would win. */}
        <link rel="stylesheet" precedence="default" href={asset("/theme.css")} />
        <LaunchGate>{children}</LaunchGate>
      </body>
    </html>
  );
}
