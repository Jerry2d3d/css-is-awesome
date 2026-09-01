"use client";

import { useState, type ReactNode } from "react";
import Example from "@/components/Example";
import styles from "./page.module.scss";

// ----------------------------------------------------------------------------
// Animation card data — sourced 1:1 from scss/_animations.scss
// ----------------------------------------------------------------------------

type AnimKind =
  | "one-shot"   // plays once on hover/focus/click
  | "loop";      // plays continuously

type AnimDef = {
  /** name without the cia- prefix (matches the $_anims map key) */
  id: string;
  /** human-friendly description for the card */
  description: string;
  /** how this animation runs by default in the utility class */
  kind: AnimKind;
  /** speed used by the default utility class */
  speed: "fast" | "normal" | "slow";
  /** which preview shape this card shows */
  preview: "dot" | "shimmer";
  /** which docs-anim-* CSS Module class to attach to the preview element */
  replayKey?:
    | "replayFadeIn"
    | "replayFadeOut"
    | "replaySlideUp"
    | "replaySlideDown"
    | "replaySlideLeft"
    | "replaySlideRight"
    | "replayScaleIn"
    | "replayPop"
    | "replayWiggle";
  loopKey?: "loopPulse" | "loopSpin" | "loopShimmer";
};

const ANIMATIONS: AnimDef[] = [
  {
    id: "fade-in",
    description: "Opacity 0 to 1. The default reveal for content arriving after mount.",
    kind: "one-shot",
    speed: "normal",
    preview: "dot",
    replayKey: "replayFadeIn",
  },
  {
    id: "fade-out",
    description: "Opacity 1 to 0. Pair with unmount to dismiss toasts and overlays.",
    kind: "one-shot",
    speed: "normal",
    preview: "dot",
    replayKey: "replayFadeOut",
  },
  {
    id: "slide-up",
    description: "Rises 8px while fading in. Reach for it on dropdowns and popovers.",
    kind: "one-shot",
    speed: "normal",
    preview: "dot",
    replayKey: "replaySlideUp",
  },
  {
    id: "slide-down",
    description: "Drops 8px while fading in. Header banners and inline alerts.",
    kind: "one-shot",
    speed: "normal",
    preview: "dot",
    replayKey: "replaySlideDown",
  },
  {
    id: "slide-left",
    description: "Slides in from the right while fading in.",
    kind: "one-shot",
    speed: "normal",
    preview: "dot",
    replayKey: "replaySlideLeft",
  },
  {
    id: "slide-right",
    description: "Slides in from the left while fading in.",
    kind: "one-shot",
    speed: "normal",
    preview: "dot",
    replayKey: "replaySlideRight",
  },
  {
    id: "scale-in",
    description: "Grows from 0.96 to 1 while fading in. Modal bodies, tooltip content.",
    kind: "one-shot",
    speed: "normal",
    preview: "dot",
    replayKey: "replayScaleIn",
  },
  {
    id: "pop",
    description: "Brief beat 1 to 1.06 to 1. Notification badges, success ticks.",
    kind: "one-shot",
    speed: "normal",
    preview: "dot",
    replayKey: "replayPop",
  },
  {
    id: "wiggle",
    description: "Rotation jitter. Invalid-input feedback, attention nudges.",
    kind: "one-shot",
    speed: "normal",
    preview: "dot",
    replayKey: "replayWiggle",
  },
  {
    id: "pulse",
    description: "Opacity loop 1 to 0.55 to 1. Live indicators, subtle awaits.",
    kind: "loop",
    speed: "slow",
    preview: "dot",
    loopKey: "loopPulse",
  },
  {
    id: "spin",
    description: "Continuous 360 degree rotation, linear timing. Spinners, refresh.",
    kind: "loop",
    speed: "slow",
    preview: "dot",
    loopKey: "loopSpin",
  },
  {
    id: "shimmer",
    description: "Sweeps a gradient across the element. Skeleton loaders.",
    kind: "loop",
    speed: "slow",
    preview: "shimmer",
    loopKey: "loopShimmer",
  },
];

