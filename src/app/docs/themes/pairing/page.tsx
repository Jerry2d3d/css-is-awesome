import Example from "@/components/Example";
import Badge from "@/components/Badge";

export default function ThemePairingPage() {
  return (
    <>
      <h1>Theme pairing — ship two brands by mode</h1>
      <p className="lead">
        Most design systems give you dark mode. cia lets you ship a <strong>second brand at night</strong> —
        in two HTML lines. No JavaScript, no mixin, no cia API surface. The browser does the work via
        native <code>{`<link media>`}</code> behavior.
      </p>

      <p>
        <Badge>0 KB JS</Badge>{" "}
        <Badge>0 cia code</Badge>{" "}
        <Badge>Native browser feature since 2002</Badge>{" "}
        <Badge>Editorial moat</Badge>
      </p>

      <h2 id="how">How it works</h2>
      <p>
        The <code>media</code> attribute on a <code>{`<link>`}</code> tag accepts any media query. The
        browser loads every linked stylesheet but <strong>only applies the ones whose media query matches</strong>.
        Pair two theme files with <code>prefers-color-scheme</code> media queries and you get two complete
        brand identities, system-flipped.
      </p>
      <Example>
        <Example.Code><span className="tok-com">{"<!-- light mode: warm paper Sketchbook -->"}</span>
{"\n"}<span className="tok-sel">{"<link"}</span> <span className="tok-prop">rel</span>=<span className="tok-val">"stylesheet"</span>
{"\n"}      <span className="tok-prop">href</span>=<span className="tok-val">"/cia/themes/sketchbook.css"</span>
{"\n"}      <span className="tok-prop">media</span>=<span className="tok-val">"(prefers-color-scheme: light)"</span><span className="tok-sel">{">"}</span>
{"\n"}
{"\n"}<span className="tok-com">{"<!-- dark mode: green-on-black Terminal -->"}</span>
{"\n"}<span className="tok-sel">{"<link"}</span> <span className="tok-prop">rel</span>=<span className="tok-val">"stylesheet"</span>
{"\n"}      <span className="tok-prop">href</span>=<span className="tok-val">"/cia/themes/terminal.css"</span>
{"\n"}      <span className="tok-prop">media</span>=<span className="tok-val">"(prefers-color-scheme: dark)"</span><span className="tok-sel">{">"}</span></Example.Code>
      </Example>
      <p>
        Don&rsquo;t set <code>data-theme</code> on <code>{`<html>`}</code> — these themes use{" "}
        <code>:root[data-theme=&ldquo;sketchbook&rdquo;]</code> internally, but the <code>media</code>{" "}
        attribute does the gating without you having to declare an active theme. Just include both
        files and let the OS preference decide.
      </p>

      <h2 id="why-this-matters">Why this is distinctive</h2>
      <p>
        No mainstream design system lets you do this. Bootstrap = one theme + tinted dark mode.
        Tailwind = utility classes that respond to <code>dark:</code> prefix. Material/Spectrum/Carbon =
        symmetric color flips. They all assume <strong>your brand is the same in light and dark</strong>.
      </p>
      <p>cia doesn&rsquo;t. With <code>{`<link media>`}</code> pairing, you can ship:</p>
      <ul>
        <li><strong>Newspaper by day, hacker terminal by night</strong> — Sketchbook + Terminal</li>
        <li><strong>Editorial light, neon cyberpunk dark</strong> — Press + Glass</li>
        <li><strong>Corporate brand light, personal portfolio dark</strong> — Boilerplate + Sketchbook</li>
        <li>...any of the 8 theme families × 8 = 64 combinations, or 56 once you drop the self-pairs</li>
      </ul>

      <h2 id="constraints">What you should know</h2>
      <ul>
        <li><strong>The browser loads both files.</strong> Combined size = ~4 KB gzipped for any pairing. No conditional download — just conditional application.</li>
        <li><strong>OS preference drives the swap.</strong> If a user toggles their system theme, the page re-applies immediately. No reload, no JS.</li>
        <li><strong>Component tokens differ wildly.</strong> Make sure your components use semantic tokens (<code>var(--action-primary-default)</code>, not hard-coded colors) so they survive both modes.</li>
        <li><strong>Image assets need to flip too.</strong> Use <code>{`<picture>`}</code> with <code>media</code> attributes for art-directed images per mode.</li>
        <li><strong>Each cia theme already pairs its own light + dark</strong> via <code>light-dark()</code>. Use pairing when you want a <em>different brand</em> per mode, not a different mode of the same brand.</li>
      </ul>

      <h2 id="forcing-a-mode">Forcing a mode</h2>
      <p>
        If a user wants to override their OS preference (force light or force dark on your site
        regardless of system), cia provides CSS hooks. The mechanism for SETTING the class is the
        consumer&rsquo;s responsibility (server cookie, localStorage JS, manual toggle — cia ships zero JS).
      </p>
      <Example>
        <Example.Code><span className="tok-com">{"<!-- Server-rendered or set by your own JS -->"}</span>
{"\n"}<span className="tok-sel">{"<html"}</span> <span className="tok-prop">class</span>=<span className="tok-val">"cia-force-light"</span><span className="tok-sel">{">"}</span>...<span className="tok-sel">{"</html>"}</span></Example.Code>
      </Example>

      <h2 id="marketing-line">The marketing line</h2>
      <blockquote>
        <p>
          <em>&ldquo;Most design systems give you dark mode. cia lets you ship a second brand at night —
          in two HTML lines.&rdquo;</em>
        </p>
      </blockquote>

      <h2 id="see-also">See also</h2>
      <ul>
        <li><a href="/themes">Browse all 8 themes</a></li>
        <li><a href="/docs/authoring/themes">Authoring your own theme</a></li>
      </ul>
    </>
  );
}
