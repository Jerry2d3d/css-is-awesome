import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import styles from "./Pagination.module.scss";

export type PaginationProps = HTMLAttributes<HTMLElement> & {
  current: number;
  total: number;             // total number of pages
  onChange: (page: number) => void;
  siblingCount?: number;     // how many pages to show on each side of current
  showFirstLast?: boolean;
  prevLabel?: string;
  nextLabel?: string;
};

function buildPages(current: number, total: number, siblings: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const showLeftDots = current - siblings > 2;
  const showRightDots = current + siblings < total - 1;
  const left = Math.max(2, current - siblings);
  const right = Math.min(total - 1, current + siblings);
  const pages: (number | "…")[] = [1];
  if (showLeftDots) pages.push("…");
  for (let i = left; i <= right; i++) pages.push(i);
  if (showRightDots) pages.push("…");
  pages.push(total);
  return pages;
}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  (
    {
      current,
      total,
      onChange,
      siblingCount = 1,
      showFirstLast = false,
      prevLabel = "Previous",
      nextLabel = "Next",
      className,
      ...rest
    },
    ref
  ) => {
    const pages = buildPages(current, total, siblingCount);
    const classes = [styles.pagination, className].filter(Boolean).join(" ");

    const go = (p: number) => {
      if (p < 1 || p > total || p === current) return;
      onChange(p);
    };

    return (
      <nav ref={ref} aria-label="Pagination" className={classes} {...rest}>
        <ul className={styles.list}>
          {showFirstLast && (
            <li>
              <button
                type="button"
                className={styles.item}
                disabled={current === 1}
                onClick={() => go(1)}
                aria-label="First page"
              >
                «
              </button>
            </li>
          )}
          <li>
            <button
              type="button"
              className={styles.item}
              disabled={current === 1}
              onClick={() => go(current - 1)}
              aria-label={prevLabel}
            >
              ‹
            </button>
          </li>
          {pages.map((p, i) =>
            p === "…" ? (
              <li key={`dots-${i}`} aria-hidden="true" className={styles.dots}>…</li>
            ) : (
              <li key={p}>
                <button
                  type="button"
                  className={[styles.item, p === current && styles.active].filter(Boolean).join(" ")}
                  aria-current={p === current ? "page" : undefined}
                  onClick={() => go(p)}
                >
                  {p}
                </button>
              </li>
            )
          )}
          <li>
            <button
              type="button"
              className={styles.item}
              disabled={current === total}
              onClick={() => go(current + 1)}
              aria-label={nextLabel}
            >
              ›
            </button>
          </li>
          {showFirstLast && (
            <li>
              <button
                type="button"
                className={styles.item}
                disabled={current === total}
                onClick={() => go(total)}
                aria-label="Last page"
              >
                »
              </button>
            </li>
          )}
        </ul>
      </nav>
    );
  }
);

Pagination.displayName = "Pagination";
export default Pagination;
