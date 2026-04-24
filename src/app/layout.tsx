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
      {/* suppressHydrationWarning on <head>: Next 15 auto-injects <meta charset>
          into head which may render in a different position than our raw <link>.
          That child-order mismatch is expected — we silence it here. */}
      <head suppressHydrationWarning>
        {/* Theme stylesheet — the ONE FILE that reskins the whole site.
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
      </head>
      <body>
        <LaunchGate>{children}</LaunchGate>
      </body>
    </html>
  );
}
