import styles from "./page.module.scss";
import Example from "@/components/Example";

type Swatch = { token: string; notes?: string };

const neutrals: Swatch[] = [
  { token: "--paper" },
  { token: "--paper-raised" },
  { token: "--paper-sunk" },
  { token: "--paper-glass" },
  { token: "--ink" },
  { token: "--ink-soft" },
  { token: "--ink-faint" },
  { token: "--graphite" },
  { token: "--muted" },
  { token: "--hair" },
  { token: "--hair-soft" },
  { token: "--guide" },
  { token: "--guide-soft" },
];

const brand: Swatch[] = [
  { token: "--brand-primary" },
  { token: "--brand-primary-hover" },
  { token: "--ai" },
  { token: "--ai-ink" },
  { token: "--ai-wash" },
  { token: "--shu" },
  { token: "--shu-wash" },
  { token: "--ochre" },
  { token: "--ochre-wash" },
];

const status: Swatch[] = [
  { token: "--success-default" },
  { token: "--success-subtle" },
  { token: "--success-text" },
  { token: "--warning-default" },
  { token: "--warning-subtle" },
  { token: "--warning-text" },
  { token: "--error-default" },
  { token: "--error-subtle" },
  { token: "--error-text" },
  { token: "--info-default" },
  { token: "--info-subtle" },
  { token: "--info-text" },
];

const surfaces: Swatch[] = [
  { token: "--surface-default" },
  { token: "--surface-raised" },
  { token: "--surface-sunk" },
  { token: "--surface-subtle" },
  { token: "--surface-muted" },
  { token: "--surface-emphasis" },
  { token: "--surface-glass" },
];

const spacingTokens = [
  { token: "--space-2xs", label: "2xs" },
  { token: "--space-xs", label: "xs" },
  { token: "--space-sm", label: "sm" },
  { token: "--space-md", label: "md" },
  { token: "--space-lg", label: "lg" },
  { token: "--space-xl", label: "xl" },
];

const radiiTokens = [
  { token: "--radius-sm", label: "sm" },
  { token: "--radius-md", label: "md" },
  { token: "--radius-lg", label: "lg" },
  { token: "--radius-xl", label: "xl" },
  { token: "--radius-full", label: "full" },
];

const shadowTokens = [
  { token: "--shadow-sm", label: "sm" },
  { token: "--shadow-md", label: "md" },
  { token: "--shadow-lg", label: "lg" },
  { token: "--shadow-xl", label: "xl" },
  { token: "--shadow-2xl", label: "2xl" },
];

function Swatches({ items }: { items: Swatch[] }) {
  return (
    <>
      {items.map((s) => (
        <div key={s.token} className={styles.swatch}>
          {/* Chip is purely decorative — the visible token name below names
              it. Marking the chip aria-hidden keeps the accessible name
              clean and avoids axe's aria-prohibited-attr (aria-label on a
              role-less <div>). */}
          <div
            className={styles.swatchChip}
            style={{ background: `var(${s.token})` }}
            aria-hidden="true"
          />
          <span className={styles.swatchLabel}>{s.token}</span>
        </div>
      ))}
    </>
  );
}

