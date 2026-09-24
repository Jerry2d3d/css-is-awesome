"use client";
import { useEffect, useId, useRef, useState } from "react";
import styles from "./demo.module.scss";

type Item = { id: string; file: File; error?: string; progress: number };

const ACCEPT = "image/*,.pdf";
const MAX_FILES = 3;
const MAX_BYTES = 2 * 1024 * 1024;

function fileId(f: File) {
  return `${f.name}-${f.size}-${f.lastModified}`;
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function matchesAccept(f: File, accept: string) {
  const name = f.name.toLowerCase();
  const type = f.type.toLowerCase();
  return accept
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .some((t) => {
      if (t.startsWith(".")) return name.endsWith(t);
      if (t.endsWith("/*")) return type.startsWith(t.slice(0, -1));
      return type === t;
    });
}

function validate(f: File): string | undefined {
  if (!matchesAccept(f, ACCEPT)) return "File type not allowed";
  if (f.size > MAX_BYTES) return `File exceeds ${formatBytes(MAX_BYTES)}`;
  return undefined;
}

export default function FileUploadDemo() {
  const id = useId();
  const [items, setItems] = useState<Item[]>([]);
  const [zoneError, setZoneError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const dragDepth = useRef(0);

  // Simulated upload: every valid item below 100% advances by 20 every
  // 300 ms. One interval for the whole list, cleared on unmount (and whenever
  // nothing is left to advance) so the demo never leaks a timer.
  const pending = items.some((i) => !i.error && i.progress < 100);
  useEffect(() => {
    if (!pending) return;
    const timer = setInterval(() => {
      setItems((prev) =>
        prev.map((i) =>
          i.error || i.progress >= 100 ? i : { ...i, progress: Math.min(100, i.progress + 20) },
        ),
      );
    }, 300);
    return () => clearInterval(timer);
  }, [pending]);

  function addFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    const incoming = Array.from(list);
    setZoneError("");
    setItems((prev) => {
      const next = [...prev];
      const seen = new Set(prev.map((i) => i.id));
      for (const file of incoming) {
        const fid = fileId(file);
        if (seen.has(fid)) continue;
        if (next.length >= MAX_FILES) {
          setZoneError(`You can upload at most ${MAX_FILES} files`);
          break;
        }
        seen.add(fid);
        next.push({ id: fid, file, error: validate(file), progress: 0 });
      }
      return next;
    });
  }

  function remove(itemId: string) {
    setZoneError("");
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }

  const count = items.length;
  const status = count === 0 ? "" : `${count} file${count === 1 ? "" : "s"} selected`;

  return (
    <div className={styles.upload} data-cia-recipe="file-upload">
      <input
        id={id}
        type="file"
        className={styles.input}
        accept={ACCEPT}
        multiple
        aria-describedby={`${id}-hint`}
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <label
        htmlFor={id}
        className={styles.zone}
        data-slot="zone"
        data-drag-over={dragOver || undefined}
        onDragEnter={(e) => {
          e.preventDefault();
          dragDepth.current++;
          setDragOver(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => {
          dragDepth.current = Math.max(0, dragDepth.current - 1);
          if (dragDepth.current === 0) setDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          dragDepth.current = 0;
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
      >
        <span className={styles.zoneTitle}>Drag &amp; drop files here</span>
        <span className={styles.zoneAction}>or browse</span>
        <span id={`${id}-hint`} className={styles.zoneHint}>
          Images or PDF · up to {MAX_FILES} files · {formatBytes(MAX_BYTES)} each
        </span>
      </label>

      <p className={styles.status} data-slot="status" aria-live="polite">
        {status}
      </p>
      {zoneError && (
        <p className={styles.zoneError} data-slot="error" role="alert">
          {zoneError}
        </p>
      )}

      {count > 0 && (
        <ul className={styles.list} data-slot="list" aria-label="Selected files">
          {items.map((item) => (
            <li
              key={item.id}
              className={styles.item}
              data-slot="item"
              data-error={item.error ? "true" : undefined}
            >
              <span className={styles.name} data-slot="name">
                {item.file.name}
              </span>
              <span className={styles.size}>{formatBytes(item.file.size)}</span>
              <button
                type="button"
                className={styles.remove}
                aria-label={`Remove ${item.file.name}`}
                onClick={() => remove(item.id)}
              >
                <span aria-hidden="true">×</span>
              </button>
              {item.error ? (
                <span className={styles.itemError} data-slot="item-error">
                  {item.error}
                </span>
              ) : (
                <div
                  className={styles.progress}
                  data-slot="progress"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={item.progress}
                  aria-label={`Uploading ${item.file.name}`}
                >
                  <div data-slot="fill" style={{ inlineSize: `${item.progress}%` }} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
