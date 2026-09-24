"use client";
import { useId, useRef, useState } from "react";
import styles from "./demo.module.scss";

const OPTIONS = ["Cheese", "Mushrooms", "Olives", "Onions", "Peppers", "Pineapple", "Spinach"];

export default function ComboboxMultiselectDemo() {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<string[]>(["Cheese"]);
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [announce, setAnnounce] = useState("");

  const matches = OPTIONS.filter((o) => o.toLowerCase().includes(text.toLowerCase()));
  const expanded = open && matches.length > 0;

  function toggle(option: string) {
    const has = selected.includes(option);
    const next = has ? selected.filter((s) => s !== option) : [...selected, option];
    setSelected(next);
    setAnnounce(`${option} ${has ? "removed" : "added"}, ${next.length} selected`);
    setText("");
    setActive(-1);
  }

  function remove(option: string) {
    setSelected((s) => s.filter((x) => x !== option));
    setAnnounce(`${option} removed`);
    inputRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (a + 1) % Math.max(matches.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a <= 0 ? matches.length - 1 : a - 1));
    } else if (e.key === "Enter" && expanded && active >= 0) {
      e.preventDefault();
      toggle(matches[active]);
    } else if (e.key === "Backspace" && text === "" && selected.length) {
      remove(selected[selected.length - 1]);
    } else if (e.key === "Escape") {
      if (open) {
        setOpen(false);
        setActive(-1);
      } else {
        setText("");
      }
    }
  }

  return (
    <div className={styles.multiselect} data-cia-recipe="combobox-multiselect">
      <label id={`${id}-label`} htmlFor={`${id}-input`} className={styles.label}>
        Toppings
      </label>

      <div className={styles.control}>
        <div className={styles.field} onClick={() => inputRef.current?.focus()}>
          <ul className={styles.chips} role="list" aria-labelledby={`${id}-label`}>
            {selected.map((s) => (
              <li key={s} className={styles.chip} data-slot="chip">
                {s}
                <button
                  type="button"
                  className={styles.remove}
                  aria-label={`Remove ${s}`}
                  onClick={() => remove(s)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <input
            ref={inputRef}
            id={`${id}-input`}
            className={styles.input}
            type="text"
            role="combobox"
            aria-expanded={expanded}
            aria-controls={`${id}-listbox`}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${id}-opt-${active}` : undefined}
            aria-describedby={`${id}-hint`}
            autoComplete="off"
            spellCheck={false}
            placeholder={selected.length ? "" : "Add a topping…"}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setOpen(true);
              setActive(-1);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            onBlur={() => setOpen(false)}
          />
        </div>

        <ul
          id={`${id}-listbox`}
          className={styles.listbox}
          role="listbox"
          aria-label="Toppings"
          aria-multiselectable="true"
          hidden={!expanded}
        >
          {matches.map((o, i) => (
            <li
              key={o}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={selected.includes(o)}
              data-active={i === active || undefined}
              onMouseDown={(e) => {
                e.preventDefault();
                toggle(o);
              }}
            >
              {o}
            </li>
          ))}
        </ul>
      </div>

      <span id={`${id}-hint`} className={styles.hint}>
        Type to filter. Enter adds, Backspace removes the last one.
      </span>
      <span className={styles.srOnly} aria-live="polite" data-slot="announce">
        {announce}
      </span>

      <p className={styles.result} data-slot="result">
        Selected: {selected.length ? selected.join(", ") : "none"}
      </p>
    </div>
  );
}
