"use client";
import { useState } from "react";
import styles from "./demo.module.scss";

const LOCALES = [
  { value: "en-US", label: "English (US)", currency: "USD" },
  { value: "de-DE", label: "Deutsch (DE)", currency: "EUR" },
  { value: "ja-JP", label: "日本語 (JP)", currency: "JPY" },
  { value: "ar-EG", label: "العربية (EG)", currency: "EGP" },
];

const SAMPLE = 1234567.891;
const PERCENT_SAMPLE = 0.427;

export default function I18nNumberCurrencyDemo() {
  const [localeIdx, setLocaleIdx] = useState(0);
  const { value: locale, currency } = LOCALES[localeIdx];

  const decimal = new Intl.NumberFormat(locale).format(SAMPLE);
  const percent = new Intl.NumberFormat(locale, { style: "percent" }).format(PERCENT_SAMPLE);
  const currencyStr = new Intl.NumberFormat(locale, { style: "currency", currency }).format(SAMPLE);
  const compact = new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(SAMPLE);
  const signed = new Intl.NumberFormat(locale, { signDisplay: "exceptZero" }).format(1234);
  const accounting = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencySign: "accounting",
  }).format(-1234);

  return (
    <div className={styles.wrap}>
      <label className={styles.field}>
        <span>Locale</span>
        <select value={localeIdx} onChange={(e) => setLocaleIdx(Number(e.target.value))}>
          {LOCALES.map((l, i) => (
            <option key={l.value} value={i}>
              {l.label} — {l.currency}
            </option>
          ))}
        </select>
      </label>

      <dl className={styles.results}>
        <div>
          <dt>Decimal</dt>
          <dd className={styles.price}>{decimal}</dd>
        </div>
        <div>
          <dt>Percent (of 0.427)</dt>
          <dd className={styles.price}>{percent}</dd>
        </div>
        <div>
          <dt>Currency ({currency})</dt>
          <dd className={styles.price}>{currencyStr}</dd>
        </div>
        <div>
          <dt>Compact</dt>
          <dd className={styles.compact}>{compact}</dd>
        </div>
        <div>
          <dt>Signed (1234)</dt>
          <dd className={styles.price}>{signed}</dd>
        </div>
        <div>
          <dt>Accounting (-1234)</dt>
          <dd className={styles.price}>{accounting}</dd>
        </div>
      </dl>
    </div>
  );
}
