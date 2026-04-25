"use client";
import {
  createContext, forwardRef, useContext, useEffect, useId, useRef, useState,
  cloneElement, isValidElement,
} from "react";
import type { HTMLAttributes, ReactElement, ReactNode, CSSProperties } from "react";
import styles from "./Popover.module.scss";

export type PopoverPlacement = "top" | "bottom" | "left" | "right";

type Ctx = {
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
  contentId: string;
  placement: PopoverPlacement;
};
const PopoverContext = createContext<Ctx | null>(null);
function usePopoverCtx(label: string) {
  const ctx = useContext(PopoverContext);
  if (!ctx) throw new Error(`${label} must be inside <Popover>`);
  return ctx;
}

export type PopoverProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: PopoverPlacement;
  children: ReactNode;
};

export const Popover = forwardRef<HTMLDivElement, PopoverProps>(
  ({ open: controlled, defaultOpen = false, onOpenChange, placement = "bottom", children }) => {
    const [internal, setInternal] = useState(defaultOpen);
    const isControlled = controlled !== undefined;
    const open = isControlled ? controlled : internal;
    const setOpen = (v: boolean) => {
      if (!isControlled) setInternal(v);
      onOpenChange?.(v);
    };
    const triggerRef = useRef<HTMLElement | null>(null);
    const contentId = useId();

    return (
      <PopoverContext.Provider value={{ open, setOpen, triggerRef, contentId, placement }}>
        {children}
      </PopoverContext.Provider>
    );
  }
);
Popover.displayName = "Popover";

export type PopoverTriggerProps = {
  children: ReactElement;
};
const Trigger = forwardRef<HTMLElement, PopoverTriggerProps>(({ children }) => {
  const { open, setOpen, triggerRef, contentId } = usePopoverCtx("<Popover.Trigger>");
  if (!isValidElement(children)) return children;
  const childProps = (children.props ?? {}) as Record<string, unknown>;
  const prevOnClick = childProps.onClick as ((e: unknown) => void) | undefined;
  return cloneElement(
    children,
    {
      ref: (node: HTMLElement | null) => {
        triggerRef.current = node;
      },
      "aria-expanded": open,
      "aria-haspopup": "dialog",
      "aria-controls": open ? contentId : undefined,
      onClick: (e: unknown) => {
        prevOnClick?.(e);
        setOpen(!open);
      },
    } as Record<string, unknown>,
  );
});
Trigger.displayName = "Popover.Trigger";

export type PopoverContentProps = HTMLAttributes<HTMLDivElement>;
const Content = forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, children, ...rest }, ref) => {
    const { open, setOpen, triggerRef, contentId, placement } = usePopoverCtx("<Popover.Content>");
    const [coords, setCoords] = useState<CSSProperties>({});
    const contentRef = useRef<HTMLDivElement | null>(null);

    const setRefs = (node: HTMLDivElement | null) => {
      contentRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    };

    useEffect(() => {
      if (!open) return;
      const place = () => {
        const t = triggerRef.current?.getBoundingClientRect();
        const c = contentRef.current?.getBoundingClientRect();
        if (!t || !c) return;
        const gap = 6;
        let top = 0, left = 0;
        switch (placement) {
          case "top":    top = t.top - c.height - gap; left = t.left + (t.width - c.width) / 2; break;
          case "left":   top = t.top + (t.height - c.height) / 2; left = t.left - c.width - gap; break;
          case "right":  top = t.top + (t.height - c.height) / 2; left = t.right + gap; break;
          case "bottom":
          default:       top = t.bottom + gap; left = t.left + (t.width - c.width) / 2;
        }
        const pad = 4;
        left = Math.max(pad, Math.min(left, window.innerWidth - c.width - pad));
        top  = Math.max(pad, Math.min(top,  window.innerHeight - c.height - pad));
        setCoords({ position: "fixed", top: `${top}px`, left: `${left}px` });
      };
      place();
      window.addEventListener("resize", place);
      window.addEventListener("scroll", place, true);
      return () => {
        window.removeEventListener("resize", place);
        window.removeEventListener("scroll", place, true);
      };
    }, [open, placement, triggerRef]);

    useEffect(() => {
      if (!open) return;
      const onDocClick = (e: MouseEvent) => {
        const target = e.target as Node;
        if (
          !contentRef.current?.contains(target) &&
          !triggerRef.current?.contains(target)
        ) setOpen(false);
      };
      const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
      document.addEventListener("mousedown", onDocClick);
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("mousedown", onDocClick);
        document.removeEventListener("keydown", onKey);
      };
    }, [open, setOpen, triggerRef]);

    if (!open) return null;

    return (
      <div
        ref={setRefs}
        id={contentId}
        role="dialog"
        className={[styles.content, className].filter(Boolean).join(" ")}
        style={coords}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
Content.displayName = "Popover.Content";

type PopoverCompound = typeof Popover & { Trigger: typeof Trigger; Content: typeof Content; };
const C = Popover as PopoverCompound;
C.Trigger = Trigger;
C.Content = Content;
export default C;
