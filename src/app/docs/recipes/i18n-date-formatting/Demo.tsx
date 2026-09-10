"use client";
import { useEffect, useState } from "react";
import styles from "./demo.module.scss";

const LOCALES = [
  { value: "en-US", label: "English (US)" },
  { value: "de-DE", label: "Deutsch (DE)" },
  { value: "ja-JP", label: "日本語 (JP)" },
  { value: "ar-EG", label: "العربية (EG)" },
];

// Fixed reference instant so the demo is deterministic and the "relative
// time" line reads sensibly regardless of when the page is viewed.
const REFERENCE = new Date("2026-09-10T14:30:00Z");
const RELATIVE_TARGET = new Date("2026-09-13T09:00:00Z"); // ~2.75 days later

export default function I18nDateFormattingDemo() {
  const [locale, setLocale] = useState("en-US");
  const [mounted, setMounted] = useState(false);

  // Format only after mount — see the recipe's SSR-mismatch pitfall.
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <p className={styles.loading}>{REFERENCE.toISOString()}</p>;
  }

  const short = new Intl.DateTimeFormat(locale, { dateStyle: "short" }).format(REFERENCE);
  const long = new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(REFERENCE);
  const withTime = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(REFERENCE);
  const tokyo = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Tokyo",
  }).format(REFERENCE);

  const diffDays = Math.round((RELATIVE_TARGET.getTime() - REFERENCE.getTime()) / 86_400_000);
  const relative = new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(diffDays, "day");

  return (
    <div className={styles.wrap}>
      <label className={styles.field}>
        <span>Locale</span>
        <select value={locale} onChange={(e) => setLocale(e.target.value)}>
          {LOCALES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </label>

      <dl className={styles.results}>
        <div>
          <dt>Short</dt>
          <dd>
            <time dateTime={REFERENCE.toISOString()}>{short}</time>
          </dd>
        </div>
        <div>
          <dt>Long</dt>
          <dd>
            <time dateTime={REFERENCE.toISOString()}>{long}</time>
          </dd>
        </div>
        <div>
          <dt>Date + time</dt>
          <dd>
            <time dateTime={REFERENCE.toISOString()}>{withTime}</time>
          </dd>
        </div>
        <div>
          <dt>Same instant, Asia/Tokyo</dt>
          <dd>
            <time dateTime={REFERENCE.toISOString()}>{tokyo}</time>
          </dd>
        </div>
        <div>
          <dt>Relative (vs. Sept 13, 2026 9:00 UTC)</dt>
          <dd className={styles.relative}>{relative}</dd>
        </div>
      </dl>
    </div>
  );
}