// ----------------------------------------------------------------------------
// AnimationCard — one tile in the live grid
// ----------------------------------------------------------------------------

function AnimationCard({ anim }: { anim: AnimDef }) {
  const [playKey, setPlayKey] = useState(0);
  const isOneShot = anim.kind === "one-shot";

  // For one-shot animations the click handler bumps a key on the preview
  // element so React remounts it — the simplest, most reliable way to
  // replay a CSS animation from JS without triggering layout reads.
  const handlePlay = () => {
    if (isOneShot) setPlayKey((k) => k + 1);
  };

  const utilityClass = `cia-anim-${anim.id}`;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardName}>cia-{anim.id}</h3>
        <span className={styles.cardSpeed}>{anim.speed}</span>
      </div>

      <p className={styles.cardDesc}>{anim.description}</p>

      <div
        className={styles.stage}
        // The button below is the keyboard-accessible play target; we still
        // want hover-to-play for one-shots, which the CSS Module wires via
        // `.stage:hover .replay*`. Looping previews ignore both — they run
        // continuously regardless.
      >
        {isOneShot && (
          <button
            type="button"
            className={styles.stageTrigger}
            onClick={handlePlay}
            aria-label={`Replay ${anim.id} animation`}
          />
        )}
        <PreviewElement anim={anim} playKey={playKey} />
      </div>

      <pre className={styles.cardCode} aria-label={`Utility class for ${anim.id}`}>
        {`<div class="${utilityClass}">…</div>`}
      </pre>
    </div>
  );
}

function PreviewElement({ anim, playKey }: { anim: AnimDef; playKey: number }) {
  const replayClass = anim.replayKey ? styles[anim.replayKey] : undefined;
  const loopClass = anim.loopKey ? styles[anim.loopKey] : undefined;

  // We attach `.replay` (a marker selector used by the stylesheet's
  // `:hover .replay` rule) plus the per-animation replay class. The
  // `key` forces React to swap the node so click-to-play retriggers
  // the CSS animation cleanly.
  const className = [
    anim.preview === "shimmer" ? styles.shimmerBar : styles.dot,
    replayClass,
    loopClass,
    "replay",
  ]
    .filter(Boolean)
    .join(" ");

  if (anim.preview === "shimmer") {
    return <span key={playKey} className={className} aria-hidden />;
  }

  return (
    <span key={playKey} className={className} aria-hidden>
      {anim.id.split("-")[0]}
    </span>
  );
}

// ----------------------------------------------------------------------------
// Page
// ----------------------------------------------------------------------------

