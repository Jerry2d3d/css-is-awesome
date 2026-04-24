import Example from "@/components/Example";

// ------------------------------------------------------------------
// Page-scoped CSS
// ------------------------------------------------------------------
// The compiled .cia-anim-* / .cia-hover-* utility classes live in the
// library's own cia.css, which is not bundled into the docs site.
// We redeclare the keyframes + the minimal utility behaviour here
// (prefixed .docs-anim-*) so every live preview on this page actually
// animates. Every rule reads from --duration-* / --ease so the demos
// still reskin when the ThemePicker swaps themes.
// ------------------------------------------------------------------
const pageCSS = `
@keyframes docs-cia-fade-in {
  from { opacity: 0; } to { opacity: 1; }
}
@keyframes docs-cia-slide-up {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes docs-cia-scale-in {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes docs-cia-pop {
  0% { transform: scale(1); }
  40% { transform: scale(1.06); }
  100% { transform: scale(1); }
}
@keyframes docs-cia-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}
@keyframes docs-cia-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes docs-cia-wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-2deg); }
  75% { transform: rotate(2deg); }
}
@keyframes docs-cia-shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.docs-anim-stage {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  align-items: center;
}
.docs-anim-dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: var(--r-md);
  background: var(--surface-emphasis);
  color: var(--text-inverse);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.02em;
  border: 1px solid var(--border-default);
}
.docs-anim-fade-in  { animation: docs-cia-fade-in  var(--duration-slow) var(--ease) infinite alternate both; }
.docs-anim-slide-up { animation: docs-cia-slide-up var(--duration-slow) var(--ease) infinite alternate both; }
.docs-anim-scale-in { animation: docs-cia-scale-in var(--duration-slow) var(--ease) infinite alternate both; }
.docs-anim-pop      { animation: docs-cia-pop      var(--duration-slow) var(--ease) infinite both; }
.docs-anim-pulse    { animation: docs-cia-pulse    var(--duration-slow) var(--ease) infinite both; }
.docs-anim-spin     { animation: docs-cia-spin     var(--duration-slow) linear      infinite; }
.docs-anim-wiggle   { animation: docs-cia-wiggle   var(--duration-slow) var(--ease) infinite both; }

.docs-anim-shimmer-bar {
  height: 14px;
  width: 240px;
  border-radius: var(--r-sm);
  background: linear-gradient(
    90deg,
    var(--surface-sunk)    0%,
    var(--surface-raised) 50%,
    var(--surface-sunk)  100%
  );
  background-size: 200% 100%;
  animation: docs-cia-shimmer var(--duration-slow) linear infinite;
  border: 1px solid var(--border-subtle);
}

.docs-anim-token-btn {
  appearance: none;
  border: 1px solid var(--border-default);
  padding: 0.55rem 1rem;
  border-radius: var(--r-md);
  font-family: var(--font-sans);
  font-size: 0.9rem;
  color: var(--text-primary);
  background: var(--surface-raised);
  cursor: pointer;
  transition:
    background var(--duration-fast) var(--ease),
    color      var(--duration-fast) var(--ease);
}
.docs-anim-token-btn:hover {
  background: var(--brand-primary);
  color: var(--text-inverse);
}

.docs-anim-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 1.1rem;
  border-radius: var(--r-md);
  border: 1px solid var(--border-default);
  background: var(--surface-raised);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 0.88rem;
  cursor: pointer;
  user-select: none;
}
.docs-hover-lift {
  transition:
    transform  var(--duration-fast) var(--ease),
    box-shadow var(--duration-fast) var(--ease);
}
.docs-hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.docs-hover-press {
  transition: transform var(--duration-fast) var(--ease);
}
.docs-hover-press:hover { transform: translateY(1px) scale(0.99); }
.docs-hover-fade {
  transition: opacity var(--duration-fast) var(--ease);
}
.docs-hover-fade:hover { opacity: 0.7; }

@media (prefers-reduced-motion: reduce) {
  .docs-anim-fade-in,
  .docs-anim-slide-up,
  .docs-anim-scale-in,
  .docs-anim-pop,
  .docs-anim-pulse,
  .docs-anim-spin,
  .docs-anim-wiggle,
  .docs-anim-shimmer-bar {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
  .docs-anim-token-btn,
  .docs-hover-lift,
  .docs-hover-press,
  .docs-hover-fade { transition: none !important; }
  .docs-hover-lift:hover,
  .docs-hover-press:hover { transform: none !important; }
}
`;

