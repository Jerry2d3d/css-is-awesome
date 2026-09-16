"use client";
import { useState } from "react";
import styles from "./demo.module.scss";

const TOTAL = 12;

// pages(6, 12) → [1, "…", 5, 6, 7, "…", 12]. A gap of exactly one page is
// rendered as that page — an ellipsis would be wider than the number it hides.
function pages(current: number, total: number, siblings = 1): (number | "…")[] {
  const start = Math.max(2, current - siblings);
  const end = Math.min(total - 1, current + siblings);
  const out: (number | "…")[] = [1];
  if (start === 3) out.push(2);
  else if (start > 3) out.push("…");
  for (let p = start; p <= end; p++) out.push(p);
  if (end === total - 2) out.push(total - 1);
  else if (end < total - 1) out.push("…");
  if (total > 1) out.push(total);
  return out;
}

export default function PaginationDemo() {
  const [page, setPage] = useState(1);

  function go(next: number) {
    setPage(Math.min(Math.max(1, next), TOTAL));
  }

  const atStart = page === 1;
  const atEnd = page === TOTAL;

  return (
    <div className={styles.wrap} data-testid="pagination-demo">
      <nav aria-label="Pagination" className={styles.pager}>
        <ul data-slot="list">
          <li>
            <button
              type="button"
              data-slot="item"
              aria-label="First page"
              disabled={atStart}
              onClick={() => go(1)}
            >
              «
            </button>
          </li>
          <li data-slot="prev">
            <button
              type="button"
              data-slot="item"
              aria-label="Previous page"
              disabled={atStart}
              onClick={() => go(page - 1)}
            >
              ‹
            </button>
          </li>

          {pages(page, TOTAL).map((p, i) =>
            p === "…" ? (
              <li key={`e${i}`} data-slot="ellipsis" aria-hidden="true">
                …
              </li>
            ) : (
              <li key={p}>
                <button
                  type="button"
                  data-slot="item"
                  aria-current={p === page ? "page" : undefined}
                  onClick={() => go(p)}
                >
                  {p}
                </button>
              </li>
            ),
          )}

          <li data-slot="next">
            <button
              type="button"
              data-slot="item"
              aria-label="Next page"
              disabled={atEnd}
              onClick={() => go(page + 1)}
            >
              ›
            </button>
          </li>
          <li>
            <button
              type="button"
              data-slot="item"
              aria-label="Last page"
              disabled={atEnd}
              onClick={() => go(TOTAL)}
            >
              »
            </button>
          </li>

          {/* Inside the list so flex `order` can seat it between prev and
              next in the mobile-collapsed layout. A live region announces
              from anywhere in the DOM, so this costs nothing on desktop. */}
          <li data-slot="summary" aria-live="polite">
            Page {page} of {TOTAL}
          </li>
        </ul>
      </nav>
      <p className={styles.hint}>
        Narrow the window below 768px to see the pager collapse to
        prev / page count / next.
      </p>
    </div>
  );
}
