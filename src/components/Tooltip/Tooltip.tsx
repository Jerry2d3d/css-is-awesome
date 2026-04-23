"use client";
import { forwardRef, useId, useRef, useState, useEffect, useCallback, cloneElement, isValidElement } from "react";
import type { ReactElement, ReactNode, CSSProperties } from "react";
import styles from "./Tooltip.module.scss";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export type TooltipProps = {
  label: ReactNode;
  placement?: TooltipPlacement;
  delay?: number;        // ms before show (default 200)
  children: ReactElement; // trigger element
};

export const Tooltip = forwardRef<HTMLSpanElement, TooltipProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ label, placement = "top", delay = 200, children }, ref) => {
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState<CSSProperties>({});
    const tipId = useId();
    const triggerRef = useRef<HTMLElement | null>(null);
    const tipRef = useRef<HTMLDivElement | null>(null);
    const timer = useRef<number | null>(null);

    const clear = () => {
      if (timer.current != null) { window.clearTimeout(timer.current); timer.current = null; }
    };

    const scheduleOpen = useCallback(() => {
      clear();
      timer.current = window.setTimeout(() => setOpen(true), delay);
    }, [delay]);

    const close = useCallback(() => { clear(); setOpen(false); }, []);

    // Position after open
    useEffect(() => {
      if (!open || !triggerRef.current || !tipRef.current) return;
      const t = triggerRef.current.getBoundingClientRect();
      const tip = tipRef.current.getBoundingClientRect();
      const gap = 8;
      let top = 0, left = 0;
      switch (placement) {
        case "bottom": top = t.bottom + gap; left = t.left + (t.width - tip.width) / 2; break;
        case "left":   top = t.top + (t.height - tip.height) / 2; left = t.left - tip.width - gap; break;
        case "right":  top = t.top + (t.height - tip.height) / 2; left = t.right + gap; break;
        case "top":
        default:       top = t.top - tip.height - gap; left = t.left + (t.width - tip.width) / 2;
      }
      // Clamp to viewport
      const pad = 4;
      left = Math.max(pad, Math.min(left, window.innerWidth - tip.width - pad));
      top  = Math.max(pad, Math.min(top,  window.innerHeight - tip.height - pad));
      setCoords({ position: "fixed", top: `${top}px`, left: `${left}px` });
    }, [open, placement, label]);

    // Dismiss on Escape
    useEffect(() => {
      if (!open) return;
      const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }, [open, close]);

    const setTriggerRef = useCallback((node: HTMLElement | null) => {
      triggerRef.current = node;
      // Forward external ref if child carried one (React element refs are tricky; we mostly need internal here)
    }, []);

    if (!isValidElement(children)) return children;
    const child = children as ReactElement<Record<string, unknown>>;
    const childProps = child.props as Record<string, unknown>;
    const existingAria = childProps["aria-describedby"] as string | undefined;
    const describedBy = existingAria ? `${existingAria} ${tipId}` : tipId;

    type EventHandler = (e: unknown) => void;
    const onMouseEnter = childProps.onMouseEnter as EventHandler | undefined;
    const onMouseLeave = childProps.onMouseLeave as EventHandler | undefined;
    const onFocus = childProps.onFocus as EventHandler | undefined;
    const onBlur = childProps.onBlur as EventHandler | undefined;

    const trigger = cloneElement(child, {
      ref: setTriggerRef,
      onMouseEnter: (e: unknown) => { onMouseEnter?.(e); scheduleOpen(); },
      onMouseLeave: (e: unknown) => { onMouseLeave?.(e); close(); },
      onFocus:      (e: unknown) => { onFocus?.(e); scheduleOpen(); },
      onBlur:       (e: unknown) => { onBlur?.(e); close(); },
      "aria-describedby": open ? describedBy : existingAria,
    } as Record<string, unknown>);

    return (
      <>
        {trigger}
        {open && (
          <div
            ref={tipRef}
            id={tipId}
            role="tooltip"
            className={styles.tooltip}
            style={coords}
          >
            {label}
          </div>
        )}
      </>
    );
  }
);

Tooltip.displayName = "Tooltip";
export default Tooltip;
