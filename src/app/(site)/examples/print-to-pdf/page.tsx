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
        <header className={styles.invoiceHead}>
          <div>
            <p className={styles.brand}>Acme Studio</p>
            <p className={styles.meta}>123 Sketchbook Lane · Portland, OR</p>
          </div>
          <div className={styles.invoiceNo}>
            <p className={styles.metaLabel}>Invoice</p>
            <p className={styles.big}>#2026-014</p>
            <p className={styles.meta}>Due 30 Sep 2026</p>
          </div>
        </header>

        <div className={styles.billTo}>
          <p className={styles.metaLabel}>Bill to</p>
          <p>Beacon Coffee Co.</p>
          <p className={styles.meta}>hello@beacon.example</p>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.lines}>
            <thead>
              <tr>
                <th>Item</th>
                <th className={styles.num}>Qty</th>
                <th className={styles.num}>Rate</th>
                <th className={styles.num}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Brand identity — logo &amp; type system</td>
                <td className={styles.num}>1</td>
                <td className={styles.num}>$4,000</td>
                <td className={styles.num}>$4,000</td>
              </tr>
              <tr>
                <td>Web design — marketing site</td>
                <td className={styles.num}>1</td>
                <td className={styles.num}>$6,500</td>
                <td className={styles.num}>$6,500</td>
              </tr>
              <tr>
                <td>Design tokens &amp; handoff</td>
                <td className={styles.num}>12 hrs</td>
                <td className={styles.num}>$150</td>
                <td className={styles.num}>$1,800</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th colSpan={3}>Total</th>
                <td className={styles.num}>$12,300</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <p className={styles.terms}>
          Payable within 30 days. Questions? See{" "}
          <Link href="/examples/print-to-pdf/online">the invoice online</Link>.
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
            <p className={styles.qrCaption}>Scan for the invoice online</p>
          </div>
          <p className={styles.printStamp}>
            Printed from cssisawesome.com — the theme you were viewing is the
            theme this prints in.
          </p>
        </div>
      </article>
    </>
  );
}
