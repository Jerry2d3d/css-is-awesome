import type { Metadata } from "next";
import LaunchGate from "@/components/LaunchGate";
import "./globals.css";

export const metadata: Metadata = {
  title: "CSS is Awesome — a tiny design system",
  description:
    "A token-driven SCSS design system with a one-file theme swap, mixin-first API, and dogfooded docs.",
};

// Pre-hydration: read cookie and set <html data-theme> before first paint.
// The attribute starts as "sketchbook" (the default) in the static HTML;
// this script rewrites it when a returning visitor has a cookie set.
// suppressHydrationWarning on <html> covers the attribute mutation —
// React 19's warning scope is attribute/text on the element itself, so
// a single-attribute change is safely covered. No raw <head> children,
// no <link> mutation, no child-order mismatch.
const SET_THEME_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|;\\s*)cia-theme=([^;]+)/);var t=m&&["sketchbook","press","graphite","glass","cupertino","terminal"].indexOf(m[1])!==-1?m[1]:"sketchbook";document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="sketchbook" suppressHydrationWarning>
      <body>
        {/* Inline script FIRST in body — browsers execute it synchronously
            before any visible body content paints, so the theme attribute
            is already correct by the time CSS is applied. */}
        <script dangerouslySetInnerHTML={{ __html: SET_THEME_SCRIPT }} />
        {/* React 19 hoists <link rel="stylesheet"> with precedence into <head>
            for us — no raw <head> children, no hydration mismatch.
            theme.css holds all six themes as [data-theme="..."] blocks. */}
        <link rel="stylesheet" precedence="default" href="/theme.css" />
        <LaunchGate>{children}</LaunchGate>
      </body>
    </html>
  );
}