export default function TokensPage() {
  return (
    <>
      <h1>Design tokens</h1>
      <p className="lead">
        Every visual decision in the system lives in one file: <code>theme.css</code>.
        Swap that file and the entire UI reskins — buttons, cards, shadows, type,
        spacing — without touching a line of component CSS.
      </p>

      <h2 id="how-tokens-work">How tokens work</h2>
      <p>
        Tokens are plain CSS custom properties declared on <code>:root</code>.
        Components read them with <code>var(--token)</code>, so a single
        stylesheet swap cascades everywhere. No build step is required to
        consume them — drop the file in, and the browser does the rest.
      </p>
      <Example>
        <Example.Code><span className="tok-com">{"/* theme.css — the one file you swap */"}</span>
{"\n"}<span className="tok-sel">:root</span> {"{"}
{"\n"}  <span className="tok-prop">--paper</span>:         <span className="tok-val">#F7F3EA</span>;
{"\n"}  <span className="tok-prop">--ink</span>:           <span className="tok-val">#2A241E</span>;
{"\n"}  <span className="tok-prop">--ai</span>:            <span className="tok-val">#1F3A5F</span>;
{"\n"}  <span className="tok-prop">--radius-md</span>:     <span className="tok-val">3px</span>;
{"\n"}  <span className="tok-prop">--shadow-md</span>:     <span className="tok-val">0 4px 18px rgba(42,36,30,.08)</span>;
{"\n"}{"}"}
{"\n"}
{"\n"}<span className="tok-com">{"/* any consumer — base, component, or your own CSS */"}</span>
{"\n"}<span className="tok-sel">.button</span> {"{"}
{"\n"}  <span className="tok-prop">background</span>: <span className="tok-val">var(--paper-raised)</span>;
{"\n"}  <span className="tok-prop">color</span>:      <span className="tok-val">var(--ink)</span>;
{"\n"}  <span className="tok-prop">border-radius</span>: <span className="tok-val">var(--radius-md)</span>;
{"\n"}  <span className="tok-prop">box-shadow</span>: <span className="tok-val">var(--shadow-md)</span>;
{"\n"}{"}"}</Example.Code>
      </Example>

      <h2 id="palette">Palette</h2>
      <p>
        Color tokens split into three intents: <strong>neutrals</strong> (paper
        &amp; ink), <strong>brand</strong> (indigo, vermilion, ochre), and
        <strong> status</strong> (success / warning / error / info). Every
        swatch below reads live from the active theme — pick a new theme and
        the whole grid reskins.
      </p>

      <Example>
        <Example.Preview>
          <div className={styles.swatchGrid}>
            <h5 className={styles.groupHeading}>Neutrals</h5>
            <Swatches items={neutrals} />
            <h5 className={styles.groupHeading}>Brand</h5>
            <Swatches items={brand} />
            <h5 className={styles.groupHeading}>Status</h5>
            <Swatches items={status} />
            <h5 className={styles.groupHeading}>Surfaces</h5>
            <Swatches items={surfaces} />
          </div>
        </Example.Preview>
        <Example.Code><span className="tok-com">{"/* Consume any color token the same way */"}</span>
{"\n"}<span className="tok-sel">.card</span> {"{"}
{"\n"}  <span className="tok-prop">background</span>: <span className="tok-val">var(--surface-raised)</span>;
{"\n"}  <span className="tok-prop">color</span>:      <span className="tok-val">var(--text-primary)</span>;
{"\n"}  <span className="tok-prop">border</span>:     <span className="tok-val">1px solid var(--border-default)</span>;
{"\n"}{"}"}</Example.Code>
      </Example>

      <h2 id="typography">Typography</h2>
      <p>
        Four font stacks cover the whole system: a chunky display serif, a
        reading serif, a handwritten script for accents, and a mono for code.
        A sans stack anchors the body. Size, weight, and line-height live in
        their own slots so themes can retune the whole rhythm.
      </p>
      <Example>
        <Example.Preview>
          <div className={styles.fontStack}>
            <div className={styles.fontSample}>
              <span className={styles.tokenName}>--font-display</span>
              <span
                className={styles.sampleText}
                style={{ fontFamily: "var(--font-display)", fontSize: "2.25rem", lineHeight: 1.1 }}
              >
                Draft &amp; revise.
              </span>
            </div>
            <div className={styles.fontSample}>
              <span className={styles.tokenName}>--font-serif</span>
              <span
                className={styles.sampleText}
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Reading text sits in a warm serif, patient and honest.
              </span>
            </div>
            <div className={styles.fontSample}>
              <span className={styles.tokenName}>--font-sans / --font-primary</span>
              <span
                className={styles.sampleText}
                style={{ fontFamily: "var(--font-sans)", fontSize: "1.1rem" }}
              >
                The default body font — crisp, quiet, does its job.
              </span>
            </div>
            <div className={styles.fontSample}>
              <span className={styles.tokenName}>--font-script</span>
              <span
                className={styles.sampleText}
                style={{ fontFamily: "var(--font-script)", fontSize: "2.25rem", color: "var(--shu)" }}
              >
                handwritten marginalia
              </span>
            </div>
            <div className={styles.fontSample}>
              <span className={styles.tokenName}>--font-mono</span>
              <span
                className={styles.sampleText}
                style={{ fontFamily: "var(--font-mono)", fontSize: "1rem" }}
              >
                const paper = &apos;#F7F3EA&apos;;
              </span>
            </div>
          </div>
        </Example.Preview>
        <Example.Code><span className="tok-sel">body</span> {"{"}
{"\n"}  <span className="tok-prop">font-family</span>: <span className="tok-val">var(--font-primary)</span>;
{"\n"}  <span className="tok-prop">font-size</span>:   <span className="tok-val">var(--font-size-base)</span>;
{"\n"}  <span className="tok-prop">line-height</span>: <span className="tok-val">var(--line-height-normal)</span>;
{"\n"}{"}"}
{"\n"}
{"\n"}<span className="tok-sel">h1</span> {"{ "}<span className="tok-prop">font-family</span>: <span className="tok-val">var(--font-display)</span>; {"}"}
{"\n"}<span className="tok-sel">code</span> {"{ "}<span className="tok-prop">font-family</span>: <span className="tok-val">var(--font-mono)</span>; {"}"}</Example.Code>
      </Example>

      <h3 id="type-scale">Type scale</h3>
      <p>
        Themes declare <code>--font-size-base</code>, <code>--line-height-normal</code>,
        and <code>--font-weight-medium</code> as the canonical hooks. Scale steps
        are computed from the base so the whole system stays proportional.
      </p>

      <h2 id="spacing">Spacing</h2>
      <p>
        A six-step t-shirt scale drives every gap, padding, and margin in the
        system. Values are declared in <code>rem</code> so they honor the user&apos;s
        root font size.
      </p>
      <Example>
        <Example.Preview>
          <div className={styles.spacingStack}>
            {spacingTokens.map((s) => (
              <div key={s.token} className={styles.spacingRow}>
                <span>{s.token}</span>
                <span
                  className={styles.spacingBar}
                  style={{ width: `var(${s.token})` }}
                />
              </div>
            ))}
          </div>
        </Example.Preview>
        <Example.Code><span className="tok-sel">.stack &gt; * + *</span> {"{"}
{"\n"}  <span className="tok-prop">margin-top</span>: <span className="tok-val">var(--space-md)</span>;
{"\n"}{"}"}
{"\n"}<span className="tok-sel">.card</span> {"{ "}<span className="tok-prop">padding</span>: <span className="tok-val">var(--space-lg)</span>; {"}"}</Example.Code>
      </Example>

      <h2 id="radii">Radii</h2>
      <p>
        Two families ship together: the short <code>--r-*</code> tokens themes
        use natively, and the longer <code>--radius-*</code> aliases the library
        mixins consume. They point at the same values.
      </p>
      <Example>
        <Example.Preview>
          <div className={styles.radiiRow}>
            {radiiTokens.map((r) => (
              <div key={r.token} className={styles.radiiTile}>
                <div
                  className={styles.radiiSquare}
                  style={{ borderRadius: `var(${r.token})` }}
                />
                <span>{r.token}</span>
              </div>
            ))}
          </div>
        </Example.Preview>
        <Example.Code><span className="tok-sel">.button</span> {"{ "}<span className="tok-prop">border-radius</span>: <span className="tok-val">var(--radius-md)</span>; {"}"}
{"\n"}<span className="tok-sel">.avatar</span> {"{ "}<span className="tok-prop">border-radius</span>: <span className="tok-val">var(--radius-full)</span>; {"}"}</Example.Code>
      </Example>

      <h2 id="shadows">Shadows</h2>
      <p>
        Five elevation steps, from a hairline edge to a full modal lift. The
        Sketchbook theme tunes them as ink bleeding through paper; a glass
        theme would swap them for frosted bloom with the same token names.
      </p>
      <Example>
        <Example.Preview>
          <div className={styles.shadowRow}>
            {shadowTokens.map((sh) => (
              <div key={sh.token} className={styles.shadowTile}>
                <div
                  className={styles.shadowCard}
                  style={{ boxShadow: `var(${sh.token})` }}
                />
                <span>{sh.token}</span>
              </div>
            ))}
          </div>
        </Example.Preview>
        <Example.Code><span className="tok-sel">.modal</span> {"{ "}<span className="tok-prop">box-shadow</span>: <span className="tok-val">var(--shadow-2xl)</span>; {"}"}
{"\n"}<span className="tok-sel">.popover</span> {"{ "}<span className="tok-prop">box-shadow</span>: <span className="tok-val">var(--shadow-lg)</span>; {"}"}</Example.Code>
      </Example>

      <h2 id="transitions">Transitions</h2>
      <p>
        Motion is a theme concern — a paper theme uses a soft ease, a neon
        theme might snap. Three durations and one easing cover the system.
      </p>
      <Example>
        <Example.Preview>
          <div className={styles.motionRow}>
            <div className={styles.motionCell}>
              <span>--duration-fast</span>
              <span className="value">180ms</span>
            </div>
            <div className={styles.motionCell}>
              <span>--duration-normal</span>
              <span className="value">240ms</span>
            </div>
            <div className={styles.motionCell}>
              <span>--duration-slow</span>
              <span className="value">380ms</span>
            </div>
            <div className={styles.motionCell}>
              <span>--ease</span>
              <span className="value">cubic-bezier(.33,.66,.33,1)</span>
            </div>
          </div>
        </Example.Preview>
        <Example.Code><span className="tok-sel">.button</span> {"{"}
{"\n"}  <span className="tok-prop">transition</span>: <span className="tok-val">background var(--duration-fast) var(--ease)</span>;
{"\n"}{"}"}</Example.Code>
      </Example>

      <h2 id="the-contract">The contract</h2>
      <p>
        Every theme file must declare the full set of{" "}
        <strong>123 required tokens</strong> — even if a given theme sets some
        of them to neutral values (e.g. <code>--blur-md: none;</code>). That&apos;s
        what guarantees the one-file swap stays lossless: no matter which theme
        you drop in, the base stylesheet and components always find the slots
        they read.
      </p>
      <p>
        The authoritative contract lives in two places: <code>CONTRACT.md</code>{" "}
        (human-readable, grouped and typed) and{" "}
        <code>scripts/theme-contract.json</code> (machine-readable, consumed by
        the validator). Run the validator against any theme file to confirm it
        covers the contract:
      </p>
      <Example>
        <Example.Code><span className="tok-com">{"# validate a theme file against the contract"}</span>
{"\n"}<span className="tok-sel">node</span> scripts/theme-validator.js public/theme.css</Example.Code>
      </Example>
      <p>
        Need a starting point? Download any of the built-in starter themes
        from <a href="/docs/install#download">/docs/install#download</a>, open
        it up, and change the values. Every token you&apos;ll ever need is already
        slotted in.
      </p>
    </>
  );
}