export default function DocsAnimationPage(): ReactNode {
  const oneShots = ANIMATIONS.filter((a) => a.kind === "one-shot");
  const loops = ANIMATIONS.filter((a) => a.kind === "loop");

  return (
    <>
      {/* ============================================================ */}
      {/* Hero                                                         */}
      {/* ============================================================ */}
      <p className={styles.eyebrow}>motion · live</p>
      <h1>Animation</h1>
      <p className="lead">
        Every keyframe in the system reads from <code>--duration-*</code> and{" "}
        <code>--ease</code>, so swapping themes changes the feel — Terminal
        snaps, Glass floats, Press drifts — without a single code change.
      </p>
      <p className={styles.themeNote}>
        Try it now: open the theme dropdown in the header (or the floating
        ThemePicker in the bottom-right) and watch every preview below
        retime in place.
      </p>

      {/* ============================================================ */}
      {/* Live grid                                                    */}
      {/* ============================================================ */}
      <h2 id="live-grid">Live grid</h2>
      <p>
        Every animation in the library, rendered as a card. One-shot
        animations play on hover or click; looping animations run
        continuously so you can read the rhythm. The utility class shown
        on each card is the easiest way to trigger the animation in your
        own markup.
      </p>
      <p className={styles.hint}>
        Hover a card&apos;s preview area, click it, or focus it with the
        keyboard to replay one-shot animations. Loops never stop.
      </p>

      <h3 id="grid-one-shot">One-shot animations</h3>
      <div className={styles.grid} role="list">
        {oneShots.map((anim) => (
          <div role="listitem" key={anim.id}>
            <AnimationCard anim={anim} />
          </div>
        ))}
      </div>

      <h3 id="grid-loops">Looping animations</h3>
      <div className={styles.grid} role="list">
        {loops.map((anim) => (
          <div role="listitem" key={anim.id}>
            <AnimationCard anim={anim} />
          </div>
        ))}
      </div>

      {/* ============================================================ */}
      {/* Motion tokens                                                */}
      {/* ============================================================ */}
      <h2 id="motion-tokens">Motion tokens</h2>
      <p>
        The whole animation system reads from four CSS custom properties.
        Swap the theme and every transition, hover, and keyframe retimes
        without any code change.
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
          <button type="button" className={styles.tokenBtn}>
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
      {/* Utility classes                                              */}
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
      <Example>
        <Example.Code><span className="tok-sel">{"<div"}</span> <span className="tok-prop">class</span>=<span className="tok-val">{'"cia-anim-fade-in"'}</span><span className="tok-sel">{">"}</span>…<span className="tok-sel">{"</div>"}</span>
{"\n"}<span className="tok-sel">{"<div"}</span> <span className="tok-prop">class</span>=<span className="tok-val">{'"cia-anim-slide-up-fast"'}</span><span className="tok-sel">{">"}</span>…<span className="tok-sel">{"</div>"}</span>
{"\n"}<span className="tok-sel">{"<span"}</span> <span className="tok-prop">class</span>=<span className="tok-val">{'"cia-anim-pulse"'}</span><span className="tok-sel">{">"}</span>live<span className="tok-sel">{"</span>"}</span>
{"\n"}<span className="tok-sel">{"<div"}</span> <span className="tok-prop">class</span>=<span className="tok-val">{'"skeleton cia-anim-shimmer"'}</span><span className="tok-sel">{">"}</span><span className="tok-sel">{"</div>"}</span></Example.Code>
      </Example>

      {/* ============================================================ */}
      {/* Hover utilities                                              */}
      {/* ============================================================ */}
      <h2 id="hover-utilities">Hover utilities</h2>
      <p>
        Four hover primitives cover the interactions the system needs most.
        Each is a token-driven micro-transition — no motion values are
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
      <Example>
        <Example.Preview>
          <div className={styles.chipRow}>
            <span className={`${styles.chip} ${styles.hoverLift}`}>lift</span>
            <span className={`${styles.chip} ${styles.hoverPress}`}>press</span>
            <span className={`${styles.chip} ${styles.hoverFade}`}>fade</span>
          </div>
        </Example.Preview>
        <Example.Code><span className="tok-sel">{"<a"}</span> <span className="tok-prop">class</span>=<span className="tok-val">{'"cia-card cia-hover-lift"'}</span><span className="tok-sel">{">"}</span>…<span className="tok-sel">{"</a>"}</span>
{"\n"}<span className="tok-sel">{"<button"}</span> <span className="tok-prop">class</span>=<span className="tok-val">{'"cia-btn cia-hover-press"'}</span><span className="tok-sel">{">"}</span>…<span className="tok-sel">{"</button>"}</span>
{"\n"}<span className="tok-sel">{"<img"}</span> <span className="tok-prop">class</span>=<span className="tok-val">{'"cia-hover-fade"'}</span> <span className="tok-prop">src</span>=<span className="tok-val">{'"/thumb.jpg"'}</span> <span className="tok-prop">alt</span>=<span className="tok-val">{'""'}</span><span className="tok-sel">{">"}</span></Example.Code>
      </Example>

      {/* ============================================================ */}
      {/* Mixin                                                        */}
      {/* ============================================================ */}
      <h2 id="animate-mixin">The animate() mixin</h2>
      <p>
        For authored components, <code>_animations.scss</code> exposes an{" "}
        <code>animate()</code> mixin that wires duration, easing, iteration,
        and reduced-motion in one call.
      </p>
      <Example>
        <Example.Code><span className="tok-com">{"// signature"}</span>
{"\n"}<span className="tok-sel">@mixin</span> <span className="tok-prop">animate</span>($name, $speed: normal, $delay: 0s, $iteration: 1, $fill: both, $timing: var(--ease));
{"\n"}
{"\n"}<span className="tok-com">{"// usage"}</span>
{"\n"}<span className="tok-sel">.toast</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">animate(slide-up)</span>;
{"\n"}{"}"}
{"\n"}
{"\n"}<span className="tok-sel">.spinner</span> {"{"}
{"\n"}  <span className="tok-prop">@include</span> <span className="tok-val">animate(spin, $speed: slow, $iteration: infinite, $timing: linear)</span>;
{"\n"}{"}"}</Example.Code>
      </Example>
      <p>
        The mixin validates animation names at compile time — pass an
        unknown name and the build fails with a list of the legal ones.
      </p>

      {/* ============================================================ */}
      {/* Reduced motion                                               */}
      {/* ============================================================ */}
      <h2 id="reduced-motion">Reduced motion</h2>
      <p>
        Every animation on this page — both the live cards above and the
        utility classes you copy into your own markup — respects{" "}
        <code>prefers-reduced-motion: reduce</code>. Users with that setting
        enabled see the final state of each animation immediately: no
        fade, no slide, no pulse, no spin. Hover-driven transitions are
        suppressed too. Nothing is hidden, nothing is moved off-screen —
        the content is simply rendered without motion.
      </p>
      <p>
        The guarantee comes from three layers in <code>_animations.scss</code>:
        the <code>animate()</code> mixin collapses its own animation to{" "}
        <code>0.01ms</code>, the <code>transition()</code> mixin drops
        transitions entirely, and a global <code>*</code> rule defuses any
        animation or transition declared anywhere in the document.
      </p>
      <Example>
        <Example.Code><span className="tok-com">{"// scss/_animations.scss — global safety net"}</span>
{"\n"}<span className="tok-sel">@media</span> <span className="tok-val">(prefers-reduced-motion: reduce)</span> {"{"}
{"\n"}  <span className="tok-sel">*</span>, <span className="tok-sel">*::before</span>, <span className="tok-sel">*::after</span> {"{"}
{"\n"}    <span className="tok-prop">animation-duration</span>: <span className="tok-val">0.01ms !important</span>;
{"\n"}    <span className="tok-prop">animation-iteration-count</span>: <span className="tok-val">1 !important</span>;
{"\n"}    <span className="tok-prop">transition-duration</span>: <span className="tok-val">0.01ms !important</span>;
{"\n"}    <span className="tok-prop">scroll-behavior</span>: <span className="tok-val">auto !important</span>;
{"\n"}  {"}"}
{"\n"}{"}"}</Example.Code>
      </Example>

      {/* ============================================================ */}
      {/* Writing your own                                             */}
      {/* ============================================================ */}
      <h2 id="writing-your-own">Writing your own</h2>
      <ul>
        <li>
          <strong>Use the motion tokens.</strong> Type{" "}
          <code>var(--duration-fast)</code> / <code>var(--ease)</code>, never
          raw <code>180ms</code> or a bespoke <code>cubic-bezier</code>.
          Your animation re-skins when a theme swaps the tokens.
        </li>
        <li>
          <strong>Prefer <code>transform</code> and <code>opacity</code>.</strong>{" "}
          Both are GPU-accelerated and do not trigger layout. Animating{" "}
          <code>width</code>, <code>height</code>, or <code>top</code> will
          jank on low-end hardware.
        </li>
        <li>
          <strong>Wrap new keyframes in a reduced-motion check,</strong> or
          reach for the <code>animate()</code> / <code>transition()</code>{" "}
          mixins that already do it. A user who opts out of motion should
          opt out of <em>your</em> motion too.
        </li>
        <li>
          <strong>Keep the vocabulary small.</strong> If the library&apos;s
          twelve keyframes cover the intent, use them — a consistent
          motion language reads as a single voice, not a grab-bag of
          easings.
        </li>
      </ul>
    </>
  );
}
