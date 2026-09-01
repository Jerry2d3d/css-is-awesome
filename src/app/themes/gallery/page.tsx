"use client";
import styles from "./page.module.scss";
import SiteHeader from "@/components/SiteHeader";
import ThemeTile from "@/components/ThemeTile";
import type { ThemeTileProps } from "@/components/ThemeTile";
import Link from "next/link";
import { asset } from "@/lib/asset";

// One tile per theme family. The IDs below pin a mode with the `-light` /
// `-dark` suffix so each tile always previews the intended look; the
// unsuffixed name is a real theme too, and auto-switches via light-dark().
// All three are built from their own SCSS source under scss/themes/.
const THEMES: ThemeTileProps[] = [
  {
    id: "boilerplate-light",
    name: "Boilerplate",
    description: "Neutral starter — slate grays, system UI sans, one clean blue accent. Designed to be overridden.",
    href: asset("/themes/boilerplate/theme.css"),
    swatches: { paper: "#FFFFFF", ink: "#0F172A", accent: "#2563EB", seal: "#DC2626" },
  },
  {
    id: "sketchbook-light",
    name: "Sketchbook",
    description: "Warm washi paper, sumi ink, indigo accent. The default voice.",
    href: asset("/theme.css"),
    swatches: { paper: "#F7F3EA", ink: "#2A241E", accent: "#1F3A5F", seal: "#C1272D" },
  },
  {
    id: "press-light",
    name: "Press",
    description: "Editorial newsprint, Playfair serif, single press-red accent.",
    href: asset("/themes/press-light/theme.css"),
    swatches: { paper: "#FAFAF7", ink: "#0A0A0A", accent: "#1A1A1A", seal: "#D93025" },
  },
  {
    id: "graphite-dark",
    name: "Graphite",
    description: "Space-gray aluminum, Xcode dark, inset rim highlights.",
    href: asset("/themes/graphite-dark/theme.css"),
    swatches: { paper: "#1A1A1C", ink: "#F5F5F7", accent: "#0A84FF", seal: "#FF453A" },
  },
  {
    id: "glass-light",
    name: "Glass",
    description: "visionOS glassmorphism — frosted sheets, iOS indigo, dual-rim highlights.",
    href: asset("/themes/glass-light/theme.css"),
    swatches: { paper: "#F4EEFF", ink: "#1D1D1F", accent: "#5E5CE6", seal: "#FF375F" },
  },
  {
    id: "cupertino-light",
    name: "Cupertino",
    description: "macOS Sonoma window — AppKit grays, SF Pro, system blue.",
    href: asset("/themes/cupertino-light/theme.css"),
    swatches: { paper: "#F5F5F7", ink: "#1D1D1F", accent: "#0071E3", seal: "#FF3B30" },
  },
  {
    id: "terminal-dark",
    name: "Terminal",
    description: "VT100 phosphor green on deep black. Zero radii. All mono, all glow. Pairs with Terminal Light (daylight editor) — toggle in header.",
    href: asset("/themes/terminal/theme.css"),
    swatches: { paper: "#0A0E0A", ink: "#4FE078", accent: "#7FDBFF", seal: "#FF5A5A" },
  },
  {
    id: "prism-light",
    name: "Prism",
    description: "Zinc neutral ramp, Inter + JetBrains Mono. The familiar modern-app look, contract-conformant.",
    href: asset("/themes/prism-light/theme.css"),
    swatches: { paper: "#FFFFFF", ink: "#09090B", accent: "#2563EB", seal: "#DC2626" },
  },
];

export default function ThemeGalleryPage() {
  return (
    <>
      <SiteHeader current="themes" />
      <main className={styles.shell}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>eight voices, one contract</p>
          <h1>Theme gallery</h1>
          <p className="lead">
            Every theme is a single <code>theme.css</code> declaring the same 127
            required CSS custom properties. Eight families, 24 files — each
            family ships an auto (<code>light-dark()</code>) build plus pinned{" "}
            <code>-light</code> and <code>-dark</code> variants. Preview,
            download, or open one in the editor.
          </p>
        </section>

        <section className={styles.grid} aria-label="Theme gallery">
          {THEMES.map((t) => (
            <ThemeTile key={t.id} {...t} />
          ))}
        </section>

        <p className={styles.backLink}>
          <Link href="/themes">← Back to theme editor</Link>
        </p>
      </main>
    </>
  );
}
