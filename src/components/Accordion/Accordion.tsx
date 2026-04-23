"use client";
import { createContext, forwardRef, useContext, useId, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Accordion.module.scss";

type Mode = "single" | "multi";

type AccordionCtx = {
  mode: Mode;
  open: string[];
  toggle: (value: string) => void;
};
const AccordionContext = createContext<AccordionCtx | null>(null);
function useAcc(label: string) {
  const c = useContext(AccordionContext);
  if (!c) throw new Error(`${label} must be inside <Accordion>`);
  return c;
}

type ItemCtx = { value: string; baseId: string };
const ItemContext = createContext<ItemCtx | null>(null);
function useItem(label: string) {
  const c = useContext(ItemContext);
  if (!c) throw new Error(`${label} must be inside <Accordion.Item>`);
  return c;
}

export type AccordionProps = HTMLAttributes<HTMLDivElement> & {
  mode?: Mode;
  defaultOpen?: string[];
  value?: string[];
  onValueChange?: (value: string[]) => void;
  children: ReactNode;
};

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  ({ mode = "single", defaultOpen = [], value, onValueChange, className, children, ...rest }, ref) => {
    const [internal, setInternal] = useState<string[]>(defaultOpen);
    const controlled = value !== undefined;
    const open = controlled ? value! : internal;

    const toggle = (v: string) => {
      let next: string[];
      if (open.includes(v)) {
        next = open.filter((x) => x !== v);
      } else {
        next = mode === "single" ? [v] : [...open, v];
      }
      if (!controlled) setInternal(next);
      onValueChange?.(next);
    };

    return (
      <AccordionContext.Provider value={{ mode, open, toggle }}>
        <div
          ref={ref}
          data-accordion
          className={[styles.accordion, className].filter(Boolean).join(" ")}
          {...rest}
        >
          {children}
        </div>
      </AccordionContext.Provider>
    );
  }
);
Accordion.displayName = "Accordion";

export type AccordionItemProps = HTMLAttributes<HTMLDivElement> & { value: string };
const Item = forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ value, className, children, ...rest }, ref) => {
    const baseId = useId();
    return (
      <ItemContext.Provider value={{ value, baseId }}>
        <div ref={ref} className={[styles.item, className].filter(Boolean).join(" ")} {...rest}>
          {children}
        </div>
      </ItemContext.Provider>
    );
  }
);
Item.displayName = "Accordion.Item";

const Trigger = forwardRef<HTMLButtonElement, HTMLAttributes<HTMLButtonElement>>(
  ({ className, children, onKeyDown, ...rest }, ref) => {
    const { open, toggle } = useAcc("<Accordion.Trigger>");
    const { value, baseId } = useItem("<Accordion.Trigger>");
    const expanded = open.includes(value);
    const triggerId = `${baseId}-trigger`;
    const panelId = `${baseId}-panel`;

    const onKey = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      const acc = e.currentTarget.closest('[data-accordion]') as HTMLElement | null;
      if (acc) {
        const triggers = Array.from(
          acc.querySelectorAll<HTMLButtonElement>('[data-accordion-trigger]')
        );
        const idx = triggers.indexOf(e.currentTarget);
        if (e.key === "ArrowDown") {
          e.preventDefault();
          triggers[(idx + 1) % triggers.length]?.focus();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          triggers[(idx - 1 + triggers.length) % triggers.length]?.focus();
        } else if (e.key === "Home") {
          e.preventDefault();
          triggers[0]?.focus();
        } else if (e.key === "End") {
          e.preventDefault();
          triggers[triggers.length - 1]?.focus();
        }
      }
      onKeyDown?.(e);
    };

    return (
      <button
        ref={ref}
        type="button"
        id={triggerId}
        data-accordion-trigger
        aria-expanded={expanded}
        aria-controls={panelId}
        className={[styles.trigger, expanded && styles.expanded, className].filter(Boolean).join(" ")}
        onClick={() => toggle(value)}
        onKeyDown={onKey}
        {...rest}
      >
        <span className={styles.label}>{children}</span>
        <span aria-hidden="true" className={styles.caret}>▸</span>
      </button>
    );
  }
);
Trigger.displayName = "Accordion.Trigger";

const Panel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...rest }, ref) => {
    const { open } = useAcc("<Accordion.Panel>");
    const { value, baseId } = useItem("<Accordion.Panel>");
    const expanded = open.includes(value);
    return (
      <div
        ref={ref}
        role="region"
        id={`${baseId}-panel`}
        aria-labelledby={`${baseId}-trigger`}
        hidden={!expanded}
        className={[styles.panel, className].filter(Boolean).join(" ")}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
Panel.displayName = "Accordion.Panel";

type Compound = typeof Accordion & {
  Item: typeof Item;
  Trigger: typeof Trigger;
  Panel: typeof Panel;
};
const C = Accordion as Compound;
C.Item = Item;
C.Trigger = Trigger;
C.Panel = Panel;
export default C;
