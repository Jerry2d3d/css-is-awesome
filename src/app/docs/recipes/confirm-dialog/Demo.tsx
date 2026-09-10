"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./demo.module.scss";

type Row = { id: string; name: string; tag: string };

const INITIAL_ROWS: Row[] = [
  { id: "1", name: "Q3-report.pdf", tag: "draft" },
  { id: "2", name: "onboarding-notes.md", tag: "internal" },
  { id: "3", name: "logo-final-v2.svg", tag: "reviewed" },
];

export default function ConfirmDialogDemo() {
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
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

  function openDeleteDialog(id: string) {
    setPendingDeleteId(id);
    dialogRef.current?.showModal();
  }

  function confirmDelete() {
    if (pendingDeleteId) {
      const row = rows.find((r) => r.id === pendingDeleteId);
      setRows((rs) => rs.filter((r) => r.id !== pendingDeleteId));
      setStatus(row ? `Deleted "${row.name}".` : "");
    }
    dialogRef.current?.close();
  }

  function removeTag(id: string) {
    const row = rows.find((r) => r.id === id);
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, tag: "" } : r)));
    setOpenPopoverId(null);
    setStatus(row ? `Removed tag from "${row.name}".` : "");
  }

  return (
    <div ref={wrapRef}>
      <ul className={styles.list}>
        {rows.map((row) => (
          <li key={row.id} className={styles.row}>
            <span className={styles.name}>{row.name}</span>

            <span className={styles.rowActions}>
              {row.tag && (
                <span className={styles.tagPopover}>
                  <button
                    type="button"
                    className={styles.tagPill}
                    aria-haspopup="dialog"
                    aria-expanded={openPopoverId === row.id}
                    onClick={() => setOpenPopoverId((cur) => (cur === row.id ? null : row.id))}
                  >
                    {row.tag} ×
                  </button>

                  {openPopoverId === row.id && (
                    <div className={styles.panel} role="dialog" aria-label="Confirm">
                      <span className={styles.icon} aria-hidden="true">
                        ⚠
                      </span>
                      <p className={styles.message}>Remove the &ldquo;{row.tag}&rdquo; tag?</p>
                      <div className={styles.actions}>
                        <button type="button" className={styles.reject} autoFocus onClick={() => setOpenPopoverId(null)}>
                          No
                        </button>
                        <button type="button" className={styles.accept} onClick={() => removeTag(row.id)}>
                          Yes
                        </button>
                      </div>
                    </div>
                  )}
                </span>
              )}

              <button type="button" className={styles.deleteBtn} onClick={() => openDeleteDialog(row.id)}>
                Delete
              </button>
            </span>
          </li>
        ))}
        {rows.length === 0 && <li className={styles.empty}>No files left.</li>}
      </ul>

      <p className={styles.status} role="status" aria-live="polite">
        {status}
      </p>

      <dialog ref={dialogRef} className={styles.confirmDialog} aria-labelledby="confirm-dialog-demo-title">
        <main data-slot="body">
          <span className={styles.icon} aria-hidden="true">
            ⚠
          </span>
          <p id="confirm-dialog-demo-title">Delete this file? This action cannot be undone.</p>
        </main>
        <footer data-slot="footer">
          <button type="button" className={styles.reject} autoFocus onClick={() => dialogRef.current?.close()}>
            Cancel
          </button>
          <button type="button" className={styles.accept} onClick={confirmDelete}>
            Delete
          </button>
        </footer>
      </dialog>
    </div>
  );
}
