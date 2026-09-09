import PrintButton from "../print-to-pdf/PrintButton";
import styles from "./page.module.scss";

// The second print example (the invoice is the other): a printable letter that
// shows the header + footer pattern on its own. On screen it's a document; on
// paper a print-only LETTERHEAD appears at the top and a print-only FOOTER pins
// to the bottom of the sheet — both reading the --print-* palette, so they
// match whatever the theme prints as. Zero JS beyond one window.print().
export default function LetterheadExample() {
  return (
    <>
      <div className={styles.intro}>
        <h1>Letterhead &amp; footer</h1>
        <p className="lead">
          A printable letter. On paper a branded <strong>letterhead</strong>{" "}
          appears at the top and a <strong>footer</strong> pins to the bottom of
          the sheet — neither is on screen. Both are print-only markup styled
          with the <code>--print-*</code> palette, so they follow the theme&rsquo;s
          print colours. Print it (or hit the button) and watch them appear.
        </p>
        <p className={styles.actions}>
          <PrintButton />
          <span className={styles.hint}>…or press Ctrl/Cmd + P.</span>
        </p>
      </div>

      <article className={styles.letter}>
        {/* PRINT-ONLY letterhead — the header. */}
        <header className={styles.letterhead}>
          <p className={styles.lhName}>ACME CORPORATION</p>
          <p className={styles.lhAddr}>
            1 Cliffside Drive · Painted Desert Mesa, AZ · acme.example
          </p>
        </header>

        <div className={styles.body}>
          <p className={styles.date}>September 9, 2026</p>
          <p className={styles.to}>
            The Coyote
            <br />
            Route 66 · Painted Desert Mesa, AZ
          </p>

          <p>Dear valued customer,</p>
          <p>
            Thank you for renewing your <strong>Website Protection Plan</strong>.
            Your Anvil Early-Warning Firewall is active, sky monitoring is live,
            and your Rocket-Sled Incident Response retainer is on standby around
            the clock.
          </p>
          <p>
            A gentle reminder: coverage protects your <em>website</em>. Physical
            deliveries — anvils, pianos, and boulders — remain outside the scope
            of this plan and, as ever, subject to gravity.
          </p>
          <p>
            We appreciate your continued business and your remarkable
            persistence.
          </p>
          <p className={styles.signoff}>
            Warm regards,
            <br />
            <span className={styles.sig}>ACME Corporation</span>
            <br />
            <span className={styles.meta}>Threat Mitigation Department</span>
          </p>
        </div>

        {/* PRINT-ONLY footer — pinned to the foot of the sheet. */}
        <footer className={styles.letterFoot}>
          ACME Corporation · Confidential · acme.example
        </footer>
      </article>
    </>
  );
}
