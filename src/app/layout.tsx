import type { Metadata } from "next";
import LaunchGate from "@/components/LaunchGate";
import "./globals.css";

export const metadata: Metadata = {
  title: "CSS is Awesome — a tiny design system",
  description:
    "A token-driven SCSS design system with a one-file theme swap, mixin-first API, and dogfooded docs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning on <html>: the inline script below sets
    // data-theme-id before React hydrates (FOUC prevention). That deliberate
    // mutation differs from SSR output — we tell React not to warn.
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* Theme stylesheet + FOUC script live at the top of <body>, not in
            <head>. Next 15 + React 19 strictly validate <head> child order
            against its auto-injected metadata tags; raw <link>/<script>
            children of <head> trigger a hydration mismatch. In <body> the
            CSS still applies globally (browsers honor <link rel="stylesheet">
            anywhere), and the inline script still runs synchronously before
            any visible content paints.

            Theme stylesheet — the ONE FILE that reskins the whole site.
            MUST come before the FOUC script below so the script can find
            and update this link before first paint. Swapped at runtime by
            <ThemePicker>. */}
        <link id="cia-theme-link" rel="stylesheet" href="/theme.css" />
        {/* FOUC prevention: update the link above with the user's saved
            theme (or OS prefers-color-scheme) before first paint. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem("cia-theme-file");if(!s){var dark=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;s=dark?"graphite":"sketchbook";}var m={sketchbook:"/theme.css",press:"/themes/press/theme.css",graphite:"/themes/graphite/theme.css",glass:"/themes/glass/theme.css",cupertino:"/themes/cupertino/theme.css",terminal:"/themes/terminal/theme.css"};var href=m[s]||m.sketchbook;document.documentElement.setAttribute("data-theme-id",s);var el=document.getElementById("cia-theme-link");if(el)el.href=href;}catch(e){}})();`,
          }}
        />
        <LaunchGate>{children}</LaunchGate>
      </body>
    </html>
  );
}
