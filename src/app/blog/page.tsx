import "./page.scss";
import SiteHeader from "@/components/SiteHeader";

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
          <article className="post">
            <div>
              <div className="post__date">2026 · Apr 14</div>
              <span className="post__tag">Theme</span>
            </div>
            <div>
              <h2 className="post__title"><a href="#">The Sketchbook theme is a second Zen.</a></h2>
              <p className="post__excerpt">The first Zen is a clean sheet of paper. The second is the same sheet after someone started drawing on it — construction lines visible, script captions in the margin, a draft stamp in the corner. Same tokens. More character.</p>
              <a href="#" className="post__read">keep reading →</a>
            </div>
          </article>

          <article className="post">
            <div>
              <div className="post__date">2026 · Apr 02</div>
              <span className="post__tag">Themes</span>
            </div>
            <div>
              <h2 className="post__title"><a href="#">Five voices, one system.</a></h2>
              <p className="post__excerpt">Zen, Bricks, Brutalist, Terminal, Blueprint. Same HTML, five stylesheets, five very different products. Notes on how keeping the HTML still forces the system to prove itself.</p>
              <a href="#" className="post__read">keep reading →</a>
            </div>
          </article>

          <article className="post">
            <div>
              <div className="post__date">2026 · Mar 21</div>
              <span className="post__tag">Color</span>
            </div>
            <div>
              <h2 className="post__title"><a href="#">Why the accent is indigo (藍), not blue.</a></h2>
              <p className="post__excerpt">Japanese indigo dye is cooler, deeper, and carries a history that "blue" in CSS land doesn't. A short post on picking an accent that doesn't look like every other design system on the internet.</p>
              <a href="#" className="post__read">keep reading →</a>
            </div>
          </article>

          <article className="post">
            <div>
              <div className="post__date">2026 · Mar 09</div>
              <span className="post__tag">Experiments</span>
            </div>
            <div>
              <h2 className="post__title"><a href="#">Container queries are finally boring.</a></h2>
              <p className="post__excerpt">After years of waiting, container queries hit "I don't think about them" status. A quick look at where the system uses them and where it still prefers the media-query escape hatch.</p>
              <a href="#" className="post__read">keep reading →</a>
            </div>
          </article>

          <article className="post">
            <div>
              <div className="post__date">2026 · Feb 26</div>
              <span className="post__tag">Meta</span>
            </div>
            <div>
              <h2 className="post__title"><a href="#">Why the overflow stays.</a></h2>
              <p className="post__excerpt">The CSS IS AWESOME meme works because it's honest. Most systems would patch the overflow away. This one keeps it — and I want to talk about why that matters more than it sounds.</p>
              <a href="#" className="post__read">keep reading →</a>
            </div>
          </article>

          <article className="post">
            <div>
              <div className="post__date">2026 · Feb 12</div>
              <span className="post__tag">CLI</span>
            </div>
            <div>
              <h2 className="post__title"><a href="#">Planning a CLI and an MCP server.</a></h2>
              <p className="post__excerpt">Agents are going to touch design systems next. Early sketch of a companion CLI (<code>cia</code>) and an MCP server that exposes tokens and mixins as tools — so ChatGPT, Claude, and Gemini can actually reason about this system, not just autocomplete around it.</p>
              <a href="#" className="post__read">keep reading →</a>
            </div>
          </article>

          <article className="post">
            <div>
              <div className="post__date">2026 · Jan 28</div>
              <span className="post__tag">Release</span>
            </div>
            <div>
              <h2 className="post__title"><a href="#">v0.1.0 — the first real draft.</a></h2>
              <p className="post__excerpt">Shipped the first npm release. Tokens, light/dark theming, a large mixin API, and Figma tokens that stay in sync. Here's what's inside, what almost made it, and what's next.</p>
              <a href="#" className="post__read">keep reading →</a>
            </div>
          </article>
        </section>
      </main>
    </>
  );
}
