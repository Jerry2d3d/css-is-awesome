import "./page.scss";
import SiteHeader from "@/components/SiteHeader";
import Post from "@/components/Post";
import type { PostProps } from "@/components/Post";

const POSTS: PostProps[] = [
  {
    date: "2026 · Apr 14",
    tag: "Theme",
    title: "The Sketchbook theme is a second Zen.",
    href: "#",
    excerpt:
      "The first Zen is a clean sheet of paper. The second is the same sheet after someone started drawing on it — construction lines visible, script captions in the margin, a draft stamp in the corner. Same tokens. More character.",
  },
  {
    date: "2026 · Apr 02",
    tag: "Themes",
    title: "Five voices, one system.",
    href: "#",
    excerpt:
      "Zen, Bricks, Brutalist, Terminal, Blueprint. Same HTML, five stylesheets, five very different products. Notes on how keeping the HTML still forces the system to prove itself.",
  },
  {
    date: "2026 · Mar 21",
    tag: "Color",
    title: "Why the accent is indigo (藍), not blue.",
    href: "#",
    excerpt:
      "Japanese indigo dye is cooler, deeper, and carries a history that \"blue\" in CSS land doesn't. A short post on picking an accent that doesn't look like every other design system on the internet.",
  },
  {
    date: "2026 · Mar 09",
    tag: "Experiments",
    title: "Container queries are finally boring.",
    href: "#",
    excerpt:
      "After years of waiting, container queries hit \"I don't think about them\" status. A quick look at where the system uses them and where it still prefers the media-query escape hatch.",
  },
  {
    date: "2026 · Feb 26",
    tag: "Meta",
    title: "Why the overflow stays.",
    href: "#",
    excerpt:
      "The CSS IS AWESOME meme works because it's honest. Most systems would patch the overflow away. This one keeps it — and I want to talk about why that matters more than it sounds.",
  },
  {
    date: "2026 · Feb 12",
    tag: "CLI",
    title: "Planning a CLI and an MCP server.",
    href: "#",
    excerpt: (
      <>
        Agents are going to touch design systems next. Early sketch of a companion CLI (<code>cia</code>) and an MCP server that exposes tokens and mixins as tools — so ChatGPT, Claude, and Gemini can actually reason about this system, not just autocomplete around it.
      </>
    ),
  },
  {
    date: "2026 · Jan 28",
    tag: "Release",
    title: "v0.1.0 — the first real draft.",
    href: "#",
    excerpt:
      "Shipped the first npm release. Tokens, light/dark theming, a large mixin API, and Figma tokens that stay in sync. Here's what's inside, what almost made it, and what's next.",
  },
];

export default function BlogPage() {
  return (
    <>
      <SiteHeader current="blog" />

      <main className="blog-shell">
        <section className="blog-hero">
          <p className="blog-hero__eyebrow">the sketchbook</p>
          <h1>Notes from the margins.</h1>
          <p>Updates, experiments, and small ideas from building the system. New posts when there's something worth saying.</p>
        </section>

        <section className="post-list">
          {POSTS.map((p) => (
            <Post key={p.title as string} {...p} />
          ))}
        </section>
      </main>
    </>
  );
}