export default function DocsAnimationPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageCSS }} />

      <h1>Animation</h1>
      <p className="lead">
        Motion tokens drive every transition; keyframes stay small and
        intentional; reduced-motion is respected at both the utility and
        document level.
      </p>

      {/* ============================================================ */}
      <h2 id="motion-tokens">Motion tokens</h2>
      <p>
        The whole animation system reads from four CSS custom properties.
        Swap the theme and every transition, hover and keyframe retimes
        without a single code change — Terminal snaps, Glass floats, Press
        drifts.
      </p>
      <table>
        <thead>
          <tr>
            <th>Token</th>
            <th>Role</th>
            <th>Sketchbook default</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>--duration-fast</code></td>
            <td>Hover, focus, button press — interactions that must feel immediate.</td>
            <td><code>180ms</code></td>
          </tr>
          <tr>
            <td><code>--duration-normal</code></td>
            <td>Enter / exit transitions, tooltip + popover reveals.</td>
            <td><code>240ms</code></td>
          </tr>
          <tr>
            <td><code>--duration-slow</code></td>
            <td>Looping ambients — pulse, spin, shimmer, wiggle.</td>
            <td><code>380ms</code></td>
          </tr>
          <tr>
            <td><code>--ease</code></td>
            <td>Default easing curve for every transition and non-linear keyframe.</td>
            <td><code>cubic-bezier(0.33, 0.66, 0.33, 1)</code></td>
          </tr>
        </tbody>
      </table>
      <p>
        Reach for <code>var(--duration-*)</code> in your own SCSS or inline
        styles — never hard-code <code>180ms</code>. A button that reads
        the token is a button that ships with every theme.
      </p>
      <Example>
        <Example.Preview>
          <button type="button" className="docs-anim-token-btn">
            Hover me
          </button>
        </Example.Preview>
        <Example.Code><span className="tok-sel">.my-btn</span> {"{"}
{"\n"}  <span className="tok-prop">transition</span>: <span className="tok-val">background var(--duration-fast) var(--ease),</span>
{"\n"}              <span className="tok-val">color      var(--duration-fast) var(--ease)</span>;
{"\n"}{"}"}
{"\n"}<span className="tok-sel">.my-btn</span><span className="tok-sel">:hover</span> {"{"}
{"\n"}  <span className="tok-prop">background</span>: <span className="tok-val">var(--brand-primary)</span>;
{"\n"}  <span className="tok-prop">color</span>:      <span className="tok-val">var(--text-inverse)</span>;
{"\n"}{"}"}</Example.Code>
      </Example>

      {/* ============================================================ */}
      <h2 id="keyframes">Keyframe library</h2>
      <p>
        <code>_animations.scss</code> ships a fixed vocabulary of twelve{" "}
        <code>@keyframes</code>. Every one is prefixed <code>cia-</code> so it
        never collides with host app animations. Durations default to{" "}
        <code>--duration-normal</code>; override per-utility with the{" "}
        <code>-fast</code> / <code>-slow</code> suffixes.
      </p>
      <table>
        <thead>
          <tr>
            <th>Keyframe</th>
            <th>What it animates</th>
            <th>Typical use</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>cia-fade-in</code></td>
            <td>Opacity <code>0 → 1</code>.</td>
            <td>Content appearing after mount, skeleton-to-data swap.</td>
          </tr>
          <tr>
            <td><code>cia-fade-out</code></td>
            <td>Opacity <code>1 → 0</code>.</td>
            <td>Dismissing toasts, closing overlays.</td>
          </tr>
          <tr>
            <td><code>cia-slide-up</code></td>
            <td>Opacity + <code>translateY(8px → 0)</code>.</td>
            <td>Dropdowns, popovers, off-canvas drawers.</td>
          </tr>
          <tr>
            <td><code>cia-slide-down</code></td>
            <td>Opacity + <code>translateY(-8px → 0)</code>.</td>
            <td>Header banners, inline alerts.</td>
          </tr>
          <tr>
            <td><code>cia-slide-left</code></td>
            <td>Opacity + <code>translateX(8px → 0)</code>.</td>
            <td>Right-edge panels entering.</td>
          </tr>
          <tr>
            <td><code>cia-slide-right</code></td>
            <td>Opacity + <code>translateX(-8px → 0)</code>.</td>
            <td>Left-edge panels entering.</td>
          </tr>
          <tr>
            <td><code>cia-scale-in</code></td>
            <td>Opacity + <code>scale(0.96 → 1)</code>.</td>
            <td>Modal content, tooltip bodies.</td>
          </tr>
          <tr>
            <td><code>cia-pop</code></td>
            <td>Scale beat: <code>1 → 1.06 → 1</code>.</td>
            <td>Notification badges, success icons.</td>
          </tr>
          <tr>
            <td><code>cia-pulse</code></td>
            <td>Opacity loop <code>1 → 0.55 → 1</code>.</td>
            <td>Loading placeholders, live indicators.</td>
          </tr>
          <tr>
            <td><code>cia-spin</code></td>
            <td><code>rotate(0 → 360deg)</code>, linear.</td>
            <td>Spinners, refresh icons.</td>
          </tr>
          <tr>
            <td><code>cia-shimmer</code></td>
            <td>Sweeps a gradient background across an element.</td>
            <td>Skeletons with a moving highlight.</td>
          </tr>
          <tr>
            <td><code>cia-wiggle</code></td>
            <td>Rotation jitter <code>-2° → 2°</code>.</td>
            <td>Invalid-input feedback, attention shakes.</td>
          </tr>
        </tbody>
      </table>

      <h3 id="keyframes-fade">Fade-in</h3>
      <Example>
        <Example.Preview>
          <div className="docs-anim-stage">
            <div className="docs-anim-dot docs-anim-fade-in">fade</div>
          </div>
        </Example.Preview>
        <Example.Code><span className="tok-sel">.demo</span> {"{"}
{"\n"}  <span className="tok-prop">animation</span>: <span className="tok-val">cia-fade-in var(--duration-slow) var(--ease) infinite alternate both</span>;
{"\n"}{"}"}</Example.Code>
      </Example>

      <h3 id="keyframes-slide-up">Slide-up</h3>
      <Example>
        <Example.Preview>
          <div className="docs-anim-stage">
            <div className="docs-anim-dot docs-anim-slide-up">slide</div>
          </div>
        </Example.Preview>
        <Example.Code><span className="tok-sel">.demo</span> {"{"}
{"\n"}  <span className="tok-prop">animation</span>: <span className="tok-val">cia-slide-up var(--duration-normal) var(--ease) both</span>;
{"\n"}{"}"}</Example.Code>
      </Example>

      <h3 id="keyframes-scale-in">Scale-in</h3>
      <Example>
        <Example.Preview>
          <div className="docs-anim-stage">
            <div className="docs-anim-dot docs-anim-scale-in">scale</div>
          </div>
        </Example.Preview>
        <Example.Code><span className="tok-sel">.modal</span><span className="tok-sel">__body</span> {"{"}
{"\n"}  <span className="tok-prop">animation</span>: <span className="tok-val">cia-scale-in var(--duration-normal) var(--ease) both</span>;
{"\n"}{"}"}</Example.Code>
      </Example>

      <h3 id="keyframes-pop">Pop</h3>
      <Example>
        <Example.Preview>
          <div className="docs-anim-stage">
            <div className="docs-anim-dot docs-anim-pop">pop</div>
          </div>
        </Example.Preview>
        <Example.Code><span className="tok-sel">.badge</span><span className="tok-sel">--new</span> {"{"}
{"\n"}  <span className="tok-prop">animation</span>: <span className="tok-val">cia-pop var(--duration-slow) var(--ease)</span>;
{"\n"}{"}"}</Example.Code>
      </Example>

      <h3 id="keyframes-pulse">Pulse</h3>
      <Example>
        <Example.Preview>
          <div className="docs-anim-stage">
            <div className="docs-anim-dot docs-anim-pulse">pulse</div>
          </div>
        </Example.Preview>
        <Example.Code><span className="tok-sel">.live-dot</span> {"{"}
{"\n"}  <span className="tok-prop">animation</span>: <span className="tok-val">cia-pulse var(--duration-slow) var(--ease) infinite</span>;
{"\n"}{"}"}</Example.Code>
      </Example>

      <h3 id="keyframes-spin">Spin</h3>
      <Example>
        <Example.Preview>
          <div className="docs-anim-stage">
            <div className="docs-anim-dot docs-anim-spin">spin</div>
          </div>
        </Example.Preview>
        <Example.Code><span className="tok-sel">.spinner</span> {"{"}
{"\n"}  <span className="tok-prop">animation</span>: <span className="tok-val">cia-spin var(--duration-slow) linear infinite</span>;
{"\n"}{"}"}</Example.Code>
      </Example>

      <h3 id="keyframes-wiggle">Wiggle</h3>
      <Example>
        <Example.Preview>
          <div className="docs-anim-stage">
            <div className="docs-anim-dot docs-anim-wiggle">wiggle</div>
          </div>
        </Example.Preview>
        <Example.Code><span className="tok-sel">.field</span><span className="tok-sel">--invalid</span> {"{"}
{"\n"}  <span className="tok-prop">animation</span>: <span className="tok-val">cia-wiggle var(--duration-slow) var(--ease)</span>;
{"\n"}{"}"}</Example.Code>
      </Example>

      <h3 id="keyframes-shimmer">Shimmer</h3>
      <Example>
        <Example.Preview>
          <div className="docs-anim-stage">
            <div className="docs-anim-shimmer-bar" aria-hidden />
          </div>
        </Example.Preview>
        <Example.Code><span className="tok-sel">.skeleton</span> {"{"}
{"\n"}  <span className="tok-prop">background</span>: <span className="tok-val">linear-gradient(90deg, var(--surface-sunk), var(--surface-raised), var(--surface-sunk))</span>;
{"\n"}  <span className="tok-prop">background-size</span>: <span className="tok-val">200% 100%</span>;
{"\n"}  <span className="tok-prop">animation</span>: <span className="tok-val">cia-shimmer var(--duration-slow) linear infinite</span>;
{"\n"}{"}"}</Example.Code>
      </Example>

      {/* ============================================================ */}
      <h2 id="utility-classes">Utility classes</h2>
      <p>
        Every keyframe is exposed as a <code>.cia-anim-&lt;name&gt;</code>{" "}
        utility, with <code>-fast</code> and <code>-slow</code> speed
        variants. Three loopers — <code>spin</code>, <code>pulse</code>,{" "}
        <code>shimmer</code> — ship with an <code>infinite</code>{" "}
        iteration count built in, because that is how they are used 99% of
        the time.
      </p>
      <table>
        <thead>
          <tr>
            <th>Class</th>
            <th>Effect</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>.cia-anim-fade-in</code></td>
            <td>Fade from transparent to opaque, runs once.</td>
            <td><code>--duration-normal</code></td>
          </tr>
          <tr>
            <td><code>.cia-anim-fade-out</code></td>
            <td>Fade from opaque to transparent, runs once.</td>
            <td><code>--duration-normal</code></td>
          </tr>
          <tr>
            <td><code>.cia-anim-slide-up</code></td>
            <td>Rise 8px while fading in, runs once.</td>
            <td><code>--duration-normal</code></td>
          </tr>
          <tr>
            <td><code>.cia-anim-slide-down</code></td>
            <td>Drop 8px while fading in, runs once.</td>
            <td><code>--duration-normal</code></td>
          </tr>
          <tr>
            <td><code>.cia-anim-slide-left</code></td>
            <td>Slide in from the right 8px while fading.</td>
            <td><code>--duration-normal</code></td>
          </tr>
          <tr>
            <td><code>.cia-anim-slide-right</code></td>
            <td>Slide in from the left 8px while fading.</td>
            <td><code>--duration-normal</code></td>
          </tr>
          <tr>
            <td><code>.cia-anim-scale-in</code></td>
            <td>Scale from 0.96 to 1 while fading in.</td>
            <td><code>--duration-normal</code></td>
          </tr>
          <tr>
            <td><code>.cia-anim-pop</code></td>
            <td>Brief scale beat up to 1.06, runs once.</td>
            <td><code>--duration-normal</code></td>
          </tr>
          <tr>
            <td><code>.cia-anim-wiggle</code></td>
            <td>Small rotation jitter, runs once.</td>
            <td><code>--duration-normal</code></td>
          </tr>
          <tr>
            <td><code>.cia-anim-spin</code></td>
            <td>Continuous 360° rotation.</td>
            <td><code>--duration-slow</code>, infinite, linear</td>
          </tr>
          <tr>
            <td><code>.cia-anim-pulse</code></td>
            <td>Continuous opacity breathing.</td>
            <td><code>--duration-slow</code>, infinite</td>
          </tr>
          <tr>
            <td><code>.cia-anim-shimmer</code></td>
            <td>Continuous gradient sweep across the element.</td>
            <td><code>--duration-slow</code>, infinite, linear</td>
          </tr>
          <tr>
            <td><code>.cia-anim-&lt;name&gt;-fast</code></td>
            <td>Same animation, runs at <code>--duration-fast</code>.</td>
            <td><code>--duration-fast</code></td>
          </tr>
          <tr>
            <td><code>.cia-anim-&lt;name&gt;-slow</code></td>
            <td>Same animation, runs at <code>--duration-slow</code>.</td>
            <td><code>--duration-slow</code></td>
          </tr>
        </tbody>
      </table>
      <p>
        Two examples the system leans on most — a pulsing live dot and a
        shimmering skeleton — rendered live with the exact behaviour the
        utility classes produce.
      </p>
      <Example>
        <Example.Preview>
          <div className="docs-anim-stage">
            <div className="docs-anim-dot docs-anim-pulse">pulse</div>
            <div className="docs-anim-shimmer-bar" aria-hidden />
          </div>
        </Example.Preview>
        <Example.Code><span className="tok-sel">{"<span"}</span> <span className="tok-prop">class</span>=<span className="tok-val">{'"cia-anim-pulse"'}</span><span className="tok-sel">{">"}</span>live<span className="tok-sel">{"</span>"}</span>
{"\n"}<span className="tok-sel">{"<div"}</span> <span className="tok-prop">class</span>=<span className="tok-val">{'"skeleton cia-anim-shimmer"'}</span><span className="tok-sel">{">"}</span><span className="tok-sel">{"</div>"}</span></Example.Code>
      </Example>

      {/* ============================================================ */}
      <h2 id="hover-utilities">Hover utilities</h2>
      <p>
        Four hover primitives cover the interactions the system needs most.
        Each one is a token-driven micro-transition — no motion values are
        hard-coded, so they adopt the active theme&apos;s timing curve.
      </p>
      <table>
        <thead>
          <tr>
            <th>Class</th>
            <th>Effect on hover</th>
            <th>Reads from</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>.cia-hover-lift</code></td>
            <td><code>translateY(-2px)</code> + medium shadow.</td>
            <td><code>--duration-fast</code>, <code>--shadow-md</code></td>
          </tr>
          <tr>
            <td><code>.cia-hover-glow</code></td>
            <td>Medium glow via <code>box-shadow</code>.</td>
            <td><code>--duration-fast</code>, <code>--glow-md</code></td>
          </tr>
          <tr>
            <td><code>.cia-hover-press</code></td>
            <td><code>translateY(1px) scale(0.99)</code> — button-press feel.</td>
            <td><code>--duration-fast</code></td>
          </tr>
          <tr>
            <td><code>.cia-hover-fade</code></td>
            <td>Opacity dips to <code>0.7</code>.</td>
            <td><code>--duration-fast</code></td>
          </tr>
        </tbody>
      </table>
      <p>
        <code>.cia-hover-glow</code> only reads as a true glow under themes
        that ship non-transparent <code>--glow-*</code> values (Terminal,
        Graphite, Glass). Paper themes declare the glow token as a no-op
        so the class still applies without visual noise.
      </p>
      <Example>
        <Example.Preview>
          <div className="docs-anim-stage">
            <span className="docs-anim-chip docs-hover-lift">lift</span>
            <span className="docs-anim-chip docs-hover-press">press</span>
            <span className="docs-anim-chip docs-hover-fade">fade</span>
          </div>
        </Example.Preview>
        <Example.Code><span className="tok-sel">{"<a"}</span> <span className="tok-prop">class</span>=<span className="tok-val">{'"cia-card cia-hover-lift"'}</span><span className="tok-sel">{">"}</span>…<span className="tok-sel">{"</a>"}</span>
{"\n"}<span className="tok-sel">{"<button"}</span> <span className="tok-prop">class</span>=<span className="tok-val">{'"cia-btn cia-hover-press"'}</span><span className="tok-sel">{">"}</span>…<span className="tok-sel">{"</button>"}</span>
{"\n"}<span className="tok-sel">{"<img"}</span> <span className="tok-prop">class</span>=<span className="tok-val">{'"cia-hover-fade"'}</span> <span className="tok-prop">src</span>=<span className="tok-val">{'"/thumb.jpg"'}</span> <span className="tok-prop">alt</span>=<span className="tok-val">{'""'}</span><span className="tok-sel">{">"}</span></Example.Code>
      </Example>

      {/* ============================================================ */}
      <h2 id="transition-mixins">Transition mixin</h2>
      <p>
        For authored components that need a token-aware{" "}
        <code>transition</code> declaration without typing it by hand,{" "}
        <code>_mixins.scss</code> exposes a variadic{" "}
        <code>transition</code> mixin. It accepts a list of properties
        interleaved with optional speed and easing keywords.
      </p>
      <Example>
        <Example.Code><span className="tok-com">{"// signature"}</span>
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">transition</span>($props...);
{"\n"}
{"\n"}<span className="tok-com">{"// speed keywords:   instant | fast | normal | slow | slower"}</span>
{"\n"}<span className="tok-com">{"// easing keywords:  linear | ease | ease-in | ease-out | ease-in-out | bounce | smooth"}</span>
{"\n"}<span className="tok-com">{"// anything else is treated as a CSS property"}</span>
{"\n"}
{"\n"}<span className="tok-com">{"// usage"}</span>
{"\n"}<span className="tok-sel">.my-card</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.transition(background, color)</span>;           <span className="tok-com">{"// fast + smooth (defaults)"}</span>
{"\n"}{"}"}
{"\n"}
{"\n"}<span className="tok-sel">.my-modal</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">m.transition(opacity, transform, slow, ease-out)</span>;
{"\n"}{"}"}</Example.Code>
      </Example>
      <p>
        The mixin collapses all supplied properties into a single{" "}
        <code>transition</code> declaration and injects a{" "}
        <code>@media (prefers-reduced-motion: reduce)</code> block that
        turns the transition off entirely — so every authored component
        is automatically accessibility-aware.
      </p>
      <p>
        Animations themselves are authored with the companion{" "}
        <code>animate</code> mixin from <code>_animations.scss</code>:{" "}
        <code>@include animate(slide-up)</code>,{" "}
        <code>@include animate(spin, $speed: slow, $iteration: infinite, $timing: linear)</code>.
        The mixin validates names at compile time and wires up reduced-motion
        for you.
      </p>

      {/* ============================================================ */}
      <h2 id="reduced-motion">Reduced motion</h2>
      <p>
        The system respects <code>prefers-reduced-motion: reduce</code> at
        three layers: the <code>animate</code> mixin collapses its own
        animation to <code>0.01ms</code>, the <code>transition</code>{" "}
        mixin drops transitions entirely, and{" "}
        <code>_animations.scss</code> ships a global safety net that
        defuses every animation and transition on the page.
      </p>
      <Example>
        <Example.Code><span className="tok-com">{"// scss/_animations.scss"}</span>
{"\n"}<span className="tok-sel">@media</span> <span className="tok-val">(prefers-reduced-motion: reduce)</span> {"{"}
{"\n"}  <span className="tok-sel">*</span>, <span className="tok-sel">*::before</span>, <span className="tok-sel">*::after</span> {"{"}
{"\n"}    <span className="tok-prop">animation-duration</span>: <span className="tok-val">0.01ms !important</span>;
{"\n"}    <span className="tok-prop">animation-iteration-count</span>: <span className="tok-val">1 !important</span>;
{"\n"}    <span className="tok-prop">transition-duration</span>: <span className="tok-val">0.01ms !important</span>;
{"\n"}    <span className="tok-prop">scroll-behavior</span>: <span className="tok-val">auto !important</span>;
{"\n"}  {"}"}
{"\n"}{"}"}</Example.Code>
      </Example>
      <p>
        The <code>!important</code> flag is deliberate — this is the one
        place in the system where it belongs. It guarantees that a host
        app&apos;s custom animation cannot override the user&apos;s OS-level
        motion preference.
      </p>

      {/* ============================================================ */}
      <h2 id="writing-your-own">Writing your own</h2>
      <p>A short checklist for new motion in a consuming app.</p>
      <ul>
        <li>
          <strong>Use the motion tokens.</strong> Type{" "}
          <code>var(--duration-fast)</code> / <code>var(--ease)</code>, never
          raw <code>180ms</code> or a bespoke <code>cubic-bezier</code>.
          Your animation re-skins when a theme swaps the tokens.
        </li>
        <li>
          <strong>Prefer <code>transform</code> and <code>opacity</code>.</strong>{" "}
          Both are GPU-accelerated and do not trigger layout.
          Animating <code>width</code>, <code>height</code>, or{" "}
          <code>top</code> will jank on low-end hardware.
        </li>
        <li>
          <strong>Wrap new keyframes in a reduced-motion check,</strong> or
          reach for the <code>animate</code> / <code>transition</code>{" "}
          mixins that already do it. A user who opts out of motion should
          opt out of <em>your</em> motion too.
        </li>
        <li>
          <strong>Keep the vocabulary small.</strong> If the library&apos;s
          twelve keyframes cover the intent, use them — a consistent motion
          language reads as a single voice, not a grab-bag of easings.
        </li>
      </ul>
    </>
  );
}
