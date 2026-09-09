import Link from "next/link";
import QRCode from "qrcode";
import PrintButton from "./PrintButton";
import styles from "./page.module.scss";

// The invoice's online view — the QR encodes this absolute URL so a
// scan from paper resolves anywhere; the "view online" link uses the
// relative path (works in dev + prod) and prints as the full URL via
// print-base's $link-urls/$link-origin.
const ONLINE_URL = "https://cssisawesome.com/examples/print-to-pdf/online";

// A working invoice — the point is to PRINT it. On screen it's a demo;
// hit Ctrl+P (or the button) and watch cia's print layer take over: the
// site chrome vanishes, a "printed from" stamp appears, every link prints
// its full URL, a QR code appears, and the sheet gets a page number. All
// CSS; the only JS is one window.print() line. The QR SVG is generated at
// BUILD time (server), so nothing runs in the browser and no image is
// fetched.
export default async function PrintToPdfExample() {
  const qrSvg = await QRCode.toString(ONLINE_URL, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
  });
  return (
    <>
      {/* Everything above the invoice is screen-only framing — the whole
          block is print-hidden, so a print gives you JUST the invoice. */}
      <div className={styles.intro}>
        <h1>Print to PDF</h1>
        <p className="lead">
          The browser&apos;s <strong>Print → Save as PDF</strong> is the
          generator; cia is only the styling layer. Print this page (or click
          the button) and compare it to the screen — that difference is the
          whole feature, and it ships zero JavaScript.
        </p>

        <p className={styles.actions}>
          <PrintButton />
          <span className={styles.hint}>…or just press Ctrl/Cmd + P.</span>
        </p>

        <p className={styles.watch}>
          What changes on paper: everything on this page except the invoice
          disappears; a &ldquo;printed from&rdquo; stamp and the full link URLs
          appear; the sheet numbers itself. Read how at{" "}
          <a href="https://cssisawesome.com/docs/recipes/print-spec/">
            the print-spec recipe
          </a>
          .
        </p>
      </div>

      {/* The artifact — the ONLY thing that prints. The classes it
          uses are all cia print helpers behind consumer-named selectors. */}
      <article className={styles.invoice}>
        {/* PRINT-ONLY letterhead — the "letterhead" recipe: markup you add,
            styled with print-only + the --print-* palette, so it matches the
            paper look and appears on paper only. */}
        <header className={styles.letterhead}>
          <p className={styles.letterheadName}>ACME CORPORATION</p>
          <p className={styles.letterheadTag}>
            Threat mitigation for the apex predator since 1949
          </p>
          <p className={styles.letterheadAddr}>
            1 Cliffside Drive · Painted Desert Mesa, AZ · acme.example
          </p>
        </header>

        <header className={styles.invoiceHead}>
          {/* Screen shows the wordmark here; on paper the letterhead above
              carries it, so this half steps aside. */}
          <div className={styles.brandScreen}>
            <p className={styles.brand}>ACME Corporation</p>
            <p className={styles.meta}>Threat mitigation since 1949</p>
          </div>
          <div className={styles.invoiceNo}>
            <p className={styles.metaLabel}>Invoice</p>
            <p className={styles.big}>#RR-1949</p>
            <p className={styles.meta}>Net 30 (or until the next anvil)</p>
          </div>
        </header>

        <div className={styles.billTo}>
          <p className={styles.metaLabel}>Bill to</p>
          <p>The Coyote</p>
          <p className={styles.meta}>Route 66 · Painted Desert Mesa, AZ</p>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.lines}>
            <thead>
              <tr>
                <th>Website protection service</th>
                <th className={styles.num}>Qty</th>
                <th className={styles.num}>Rate</th>
                <th className={styles.num}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Anvil Early-Warning Firewall — 24/7 sky monitoring</td>
                <td className={styles.num}>1</td>
                <td className={styles.num}>$4,900</td>
                <td className={styles.num}>$4,900</td>
              </tr>
              <tr>
                <td>Piano-Drop DDoS Shield (88-key coverage)</td>
                <td className={styles.num}>1</td>
                <td className={styles.num}>$1,288</td>
                <td className={styles.num}>$1,288</td>
              </tr>
              <tr>
                <td>Dark-Web Dynamite Threat Feed — annual</td>
                <td className={styles.num}>1</td>
                <td className={styles.num}>$2,400</td>
                <td className={styles.num}>$2,400</td>
              </tr>
              <tr>
                <td>Boulder Rate-Limiter, self-hosted</td>
                <td className={styles.num}>3</td>
                <td className={styles.num}>$300</td>
                <td className={styles.num}>$900</td>
              </tr>
              <tr>
                <td>Zero-Trust Trapdoor Audit</td>
                <td className={styles.num}>1</td>
                <td className={styles.num}>$1,750</td>
                <td className={styles.num}>$1,750</td>
              </tr>
              <tr>
                <td>Rocket-Sled Incident Response retainer</td>
                <td className={styles.num}>1</td>
                <td className={styles.num}>$3,200</td>
                <td className={styles.num}>$3,200</td>
              </tr>
              <tr>
                <td>Loyalty credit — valued repeat customer</td>
                <td className={styles.num} />
                <td className={styles.num} />
                <td className={styles.num}>&minus;$500</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th colSpan={3}>Total due</th>
                <td className={styles.num}>$13,938</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <p className={styles.terms}>
          Payable on receipt — or before the next delivery lands, whichever
          comes first. Questions? See{" "}
          <Link href="/examples/print-to-pdf/online">the order online</Link>.
        </p>

        {/* PRINT ONLY — the foot of the printed page. */}
        <div className={styles.printFoot}>
          <div className={styles.qrBlock}>
            {/* Build-time SVG; aria-hidden because the caption + adjacent
                link already give the destination to a screen reader. */}
            <div
              className={styles.qr}
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
            <p className={styles.qrCaption}>Scan for the order online</p>
          </div>
          <p className={styles.printStamp}>
            Printed from cssisawesome.com — cia&apos;s print layer turned your
            theme into clean ink on paper.
          </p>
        </div>
      </article>
    </>
  );
}
