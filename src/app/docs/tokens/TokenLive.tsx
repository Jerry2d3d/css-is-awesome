"use client";

/**
 * Client helpers for /docs/tokens.
 *
 * Reads live token values via `getComputedStyle(document.documentElement)`
 * after mount, and re-reads whenever the active theme changes (the shared
 * `useThemeAttribute` hook subscribes to <html data-theme> mutations via a
 * MutationObserver).
 *
 * SSR contract: the first render shows the token name only; the resolved
 * value renders once `mounted` flips to true on the client. This keeps the
 * server markup and the first client render byte-identical (no hydration
 * mismatch) and avoids printing whatever `getComputedStyle` returned on the
 * server (always empty in jsdom-less Node).
 */

import { useEffect, useState } from "react";
import { useThemeAttribute } from "@/lib/themeState";
import styles from "./page.module.scss";

export type Swatch = { token: string; notes?: string };

function resolveToken(token: string): string {
  if (typeof window === "undefined") return "";
  const cs = window.getComputedStyle(document.documentElement);
  return cs.getPropertyValue(token).trim();
}

function useTokenValue(token: string): string {
  const theme = useThemeAttribute();
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    // Read on mount, and again every time the active theme attribute flips.
    setValue(resolveToken(token));
  }, [token, theme]);

  return value;
}

export function LiveSwatch({ token }: { token: string }) {
  const value = useTokenValue(token);

  return (
    <div className={styles.swatch}>
      <div
        className={styles.swatchChip}
        style={{ background: `var(${token})` }}
        aria-hidden="true"
      />
      <span className={styles.swatchLabel}>{token}</span>
      {value ? (
        <span className={styles.swatchValue} aria-label={`Resolved value: ${value}`}>
          {value}
        </span>
      ) : null}
    </div>
  );
}

export function LiveSwatchGroup({ items }: { items: Swatch[] }) {
  return (
    <>
      {items.map((s) => (
        <LiveSwatch key={s.token} token={s.token} />
      ))}
    </>
  );
}

/** A single type-scale row: token name + resolved value + sample line at the
 *  font-size that token resolves to. Honours theme swap live.
 *
 *  Today only `--font-size-base` is contract-required, so the page derives
 *  scale steps with a multiplier (e.g. h1 = 2.5×). When themes start shipping
 *  per-step tokens (`--font-size-lg`, etc.) a row can pass that token name
 *  directly and `multiplier` becomes optional flavour text. */
export function TypeScaleRow({
  token,
  multiplier,
  label,
}: {
  token: string;
  multiplier?: number;
  label?: string;
}) {
  const value = useTokenValue(token);
  const renderedSize = multiplier
    ? `calc(var(${token}) * ${multiplier})`
    : `var(${token})`;
  const computedLabel =
    label ?? (multiplier ? `${multiplier}× ${token}` : token);
  const valueDisplay = value
    ? multiplier
      ? `${value} × ${multiplier}`
      : value
    : "";

  return (
    <div className={styles.typeRow}>
      <div className={styles.typeMeta}>
        <span className={styles.tokenName}>{computedLabel}</span>
        {valueDisplay ? (
          <span className={styles.typeValue}>{valueDisplay}</span>
        ) : null}
      </div>
      <span className={styles.typeSample} style={{ fontSize: renderedSize }}>
        The quick brown fox jumps over the lazy dog
      </span>
    </div>
  );
}
