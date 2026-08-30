import styles from "./page.module.scss";
import Example from "@/components/Example";
import { LiveSwatchGroup, TypeScaleRow, type Swatch } from "./TokenLive";

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

const actions: Swatch[] = [
  { token: "--action-primary-default" },
  { token: "--action-primary-hover" },
  { token: "--action-primary-active" },
  { token: "--action-primary-wash" },
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

// The numbered scale is the contract-required source of truth; themes declare
// --space-0..--space-9. The t-shirt names are optional aliases the library
// emits as var() references, so they follow whatever the theme sets.
const spacingTokens = [
  { token: "--space-0", label: "0" },
  { token: "--space-1", label: "1" },
  { token: "--space-2", label: "2" },
  { token: "--space-3", label: "3" },
  { token: "--space-4", label: "4" },
  { token: "--space-5", label: "5" },
  { token: "--space-6", label: "6" },
  { token: "--space-7", label: "7" },
  { token: "--space-8", label: "8" },
  { token: "--space-9", label: "9" },
];

const spacingAliases = [
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
  { token: "--r-sm", label: "r-sm" },
  { token: "--r-md", label: "r-md" },
  { token: "--r-lg", label: "r-lg" },
];

const shadowTokens = [
  { token: "--shadow-sm", label: "sm" },
  { token: "--shadow-md", label: "md" },
  { token: "--shadow-lg", label: "lg" },
  { token: "--shadow-xl", label: "xl" },
  { token: "--shadow-2xl", label: "2xl" },
];

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
      <p>
        Each shipped theme emits{" "}
        <code>:root, :root[data-theme=&quot;name&quot;]</code>, so a single file
        dropped in as your <code>theme.css</code> applies with no markup change.
        The library&apos;s own defaults are emitted under{" "}
        <code>:where(:root)</code> at zero specificity, so any theme — or any
        token you set from your own <code>:root</code> — outranks them
        regardless of load order.
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

      <p className={styles.swatchHint}>
        Each swatch shows the token name plus the resolved CSS value. Open the
        ThemePicker (the floating disc, lower-right) and pick a different
        theme — the chips and values rewrite live, no reload required.
      </p>
      <Example>
        <Example.Preview>
          <div className={styles.swatchGrid}>
            <h5 className={styles.groupHeading}>Neutrals</h5>
            <LiveSwatchGroup items={neutrals} />
            <h5 className={styles.groupHeading}>Brand</h5>
            <LiveSwatchGroup items={brand} />
            <h5 className={styles.groupHeading}>Action (semantic primary)</h5>
            <LiveSwatchGroup items={actions} />
            <h5 className={styles.groupHeading}>Status</h5>
            <LiveSwatchGroup items={status} />
            <h5 className={styles.groupHeading}>Surfaces</h5>
            <LiveSwatchGroup items={surfaces} />
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
        Each line below renders at the size resolved from the active theme.
      </p>
      <Example>
        <Example.Preview>
          <div className={styles.typeStack}>
            <TypeScaleRow token="--font-size-base" label="--font-size-base (body)" />
            <TypeScaleRow token="--font-size-base" multiplier={1.25} label="h4 — 1.25× base" />
            <TypeScaleRow token="--font-size-base" multiplier={1.5} label="h3 — 1.5× base" />
            <TypeScaleRow token="--font-size-base" multiplier={2} label="h2 — 2× base" />
            <TypeScaleRow token="--font-size-base" multiplier={2.5} label="h1 — 2.5× base" />
          </div>
        </Example.Preview>
        <Example.Code><span className="tok-sel">h1</span> {"{ "}<span className="tok-prop">font-size</span>: <span className="tok-val">calc(var(--font-size-base) * 2.5)</span>; {"}"}
{"\n"}<span className="tok-sel">h2</span> {"{ "}<span className="tok-prop">font-size</span>: <span className="tok-val">calc(var(--font-size-base) * 2)</span>; {"}"}
{"\n"}<span className="tok-sel">h3</span> {"{ "}<span className="tok-prop">font-size</span>: <span className="tok-val">calc(var(--font-size-base) * 1.5)</span>; {"}"}
{"\n"}<span className="tok-sel">p</span>  {"{ "}<span className="tok-prop">font-size</span>: <span className="tok-val">var(--font-size-base)</span>; {"}"}</Example.Code>
      </Example>

      <h2 id="spacing">Spacing</h2>
      <p>
        Spacing is a theme concern like every other token. The numbered scale{" "}
        <code>--space-0</code> through <code>--space-9</code> is the source of
        truth and is <strong>contract-required</strong> — a theme declares it,
        and re-proportions the whole page. Values are declared in{" "}
        <code>rem</code> so they honor the user&apos;s root font size.
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
{"\n"}  <span className="tok-prop">margin-top</span>: <span className="tok-val">var(--space-4)</span>;
{"\n"}{"}"}
{"\n"}<span className="tok-sel">.card</span> {"{ "}<span className="tok-prop">padding</span>: <span className="tok-val">var(--space-5)</span>; {"}"}</Example.Code>
      </Example>

      <h3 id="spacing-aliases">The t-shirt aliases</h3>
      <p>
        The six t-shirt names are <strong>optional</strong>. The library emits
        them as <code>var()</code> references into the numbered scale — {" "}
        <code>--space-md: var(--space-4)</code> — so they follow whatever the
        theme sets, automatically. A theme never has to declare them.
      </p>
      <p>
        They used to be emitted as <em>independent literals</em>: components call{" "}
        <code>space(4)</code> &rarr; <code>var(--space-4)</code>, but a theme
        could only set the t-shirt names, so the token the theme set and the
        token the component read were different variables. That is why every
        shipped theme used to have byte-identical spacing no matter what it
        declared.
      </p>
      <Example>
        <Example.Preview>
          <div className={styles.spacingStack}>
            {spacingAliases.map((s) => (
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
        <Example.Code><span className="tok-com">{"/* emitted by the library, not by the theme */"}</span>
{"\n"}<span className="tok-prop">--space-xs</span>: <span className="tok-val">var(--space-1)</span>;
{"\n"}<span className="tok-prop">--space-sm</span>: <span className="tok-val">var(--space-2)</span>;
{"\n"}<span className="tok-prop">--space-md</span>: <span className="tok-val">var(--space-4)</span>;
{"\n"}<span className="tok-prop">--space-lg</span>: <span className="tok-val">var(--space-5)</span>;
{"\n"}<span className="tok-prop">--space-xl</span>: <span className="tok-val">var(--space-6)</span>;</Example.Code>
      </Example>

      <h2 id="radii">Radii</h2>
      <p>
        Two families ship together: the short <code>--r-sm/md/lg</code> tokens
        themes use natively, and the longer <code>--radius-sm/md/lg/xl/full</code>{" "}
        aliases the library mixins consume. Both render below at their current
        theme value — flat in a brutalist mood, generously rounded in a soft one.
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
        <strong>127 required tokens</strong> — even if a given theme sets some
        of them to neutral values (e.g. <code>--blur-md: none;</code>). That&apos;s
        what guarantees the one-file swap stays lossless: no matter which theme
        you drop in, the base stylesheet and components always find the slots
        they read.
      </p>
      <p>
        A further <strong>36 optional tokens</strong> (163 in total) are
        recognised but not demanded. These are the per-component radius
        overrides (<code>--btn-radius</code>, <code>--card-radius</code>,{" "}
        <code>--input-radius</code>, <code>--modal-radius</code>,{" "}
        <code>--badge-radius</code>, <code>--tag-radius</code>), the named
        shadow slots, the logo hooks, and the t-shirt spacing aliases. Leave
        them out and each one cascades from the generic scale it belongs to.
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
