import Link from "next/link";
import Example from "@/components/Example";
import Button from "@/components/Button";
import Card from "@/components/Card";

export default function DocsPage() {
  return (
    <>
      <h1>Get started in 5 minutes</h1>
      <p className="lead">
        Paste one HTML snippet, open it in a browser, and you are looking at a
        themed page. No build step, no config, no framework. When you are ready
        to re-skin, you change exactly one line.
      </p>

      <h2 id="minimum-setup">Minimum setup</h2>
      <p>
        Prerequisites: any modern browser. No Node, no bundler, no build step.
        The stylesheets below are served from the planned CDN at{" "}
        <code>https://cdn.css-is-awesome.dev/v1/</code> — theme first so the
        base can read its tokens.
      </p>
      <Example>
        <Example.Code><span className="tok-sel">{"<!doctype html>"}</span>
{"\n"}<span className="tok-sel">{"<html"}</span> <span className="tok-prop">lang</span>=<span className="tok-val">"en"</span><span className="tok-sel">{">"}</span>
{"\n"}<span className="tok-sel">{"<head>"}</span>
{"\n"}  <span className="tok-sel">{"<meta"}</span> <span className="tok-prop">charset</span>=<span className="tok-val">"utf-8"</span><span className="tok-sel">{">"}</span>
{"\n"}  <span className="tok-sel">{"<title>"}</span>Hello, sketchbook<span className="tok-sel">{"</title>"}</span>
{"\n"}  <span className="tok-sel">{"<link"}</span> <span className="tok-prop">rel</span>=<span className="tok-val">"stylesheet"</span> <span className="tok-prop">href</span>=<span className="tok-val">"https://cdn.css-is-awesome.dev/v1/theme-sketchbook.css"</span><span className="tok-sel">{">"}</span>
{"\n"}  <span className="tok-sel">{"<link"}</span> <span className="tok-prop">rel</span>=<span className="tok-val">"stylesheet"</span> <span className="tok-prop">href</span>=<span className="tok-val">"https://cdn.css-is-awesome.dev/v1/cia.css"</span><span className="tok-sel">{">"}</span>
{"\n"}<span className="tok-sel">{"</head>"}</span>
{"\n"}<span className="tok-sel">{"<body>"}</span>
{"\n"}  <span className="tok-sel">{"<main"}</span> <span className="tok-prop">class</span>=<span className="tok-val">"cia-container"</span><span className="tok-sel">{">"}</span>
{"\n"}    <span className="tok-sel">{"<h1>"}</span>Hello, sketchbook<span className="tok-sel">{"</h1>"}</span>
{"\n"}    <span className="tok-sel">{"<a"}</span> <span className="tok-prop">class</span>=<span className="tok-val">"cia-btn cia-btn--primary"</span> <span className="tok-prop">href</span>=<span className="tok-val">"#"</span><span className="tok-sel">{">"}</span>Get started<span className="tok-sel">{"</a>"}</span>
{"\n"}  <span className="tok-sel">{"</main>"}</span>
{"\n"}<span className="tok-sel">{"</body>"}</span>
{"\n"}<span className="tok-sel">{"</html>"}</span></Example.Code>
      </Example>
      <p>
        Save that as <code>index.html</code>, open it — you are done. That is
        the entire 1-minute track.
      </p>

      <h2 id="first-themed-element">Your first themed element</h2>
      <p>
        Every element in the system reads from the active theme&apos;s tokens.
        Here is a button and a card rendered live on this page, followed by the
        exact HTML that produced them.
      </p>
      <Example>
        <Example.Preview style={{ display: "grid", gap: "16px" }}>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Button variant="primary" href="#">Get started</Button>
            <Button variant="outline" href="#">Read the docs</Button>
          </div>
          <Card title="Warm paper, sumi ink">
            The card inherits its paper colour, border and serif title from the
            active theme. Swap the theme and this block re-skins without a
            single markup change.
          </Card>
        </Example.Preview>
        <Example.Code><span className="tok-sel">{"<a"}</span> <span className="tok-prop">class</span>=<span className="tok-val">"cia-btn cia-btn--primary"</span> <span className="tok-prop">href</span>=<span className="tok-val">"#"</span><span className="tok-sel">{">"}</span>Get started<span className="tok-sel">{"</a>"}</span>
{"\n"}<span className="tok-sel">{"<a"}</span> <span className="tok-prop">class</span>=<span className="tok-val">"cia-btn cia-btn--outline"</span> <span className="tok-prop">href</span>=<span className="tok-val">"#"</span><span className="tok-sel">{">"}</span>Read the docs<span className="tok-sel">{"</a>"}</span>
{"\n"}
{"\n"}<span className="tok-sel">{"<article"}</span> <span className="tok-prop">class</span>=<span className="tok-val">"cia-card"</span><span className="tok-sel">{">"}</span>
{"\n"}  <span className="tok-sel">{"<h4"}</span> <span className="tok-prop">class</span>=<span className="tok-val">"cia-card__title"</span><span className="tok-sel">{">"}</span>Warm paper, sumi ink<span className="tok-sel">{"</h4>"}</span>
{"\n"}  <span className="tok-sel">{"<p"}</span> <span className="tok-prop">class</span>=<span className="tok-val">"cia-card__body"</span><span className="tok-sel">{">"}</span>The card inherits its paper colour, border and serif title from the active theme.<span className="tok-sel">{"</p>"}</span>
{"\n"}<span className="tok-sel">{"</article>"}</span></Example.Code>
      </Example>

      <h2 id="swap-the-theme">Swap the theme</h2>
      <p>
        Themes are single files. The base stylesheet never hard-codes a colour,
        a radius or a font — it reads them from CSS custom properties the theme
        defines. Re-skinning the entire site is one <code>&lt;link&gt;</code>{" "}
        change:
      </p>
      <Example>
        <Example.Code><span className="tok-com">{"/* before — sketchbook */"}</span>
{"\n"}<span className="tok-sel">{"<link"}</span> <span className="tok-prop">rel</span>=<span className="tok-val">"stylesheet"</span> <span className="tok-prop">href</span>=<span className="tok-val">"https://cdn.css-is-awesome.dev/v1/theme-sketchbook.css"</span><span className="tok-sel">{">"}</span>
{"\n"}
{"\n"}<span className="tok-com">{"/* after — brutalist */"}</span>
{"\n"}<span className="tok-sel">{"<link"}</span> <span className="tok-prop">rel</span>=<span className="tok-val">"stylesheet"</span> <span className="tok-prop">href</span>=<span className="tok-val">"https://cdn.css-is-awesome.dev/v1/theme-brutalist.css"</span><span className="tok-sel">{">"}</span></Example.Code>
      </Example>
      <p>
        The <strong>ThemePicker</strong> in the site header does exactly that
        live — pick another theme from the menu and every preview on this page,
        including the button and card above, re-skins as you scroll. No reload,
        no rebuild. That is the entire theme contract.
      </p>

      <h2 id="what-next">What next</h2>
      <ul>
        <li>
          <Link href="/docs/install">Install</Link> — npm, Vite, Next.js and
          Sass entry points for build-step projects.
        </li>
        <li>
          <Link href="/docs/tokens">Tokens</Link> — every CSS custom property
          the system reads, grouped by role.
        </li>
        <li>
          <Link href="/docs/utilities">Utilities</Link> — the{" "}
          <code>cia-</code> utility classes for spacing, layout and type.
        </li>
      </ul>
    </>
  );
}
