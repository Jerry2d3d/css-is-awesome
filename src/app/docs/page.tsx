import Example from "@/components/Example";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Seal from "@/components/Seal";

export default function DocsPage() {
  return (
    <>
      <h1 id="introduction">The sketchbook, documented.</h1>
      <p className="lead">Warm paper, sumi ink, and an indigo accent. Chunky serif display + handwritten script where it adds character. One stylesheet — one theme file — zero build step.</p>

      <h2 id="install">Install</h2>
      <p>Drop the stylesheets into your page. Theme first, then base — so the base can read the tokens.</p>
      <Example>
        <Example.Code><span className="tok-com">{"<!-- in your <head> -->"}</span>
{"\n"}<span className="tok-sel">{"<link"}</span> <span className="tok-prop">rel</span>=<span className="tok-val">"stylesheet"</span> <span className="tok-prop">href</span>=<span className="tok-val">"theme.css"</span><span className="tok-sel">{">"}</span>
{"\n"}<span className="tok-sel">{"<link"}</span> <span className="tok-prop">rel</span>=<span className="tok-val">"stylesheet"</span> <span className="tok-prop">href</span>=<span className="tok-val">"styles.css"</span><span className="tok-sel">{">"}</span></Example.Code>
      </Example>

      <h2 id="tokens">Design tokens</h2>
      <p>Every visual decision lives in <code>theme.css</code>. Replace that file and the entire system reskins. The base stylesheet never hard-codes a color.</p>
      <Example>
        <Example.Code><span className="tok-com">{"/* theme.css */"}</span>
{"\n"}<span className="tok-sel">:root</span> {"{"}
{"\n"}  <span className="tok-prop">--paper</span>:         <span className="tok-val">#F7F3EA</span>;
{"\n"}  <span className="tok-prop">--ink</span>:           <span className="tok-val">#2A241E</span>;
{"\n"}  <span className="tok-prop">--ai</span>:            <span className="tok-val">#1F3A5F</span>;   <span className="tok-com">{"/* indigo accent */"}</span>
{"\n"}  <span className="tok-prop">--shu</span>:           <span className="tok-val">#C1272D</span>;   <span className="tok-com">{"/* vermilion seal */"}</span>
{"\n"}  <span className="tok-prop">--font-display</span>: <span className="tok-val">'DM Serif Display'</span>;
{"\n"}  <span className="tok-prop">--font-script</span>:  <span className="tok-val">'Caveat'</span>;       <span className="tok-com">{"/* hand-written accents */"}</span>
{"\n"}{"}"}</Example.Code>
      </Example>

      <h2 id="grid">Grid</h2>
      <p>The logo is the reference implementation — a three-row grid in a fixed square. Visible pencil construction lines frame the process.</p>
      <Example>
        <Example.Preview style={{ display: "flex", justifyContent: "center" }}>
          <div className="logo-stage">
            <div className="logo" style={{ ["--logo-size" as string]: "200px" } as React.CSSProperties}>
              <span>CSS</span><span>IS</span><span className="overflow">AWESOME</span>
            </div>
            <span className="logo-stage__caption" aria-hidden="true">draft 01</span>
          </div>
        </Example.Preview>
        <Example.Code><span className="tok-sel">.logo</span> {"{"}
{"\n"}  <span className="tok-prop">display</span>: <span className="tok-val">grid</span>;
{"\n"}  <span className="tok-prop">grid-template-rows</span>: <span className="tok-val">1fr 1fr 1fr</span>;
{"\n"}  <span className="tok-prop">aspect-ratio</span>: <span className="tok-val">1 / 1</span>;
{"\n"}  <span className="tok-prop">border</span>: <span className="tok-val">2px solid var(--ink)</span>;
{"\n"}  <span className="tok-prop">overflow</span>: <span className="tok-val">visible</span>;  <span className="tok-com">{"/* the whole point */"}</span>
{"\n"}{"}"}</Example.Code>
      </Example>

      <h3 id="overflow">On purpose</h3>
      <p>Most design hides imperfection. This one frames it — the &quot;draft 01&quot; caption is a feature, not an afterthought.</p>
      <Example>
        <Example.Preview>
          <div className="grid-demo">
            <div>One</div><div>Two</div><div>Three</div>
          </div>
        </Example.Preview>
      </Example>

      <h2 id="buttons">Buttons</h2>
      <p>Three variants: primary, outline, ghost. Warm paper base, ink on hover.</p>
      <Example>
        <Example.Preview style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Button variant="primary" href="#">Primary</Button>
          <Button variant="outline" href="#">Outline</Button>
          <Button variant="ghost" href="#">Ghost</Button>
          <Seal>Approved</Seal>
        </Example.Preview>
      </Example>

      <h2 id="cards">Cards</h2>
      <p>Soft-bordered paper slips. The display serif handles their titles.</p>
      <Example>
        <Example.Preview style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "16px" }}>
          <Card title="Hand-drawn">Script accents on connector words add life.</Card>
          <Card title="Warm">Paper texture under every surface.</Card>
          <Card title="Honest">Overflow stays visible. So do the construction lines.</Card>
        </Example.Preview>
      </Example>

      <h2 id="nav">Navigation</h2>
      <p>A brush-underline active state — drawn, not boxed.</p>
      <Example>
        <Example.Preview style={{ display: "flex", justifyContent: "center" }}>
          <nav className="main-nav">
            <a href="#" className="is-active">Home</a>
            <a href="#">Docs</a>
            <a href="#">Examples</a>
          </nav>
        </Example.Preview>
      </Example>
    </>
  );
}
