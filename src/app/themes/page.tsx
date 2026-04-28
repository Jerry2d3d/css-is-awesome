import styles from "./page.module.scss";
import SiteHeader from "@/components/SiteHeader";
import ThemeTile from "@/components/ThemeTile";
import type { ThemeTileProps } from "@/components/ThemeTile";
import { asset } from "@/lib/asset";

const THEMES: ThemeTileProps[] = [
  {
    id: "sketchbook",
    name: "Sketchbook",
    description: "Warm washi paper, sumi ink, indigo accent. The default voice.",
    href: asset("/theme.css"),
    swatches: { paper: "#F7F3EA", ink: "#2A241E", accent: "#1F3A5F", seal: "#C1272D" },
  },
  {
    id: "press",
    name: "Press",
    description: "Editorial newsprint, Playfair serif, single press-red accent.",
    href: asset("/themes/press/theme.css"),
    swatches: { paper: "#FAFAF7", ink: "#0A0A0A", accent: "#1A1A1A", seal: "#D93025" },
  },
  {
    id: "graphite",
    name: "Graphite",
    description: "Space-gray aluminum, Xcode dark, inset rim highlights.",
    href: asset("/themes/graphite/theme.css"),
    swatches: { paper: "#1A1A1C", ink: "#F5F5F7", accent: "#0A84FF", seal: "#FF453A" },
  },
  {
    id: "glass",
    name: "Glass",
    description: "visionOS glassmorphism — frosted sheets, iOS indigo, dual-rim highlights.",
    href: asset("/themes/glass/theme.css"),
    swatches: { paper: "#F4EEFF", ink: "#1D1D1F", accent: "#5E5CE6", seal: "#FF375F" },
  },
  {
    id: "cupertino",
    name: "Cupertino",
    description: "macOS Sonoma window — AppKit grays, SF Pro, system blue.",
    href: asset("/themes/cupertino/theme.css"),
    swatches: { paper: "#F5F5F7", ink: "#1D1D1F", accent: "#0071E3", seal: "#FF3B30" },
  },
  {
    id: "terminal",
    name: "Terminal",
    description: "VT100 phosphor green on deep black. Zero radii. All mono, all glow.",
    href: asset("/themes/terminal/theme.css"),
    swatches: { paper: "#0A0E0A", ink: "#4FE078", accent: "#7FDBFF", seal: "#FF5A5A" },
  },
];

export default function ThemesPage() {
  return (
    <>
      <SiteHeader current="themes" />
      <main className={styles.shell}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>six voices, one contract</p>
          <h1>Themes</h1>
          <p className="lead">
            Every theme is a single <code>theme.css</code> declaring the same set of
            CSS custom properties. Swap the file, reskin the site. No build step.
          </p>
        </section>

        <section className={styles.grid}>
          {THEMES.map((t) => (
            <ThemeTile key={t.id} {...t} />
          ))}
        </section>
      </main>
    </>
  );
}
