"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./demo.module.scss";

const monthFmt = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function buildMonth(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function sameDay(a: Date, b: Date | null): boolean {
  return !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function DatePickerDemo() {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(() => new Date(2026, 8, 1)); // September 2026
  const [selected, setSelected] = useState<Date | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const days = buildMonth(cursor.getFullYear(), cursor.getMonth());

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <label className={styles.label} htmlFor="demo-datepicker-trigger">
        Appointment date
      </label>
      <button
        id="demo-datepicker-trigger"
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {selected ? selected.toLocaleDateString() : "Select a date"}
      </button>

      {open && (
        <div className={styles.panel} role="dialog" aria-label="Choose date">
          <div className={styles.header}>
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            >
              &lsaquo;
            </button>
            <span aria-live="polite">{monthFmt.format(cursor)}</span>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            >
              &rsaquo;
            </button>
          </div>
          <div className={styles.grid} role="grid" aria-labelledby="demo-datepicker-trigger">
            <div role="row" style={{ display: "contents" }}>
              {WEEKDAYS.map((w, i) => (
                <span key={i} className={styles.weekday} role="columnheader">
                  {w}
                </span>
              ))}
            </div>
            {days.map((d) => (
              <button
                key={d.toISOString()}
                type="button"
                role="gridcell"
                className={styles.day}
                data-outside-month={d.getMonth() !== cursor.getMonth() ? "true" : undefined}
                aria-selected={sameDay(d, selected)}
                onClick={() => {
                  setSelected(d);
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
              >
                {d.getDate()}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
