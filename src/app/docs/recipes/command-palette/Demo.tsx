"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./demo.module.scss";

type Command = { id: string; label: string; group: string; hint?: string };

const COMMANDS: Command[] = [
  { id: "docs", label: "Go to Docs", group: "Navigation", hint: "G D" },
  { id: "themes", label: "Go to Themes", group: "Navigation", hint: "G T" },
  { id: "recipes", label: "Open recipes", group: "Navigation", hint: "G R" },
  { id: "dark", label: "Toggle dark mode", group: "Actions" },
  { id: "copy", label: "Copy install command", group: "Actions" },
  { id: "new", label: "New file", group: "Actions", hint: "N" },
  { id: "print", label: "Print this page", group: "Actions", hint: "Ctrl P" },
  { id: "feedback", label: "Send feedback", group: "Actions" },
];

const RECENT_CAP = 2;

export default function CommandPaletteDemo() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const [lastRan, setLastRan] = useState<string | null>(null);

  // Substring filter. Recent commands lead when the query is empty; when
  // filtering, each command appears exactly once, in its home group.
  const visible = useMemo<Command[]>(() => {
    const q = query.trim().toLowerCase();
    if (q) return COMMANDS.filter((c) => c.label.toLowerCase().includes(q));
    const recentCmds = recent
      .map((id) => COMMANDS.find((c) => c.id === id))
      .filter((c): c is Command => Boolean(c))
      .map((c) => ({ ...c, id: `recent-${c.id}`, group: "Recent" }));
    return [...recentCmds, ...COMMANDS];
  }, [query, recent]);

  const groups = useMemo(() => {
    const map = new Map<string, Command[]>();
    for (const c of visible) map.set(c.group, [...(map.get(c.group) ?? []), c]);
    return [...map.entries()];
  }, [visible]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        dialogRef.current?.showModal();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function open() {
    dialogRef.current?.showModal();
  }

  function run(cmd: Command) {
    const baseId = cmd.id.replace(/^recent-/, "");
    dialogRef.current?.close();
    setLastRan(cmd.label);
    setRecent((r) => [baseId, ...r.filter((id) => id !== baseId)].slice(0, RECENT_CAP));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!visible.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % visible.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + visible.length) % visible.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(visible[active]);
    }
  }

  const activeCmd = visible[active];
  const activeId = activeCmd ? `cp-cmd-${activeCmd.id}` : undefined;
  const count = visible.length
    ? `${visible.length} command${visible.length === 1 ? "" : "s"}`
    : "No commands match";

  return (
    <div className={styles.stage}>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="dialog"
        onClick={open}
      >
        Open command palette <kbd>Ctrl</kbd> <kbd>K</kbd>
      </button>

      <p className={styles.status} data-slot="last-ran" role="status">
        {lastRan ? `Last ran: ${lastRan}` : "Nothing run yet."}
      </p>

      <dialog
        ref={dialogRef}
        className={styles.palette}
        data-cia-recipe="command-palette"
        aria-label="Command palette"
        onClose={() => {
          setQuery("");
          setActive(0);
        }}
      >
        <div data-slot="search">
          <input
            data-slot="input"
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="cp-list"
            aria-autocomplete="list"
            aria-activedescendant={activeId}
            aria-describedby="cp-count"
            autoComplete="off"
            spellCheck={false}
            placeholder="Type a command or search…"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
          />
          <span id="cp-count" className={styles.srOnly} aria-live="polite" data-slot="count">
            {count}
          </span>
        </div>

        <ul id="cp-list" data-slot="list" role="listbox" aria-label="Commands">
          {groups.map(([group, items]) => (
            <li key={group} role="group" aria-labelledby={`cp-group-${group}`}>
              <div id={`cp-group-${group}`} data-slot="heading">
                {group}
              </div>
              <ul role="presentation">
                {items.map((c) => {
                  const isActive = activeCmd?.id === c.id;
                  return (
                    <li
                      key={c.id}
                      id={`cp-cmd-${c.id}`}
                      role="option"
                      aria-selected={isActive}
                      data-active={isActive ? "" : undefined}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        run(c);
                      }}
                    >
                      <span>{c.label}</span>
                      {c.hint && <kbd data-slot="hint">{c.hint}</kbd>}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>

        <p data-slot="empty" hidden={visible.length > 0}>
          No commands match.
        </p>
      </dialog>
    </div>
  );
}
