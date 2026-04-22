import type { Metadata } from "next";
import ThemePicker from "@/components/ThemePicker";
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
    <html lang="en">
      <head>
        {/* Flash-of-wrong-theme prevention: decide the theme file before first paint. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem("cia-theme-file");if(!s){var dark=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;s=dark?"graphite":"sketchbook";}var m={sketchbook:"/theme.css",press:"/themes/press/theme.css",graphite:"/themes/graphite/theme.css",glass:"/themes/glass/theme.css",cupertino:"/themes/cupertino/theme.css",terminal:"/themes/terminal/theme.css"};var href=m[s]||m.sketchbook;document.documentElement.setAttribute("data-theme-id",s);var el=document.getElementById("cia-theme-link");if(el)el.href=href;else{document.write('<link id="cia-theme-link" rel="stylesheet" href="'+href+'">');}}catch(e){}})();`,
          }}
        />
        {/* Theme stylesheet — the ONE FILE that reskins the whole site.
            Swapped at runtime by <ThemePicker>. Kept in <head> so first
            paint already has tokens. */}
        <link id="cia-theme-link" rel="stylesheet" href="/theme.css" />
      </head>
      <body>
        {children}
        <ThemePicker />
      </body>
    </html>
  );
}
