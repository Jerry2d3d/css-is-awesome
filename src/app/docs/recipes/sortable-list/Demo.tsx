"use client";
import { useRef, useState } from "react";
import styles from "./demo.module.scss";

type Item = { id: string; label: string };

const INITIAL: Item[] = [
  { id: "a", label: "Write the launch post" },
  { id: "b", label: "Record the demo video" },
  { id: "c", label: "Update the changelog" },
  { id: "d", label: "Tag the release" },
  { id: "e", label: "Ship it" },
];

type DropTarget = { id: string; pos: "before" | "after" };

export default function SortableListDemo() {
  const [items, setItems] = useState<Item[]>(INITIAL);
  const [grabbed, setGrabbed] = useState<string | null>(null);
  const [drop, setDrop] = useState<DropTarget | null>(null);
  const [announce, setAnnounce] = useState("");
  const [lastEvent, setLastEvent] = useState("");
  const snapshot = useRef<Item[] | null>(null);
  const dragIndex = useRef<number | null>(null);
  // Set on pointerdown on a handle; dragstart fires on the <li>, so this is
  // how we know the drag began from the grip and not from label text.
  const armed = useRef(false);
  const listRef = useRef<HTMLUListElement>(null);

  function say(text: string) {
    setLastEvent(text);
    // Clear first so an identical repeat is still announced.
    setAnnounce("");
    requestAnimationFrame(() => setAnnounce(text));
  }

  function move(current: Item[], from: number, to: number): Item[] {
    if (from === to || to < 0 || to >= current.length) return current;
    const next = [...current];
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    setItems(next);
    return next;
  }

  // ── keyboard ──────────────────────────────────────────────────────────────
  function onHandleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const item = items[index];
    const held = grabbed === item.id;

    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (!held) {
        snapshot.current = items;
        setGrabbed(item.id);
        say(`Grabbed ${item.label}, position ${index + 1} of ${items.length}.`);
      } else {
        setGrabbed(null);
        snapshot.current = null;
        say(`Dropped ${item.label} at position ${index + 1} of ${items.length}.`);
      }
      return;
    }

    if (e.key === "Escape" && held) {
      e.preventDefault();
      if (snapshot.current) setItems(snapshot.current);
      snapshot.current = null;
      setGrabbed(null);
      say("Reorder cancelled.");
      return;
    }

    if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "Home" || e.key === "End") {
      e.preventDefault();
      const to =
        e.key === "ArrowUp" ? index - 1
        : e.key === "ArrowDown" ? index + 1
        : e.key === "Home" ? 0
        : items.length - 1;
      if (held) {
        const next = move(items, index, to);
        const at = next.findIndex((i) => i.id === item.id);
        say(`${item.label} moved to position ${at + 1} of ${next.length}.`);
      } else {
        const handles = listRef.current?.querySelectorAll<HTMLButtonElement>('[data-slot="handle"]');
        handles?.[Math.max(0, Math.min(to, items.length - 1))]?.focus();
      }
      return;
    }

    if (e.key === "Tab" && held) {
      setGrabbed(null);
      snapshot.current = null;
      say(`Dropped ${item.label} at position ${index + 1} of ${items.length}.`);
    }
  }

  // ── pointer (native HTML5 drag-and-drop) ──────────────────────────────────
  function onDragStart(e: React.DragEvent<HTMLLIElement>, index: number) {
    if (!armed.current) {
      e.preventDefault();
      return;
    }
    dragIndex.current = index;
    e.dataTransfer.setData("text/plain", items[index].id);
    e.dataTransfer.effectAllowed = "move";
    setGrabbed(items[index].id);
  }

  function onDragOver(e: React.DragEvent<HTMLLIElement>, id: string) {
    if (dragIndex.current === null) return;
    e.preventDefault();
    if (items[dragIndex.current].id === id) return;
    const r = e.currentTarget.getBoundingClientRect();
    const pos: DropTarget["pos"] = e.clientY < r.top + r.height / 2 ? "before" : "after";
    setDrop((d) => (d && d.id === id && d.pos === pos ? d : { id, pos }));
  }

  function onDrop(e: React.DragEvent<HTMLLIElement>, index: number) {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null || !drop) {
      clearDrag();
      return;
    }
    let to = drop.pos === "before" ? index : index + 1;
    if (from < to) to -= 1;
    const label = items[from].label;
    const next = move(items, from, to);
    say(`${label} moved to position ${to + 1} of ${next.length}.`);
    clearDrag();
  }

  function clearDrag() {
    dragIndex.current = null;
    armed.current = false;
    setGrabbed(null);
    setDrop(null);
  }

  function reset() {
    setItems(INITIAL);
    setGrabbed(null);
    setDrop(null);
    snapshot.current = null;
    say("Order reset.");
  }

  return (
    <div className={styles.demo}>
      <ul
        ref={listRef}
        className={styles.sortable}
        data-cia-recipe="sortable-list"
        role="list"
        aria-label="Release checklist order"
      >
        {items.map((item, index) => (
          <li
            key={item.id}
            data-slot="item"
            data-id={item.id}
            draggable
            data-grabbed={grabbed === item.id ? "" : undefined}
            data-drop-position={drop?.id === item.id ? drop.pos : undefined}
            onDragStart={(e) => onDragStart(e, index)}
            onDragOver={(e) => onDragOver(e, item.id)}
            onDragLeave={() => setDrop((d) => (d?.id === item.id ? null : d))}
            onDrop={(e) => onDrop(e, index)}
            onDragEnd={clearDrag}
          >
            <button
              type="button"
              data-slot="handle"
              aria-label={`Reorder: ${item.label}`}
              aria-describedby="sortable-list-demo-hint"
              aria-pressed={grabbed === item.id}
              onKeyDown={(e) => onHandleKeyDown(e, index)}
              onPointerDown={() => {
                armed.current = true;
              }}
              onPointerUp={() => {
                armed.current = false;
              }}
            >
              <span aria-hidden="true">⠿</span>
            </button>
            <span data-slot="position" aria-hidden="true">
              {index + 1}
            </span>
            <span data-slot="label">{item.label}</span>
          </li>
        ))}
      </ul>

      <p id="sortable-list-demo-hint" hidden>
        Press Space to grab, arrow keys to move, Space to drop, Escape to cancel.
      </p>

      <div className={styles.footer}>
        <p className={styles.status} data-slot="last-event">
          {lastEvent || "No moves yet."}
        </p>
        <button type="button" className={styles.resetBtn} onClick={reset}>
          Reset order
        </button>
      </div>

      <div data-slot="announce" aria-live="assertive" aria-atomic="true" className={styles.srOnly}>
        {announce}
      </div>
    </div>
  );
}
