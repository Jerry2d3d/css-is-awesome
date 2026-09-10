"use client";
import { useState } from "react";
import styles from "./demo.module.scss";

type PluralCategory = "zero" | "one" | "two" | "few" | "many" | "other";
type Forms = Partial<Record<PluralCategory, string>> & { other: string };

const LOCALES: { value: string; label: string; forms: Forms }[] = [
  {
    value: "en-US",
    label: "English (US)",
    forms: { one: "{count} item", other: "{count} items" },
  },
  {
    value: "pl-PL",
    label: "Polski (PL)",
    forms: {
      one: "{count} przedmiot",
      few: "{count} przedmioty",
      many: "{count} przedmiotów",
      other: "{count} przedmiotu",
    },
  },
  {
    value: "ar-EG",
    label: "العربية (EG)",
    forms: {
      zero: "لا عناصر",
      one: "عنصر واحد",
      two: "عنصران",
      few: "{count} عناصر",
      many: "{count} عنصرًا",
      other: "{count} عنصر",
    },
  },
];

function pluralize(count: number, locale: string, forms: Forms): string {
  const category = new Intl.PluralRules(locale).select(count);
  const template = forms[category] ?? forms.other;
  return template.replace("{count}", new Intl.NumberFormat(locale).format(count));
}

export default function I18nPluralizationDemo() {
  const [localeIdx, setLocaleIdx] = useState(0);
  const [count, setCount] = useState(1);
  const { value: locale, forms } = LOCALES[localeIdx];

  const category = new Intl.PluralRules(locale).select(count);
  const text = pluralize(count, locale, forms);

  return (
    <div className={styles.wrap}>
      <div className={styles.controls}>
        <label className={styles.field}>
          <span>Locale</span>
          <select value={localeIdx} onChange={(e) => setLocaleIdx(Number(e.target.value))}>
            {LOCALES.map((l, i) => (
              <option key={l.value} value={i}>
                {l.label}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span>Count: {count}</span>
          <input
            type="range"
            min={0}
            max={11}
            step={1}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            aria-label="Count"
          />
        </label>
      </div>

      <p className={styles.result} aria-live="polite">
        {text}
      </p>
      <p className={styles.category}>
        Intl.PluralRules category: <code>{category}</code>
      </p>
    </div>
  );
}
