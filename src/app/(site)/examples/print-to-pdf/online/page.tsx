import Link from "next/link";
import type { Metadata } from "next";
import styles from "../page.module.scss";

// The real destination behind the invoice's "order online" link and the
// printed QR code. A live web view of the same order — so the link on paper
// (and the QR) actually go somewhere, in dev and in prod.
export const metadata: Metadata = {
  title: "ACME order #RR-1949 — online",
  description: "The online view of the sample order from the Print to PDF example.",
};

export default function InvoiceOnlinePage() {
  return (
    <>
      <p className={styles.onlineNote}>
        Online view — you reached this from the order&apos;s link or by scanning
        its printed QR code.{" "}
        <Link href="/examples/print-to-pdf">← back to the example</Link>
      </p>

      <article className={styles.invoice}>
        <header className={styles.invoiceHead}>
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
          comes first.
        </p>
      </article>
    </>
  );
}
