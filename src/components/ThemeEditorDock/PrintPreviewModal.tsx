"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./PrintPreviewModal.module.scss";

// The print-base defaults — the palette every theme inherits on paper.
const DEFAULTS = { ink: "#000000", paper: "#ffffff", line: "#999999", muted: "#666666" };

type Props = { open: boolean; onClose: () => void; family: string };

// A paper-preview modal for the print theme. The dock edits the live page, but
// --print-* tokens only act inside @media print, so they'd show nothing on
// screen. This SIMULATES the print look: a .paper panel rebinds the theme's
// colour tokens onto the --print-* palette (exactly as print-base does in
// print), so editing a colour re-inks the preview live. "Copy print block"
// exports the @media print block to paste into a theme.
export default function PrintPreviewModal({ open, onClose, family }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [ink, setInk] = useState(DEFAULTS.ink);
  const [paper, setPaper] = useState(DEFAULTS.paper);
  const [line, setLine] = useState(DEFAULTS.line);
  const [muted, setMuted] = useState(DEFAULTS.muted);
  const [letterhead, setLetterhead] = useState(true);
  const [copied, setCopied] = useState(false);

  // Drive the native <dialog> (free focus trap + Esc) from the `open` prop.
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    else if (!open && d.open) d.close();
  }, [open]);

  const paperVars = {
    "--print-ink": ink,
    "--print-paper": paper,
    "--print-line": line,
    "--print-muted": muted,
  } as CSSProperties;

  function reset() {
    setInk(DEFAULTS.ink);
    setPaper(DEFAULTS.paper);
    setLine(DEFAULTS.line);
    setMuted(DEFAULTS.muted);
  }

  function block() {
    return (
      `@media print {\n` +
      `  :root[data-theme="${family}"] {\n` +
      `    --print-ink: ${ink};\n` +
      `    --print-paper: ${paper};\n` +
      `    --print-line: ${line};\n` +
      `    --print-muted: ${muted};\n` +
      `  }\n}\n`
    );
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(block());
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — no-op */
    }
  }

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      onClose={onClose}
      onClick={(e) => {
        // Click on the backdrop (the dialog element itself) closes.
        if (e.target === ref.current) onClose();
      }}
      aria-label="Print preview"
    >
      <div className={styles.wrap}>
        <header className={styles.head}>
          <h2 className={styles.title}>Print preview</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close print preview">
            ×
          </button>
        </header>
        <p className={styles.sub}>
          How <strong>{family}</strong> prints. Edit the paper palette, then copy the block into your
          theme&apos;s <code>@media print</code> to make it permanent.
        </p>

        <div className={styles.grid}>
          <div className={styles.controls}>
            <Ctrl label="Ink" value={ink} onChange={setInk} />
            <Ctrl label="Paper" value={paper} onChange={setPaper} />
            <Ctrl label="Rules" value={line} onChange={setLine} />
            <Ctrl label="Muted" value={muted} onChange={setMuted} />
            <label className={styles.toggle}>
              <input type="checkbox" checked={letterhead} onChange={(e) => setLetterhead(e.target.checked)} />
              Show letterhead
            </label>
            <div className={styles.ctrlBtns}>
              <button type="button" className={styles.btn} onClick={reset}>
                Reset
              </button>
              <button type="button" className={styles.btn} onClick={copy}>
                {copied ? "Copied ✓" : "Copy print block"}
              </button>
            </div>
          </div>

          <div className={styles.paperWrap}>
            {/* The simulated sheet — .paper rebinds the theme tokens onto the
                --print-* palette, so this renders like paper on screen. */}
            <div className={styles.paper} style={paperVars}>
              {letterhead && (
                <header className={styles.letterhead}>
                  <p className={styles.lhName}>ACME CORPORATION</p>
                  <p className={styles.lhAddr}>1 Cliffside Drive · Painted Desert Mesa · acme.example</p>
                </header>
              )}
              <h3 className={styles.h}>Invoice #RR-1949</h3>
              <p className={styles.p}>Billed to The Coyote — website protection services.</p>
              <table className={styles.table}>
                <tbody>
                  <tr>
                    <td>Anvil Early-Warning Firewall</td>
                    <td>$4,900</td>
                  </tr>
                  <tr>
                    <td>Piano-Drop DDoS Shield</td>
                    <td>$1,288</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <th>Total due</th>
                    <th>$13,938</th>
                  </tr>
                </tfoot>
              </table>
              <pre className={styles.code}>
                <code>{`@media print { --print-ink: ${ink} }`}</code>
              </pre>
              <button type="button" className={styles.sampleBtn}>
                Sample button
              </button>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}

function Ctrl({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className={styles.ctrl}>
      <span className={styles.ctrlLabel}>{label}</span>
      <span className={styles.ctrlInputs}>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} aria-label={`${label} colour`} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          aria-label={`${label} value`}
        />
      </span>
    </label>
  );
}
