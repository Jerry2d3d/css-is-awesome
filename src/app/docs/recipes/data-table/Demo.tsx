"use client";
import { useMemo, useState } from "react";
import styles from "./demo.module.scss";

type Row = { id: string; name: string; role: string; joined: string };
type SortKey = "name" | "role" | "joined";
type Sort = { key: SortKey; direction: "asc" | "desc" } | null;

const ROWS: Row[] = [
  { id: "1", name: "Ada Lovelace", role: "Engineer", joined: "2024-03-01" },
  { id: "2", name: "Grace Hopper", role: "Architect", joined: "2022-11-14" },
  { id: "3", name: "Alan Turing", role: "Researcher", joined: "2023-06-20" },
  { id: "4", name: "Katherine Johnson", role: "Analyst", joined: "2021-02-09" },
  { id: "5", name: "Margaret Hamilton", role: "Engineer", joined: "2020-08-17" },
];

const KEYS: SortKey[] = ["name", "role", "joined"];
const PAGE_SIZE = 3;

export default function DataTableDemo() {
  const [sort, setSort] = useState<Sort>(null);
  const [page, setPage] = useState(1);

  function toggleSort(key: SortKey) {
    setSort((s) =>
      !s || s.key !== key
        ? { key, direction: "asc" }
        : s.direction === "asc"
          ? { key, direction: "desc" }
          : null,
    );
    setPage(1);
  }

  const sorted = useMemo(() => {
    if (!sort) return ROWS;
    const dir = sort.direction === "asc" ? 1 : -1;
    return [...ROWS].sort((a, b) => (a[sort.key] > b[sort.key] ? dir : a[sort.key] < b[sort.key] ? -dir : 0));
  }, [sort]);

  const pageCount = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const ariaSort = (key: SortKey): "none" | "ascending" | "descending" =>
    sort?.key === key ? (sort.direction === "asc" ? "ascending" : "descending") : "none";

  return (
    <>
      <div className={styles.wrap}>
        <table className={styles.table}>
          <caption className={styles.srOnly}>Team members</caption>
          <thead>
            <tr>
              {KEYS.map((key) => (
                <th key={key} scope="col" aria-sort={ariaSort(key)}>
                  <button type="button" className={styles.sortBtn} onClick={() => toggleSort(key)}>
                    {key}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.role}</td>
                <td>{r.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <nav aria-label="Pagination" className={styles.pager}>
        <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
          Previous
        </button>
        <span aria-live="polite">
          Page {page} of {pageCount}
        </span>
        <button type="button" onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page === pageCount}>
          Next
        </button>
      </nav>
    </>
  );
}
