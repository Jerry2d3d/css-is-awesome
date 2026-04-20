import "./page.scss";
import SiteHeader from "@/components/SiteHeader";

export default function AboutPage() {
  return (
    <>
      <SiteHeader current="about" />

      <section className="about-hero">
        <p className="about-hero__eyebrow">a short history</p>
        <h1>Where this system came from.</h1>
        <p className="lead">A small design system, started because every other one I tried was too big, too buggy, and too slow to update. This is the one I wish I'd had.</p>
      </section>

      <article className="about-body">
        <h2>Why I built it</h2>
        <p>Every design system on the market has two problems: they ship with bugs, and they're painful to update. You pull in a framework and spend the next month fighting it. You patch. You override. You write CSS to undo CSS.</p>
        <p>I wanted the opposite. Something small enough that if a token needed changing, I could change it in a minute. Something honest enough that it didn't pretend to be a framework when all I needed was tokens and mixins. Something that got out of my way.</p>
        <p>So I built it.</p>

        <hr className="brush-rule" />

        <h2>The joke that gave it a name</h2>
        <p>In 2009, a designer named Steven Frank posted a now-legendary image: the words <strong>CSS&nbsp;IS&nbsp;AWESOME</strong> stacked inside a crisp black square, with <em>AWESOME</em> spilling honestly past the right edge. The joke was affectionate. Everyone who had ever written a stylesheet recognized it instantly — a box that was slightly too small, a word that refused to stay put.</p>
        <p>Most design systems hide that. They patch, clip, ellipsize, or pretend overflow never happens. This one keeps it. That's the spirit of the whole thing — honest about what it is, and about what it can't do.</p>

        <hr className="brush-rule" />

        <h2>The principles that followed</h2>
        <div className="principle-grid">
          <div className="principle">
            <div className="principle__num">1</div>
            <h4>Tiny by default</h4>
            <p>A handful of tokens and a handful of mixins. If you can't read the system in an afternoon, it's too big.</p>
          </div>
          <div className="principle">
            <div className="principle__num">2</div>
            <h4>Honest about limits</h4>
            <p>Keep the overflow. Don't hide imperfection — dimension it, annotate it, ship it.</p>
          </div>
          <div className="principle">
            <div className="principle__num">3</div>
            <h4>Skins are themes</h4>
            <p>One HTML. Many stylesheets. Zen, Bricks, Brutalist, Terminal, Blueprint, Sketchbook — same system, different voices.</p>
          </div>
          <div className="principle">
            <div className="principle__num">4</div>
            <h4>Tools, not stock</h4>
            <p>Don't ship finished products. Ship the pieces. The designer decides the shape.</p>
          </div>
        </div>

        <hr className="brush-rule" />

        <h2>Milestones, so far</h2>
        <ol className="timeline">
          <li className="timeline__item">
            <div className="timeline__date">2009 — the origin</div>
            <h3 className="timeline__title">A meme is posted.</h3>
            <p className="timeline__body">Steven Frank ships the now-famous <code>CSS&nbsp;IS&nbsp;AWESOME</code> image. The internet keeps it forever.</p>
          </li>
          <li className="timeline__item">
            <div className="timeline__date">2025 — the package</div>
            <h3 className="timeline__title">v0.1.0 on npm.</h3>
            <p className="timeline__body">A token-driven SCSS design system ships. Light and dark themes, semantic tokens, an ~800-LOC mixin API, Figma tokens auto-generated from Tokens Studio.</p>
          </li>
          <li className="timeline__item">
            <div className="timeline__date">2026 — the themes</div>
            <h3 className="timeline__title">Five voices, one system.</h3>
            <p className="timeline__body">Zen, Bricks, Brutalist, Terminal, Blueprint — each a full skin, each honoring the overflow. Sketchbook arrives later in the year.</p>
          </li>
          <li className="timeline__item">
            <div className="timeline__date">next — what's coming</div>
            <h3 className="timeline__title">MCP, CLI, agent bots.</h3>
            <p className="timeline__body">A companion CLI for scaffolding, an MCP server so agents can reason about the system directly, and custom bots in ChatGPT, Claude, and Gemini that speak it fluently.</p>
          </li>
        </ol>

        <hr className="brush-rule" />

        <h2>What it isn't</h2>
        <p>This isn't Tailwind. It isn't Bootstrap. It isn't a component library with 80 prebuilt headers. It's a box of primitives — bricks, if you prefer — that hand you a palette, a grid, and the honest freedom to build the rest yourself.</p>
        <p>If you want a system that looks like every other site, reach for something else. If you want one that gives you the tools and gets out of the way, this is it.</p>

        <p style={{ marginTop: '3rem' }}><span className="seal">Approved · v0.1</span></p>
      </article>
    </>
  );
}
