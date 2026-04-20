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
