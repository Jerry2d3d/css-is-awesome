import Link from "next/link";
import type { Metadata } from "next";
import styles from "../page.module.scss";

// The real destination behind the invoice's "view online" link and the
// printed QR code. A live web view of the same invoice — so the link on
// paper (and the QR) actually go somewhere, in dev and in prod.
export const metadata: Metadata = {
  title: "Invoice #2026-014 — online",
  description: "The online view of the sample invoice from the Print to PDF example.",
};

export default function InvoiceOnlinePage() {
  return (
    <>
      <p className={styles.onlineNote}>
        Online view — you reached this from the invoice&apos;s link or by
        scanning its printed QR code.{" "}
        <Link href="/examples/print-to-pdf">← back to the example</Link>
      </p>

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

        <p className={styles.terms}>Payable within 30 days.</p>
      </article>
    </>
  );
}
