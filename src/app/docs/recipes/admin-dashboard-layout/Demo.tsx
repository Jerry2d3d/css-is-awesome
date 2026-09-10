"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./demo.module.scss";

type Row = { id: string; name: string; role: string };
type SortKey = "name" | "role";
type Sort = { key: SortKey; direction: "asc" | "desc" } | null;

const INITIAL_ROWS: Row[] = [
  { id: "1", name: "Ada Lovelace", role: "Engineer" },
  { id: "2", name: "Grace Hopper", role: "Architect" },
  { id: "3", name: "Alan Turing", role: "Researcher" },
];
const KEYS: SortKey[] = ["name", "role"];

export default function AdminDashboardLayoutDemo() {
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [sort, setSort] = useState<Sort>(null);
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openPopoverId) return;
    function onPointerDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpenPopoverId(null);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenPopoverId(null);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openPopoverId]);

  function toggleSort(key: SortKey) {
    setSort((s) => (!s || s.key !== key ? { key, direction: "asc" } : s.direction === "asc" ? { key, direction: "desc" } : null));
  }

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const dir = sort.direction === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => (a[sort.key] > b[sort.key] ? dir : a[sort.key] < b[sort.key] ? -dir : 0));
  }, [rows, sort]);

  const ariaSort = (key: SortKey): "none" | "ascending" | "descending" =>
    sort?.key === key ? (sort.direction === "asc" ? "ascending" : "descending") : "none";

  function removeRow(id: string) {
    const row = rows.find((r) => r.id === id);
    setRows((rs) => rs.filter((r) => r.id !== id));
    setOpenPopoverId(null);
    setStatus(row ? `Removed "${row.name}" from the team.` : "");
  }

  return (
    <div className={styles.adminDashboardLayout} ref={wrapRef}>
      <aside className={styles.sidebar} aria-label="Admin navigation">
        <nav>
          <ul className={styles.navList}>
            <li>
              <a href="#admin-dashboard-demo" aria-current="page">
                Overview
              </a>
            </li>
            <li>
              <a href="#admin-dashboard-demo">Users</a>
            </li>
            <li>
              <a href="#admin-dashboard-demo">Settings</a>
            </li>
          </ul>
        </nav>
      </aside>

      <header className={styles.header}>
        <h2>Team</h2>
        <dl className={styles.stats}>
          <div>
            <dt>Total</dt>
            <dd>{rows.length}</dd>
          </div>
          <div>
            <dt>Roles</dt>
            <dd>{new Set(rows.map((r) => r.role)).size}</dd>
          </div>
        </dl>
      </header>

      <main className={styles.main} id="admin-dashboard-demo">
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
              <th scope="col">
                <span className={styles.srOnly}>Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.role}</td>
                <td className={styles.actionsCell}>
                  <span className={styles.popoverWrap}>
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      aria-haspopup="dialog"
                      aria-expanded={openPopoverId === row.id}
                      onClick={() => setOpenPopoverId((cur) => (cur === row.id ? null : row.id))}
                    >
                      Remove
                    </button>
                    {openPopoverId === row.id && (
                      <div className={styles.panel} role="dialog" aria-label="Confirm">
                        <p className={styles.message}>Remove {row.name}?</p>
                        <div className={styles.panelActions}>
                          <button type="button" className={styles.reject} autoFocus onClick={() => setOpenPopoverId(null)}>
                            No
                          </button>
                          <button type="button" className={styles.accept} onClick={() => removeRow(row.id)}>
                            Yes
                          </button>
                        </div>
                      </div>
                    )}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={3} className={styles.empty}>
                  No team members left.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <p className={styles.status} role="status" aria-live="polite">
          {status}
        </p>
      </main>
    </div>
  );
}
