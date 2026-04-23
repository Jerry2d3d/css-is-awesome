"use client";
import {
  createContext, forwardRef, useContext, useEffect, useId, useRef, useState,
  cloneElement, isValidElement,
} from "react";
import type { HTMLAttributes, ReactElement, ReactNode, CSSProperties } from "react";
import styles from "./Dropdown.module.scss";

type Ctx = {
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
  menuRef: React.MutableRefObject<HTMLDivElement | null>;
  menuId: string;
  triggerId: string;
};
const DropdownContext = createContext<Ctx | null>(null);
function useDropdown(label: string) {
  const ctx = useContext(DropdownContext);
  if (!ctx) throw new Error(`${label} must be inside <Dropdown>`);
  return ctx;
}

export type DropdownProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
};

export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  ({ open: controlled, defaultOpen = false, onOpenChange, children }, _ref) => {
    const [internal, setInternal] = useState(defaultOpen);
    const isControlled = controlled !== undefined;
    const open = isControlled ? (controlled as boolean) : internal;
    const setOpen = (v: boolean) => {
      if (!isControlled) setInternal(v);
      onOpenChange?.(v);
    };

    const triggerRef = useRef<HTMLElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const ids = useId();
    const menuId = `${ids}-menu`;
    const triggerId = `${ids}-trigger`;

    return (
      <DropdownContext.Provider value={{ open, setOpen, triggerRef, menuRef, menuId, triggerId }}>
        {children}
      </DropdownContext.Provider>
    );
  }
);
Dropdown.displayName = "Dropdown";

const Trigger = forwardRef<HTMLElement, { children: ReactElement }>(({ children }, _ref) => {
  const { open, setOpen, triggerRef, menuRef, menuId, triggerId } = useDropdown("<Dropdown.Trigger>");
  if (!isValidElement(children)) return children;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const child = children as ReactElement<any>;
  return cloneElement(child, {
    id: triggerId,
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node;
    },
    "aria-haspopup": "menu",
    "aria-expanded": open,
    "aria-controls": open ? menuId : undefined,
    onClick: (e: unknown) => {
      child.props.onClick?.(e);
      setOpen(!open);
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      child.props.onKeyDown?.(e);
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
        // focus first item once menu mounts
        requestAnimationFrame(() => {
          const first = menuRef.current?.querySelector<HTMLElement>(
            '[role="menuitem"]:not([aria-disabled="true"])'
          );
          first?.focus();
        });
      }
    },
  });
});
Trigger.displayName = "Dropdown.Trigger";

type MenuProps = HTMLAttributes<HTMLDivElement> & {
  placement?: "top" | "bottom";
};
const Menu = forwardRef<HTMLDivElement, MenuProps>(
  ({ placement = "bottom", className, children, ...rest }, ref) => {
    const { open, setOpen, triggerRef, menuRef, menuId, triggerId } = useDropdown("<Dropdown.Menu>");
    const [coords, setCoords] = useState<CSSProperties>({});

    const setRefs = (node: HTMLDivElement | null) => {
      menuRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    };

    useEffect(() => {
      if (!open) return;
      const place = () => {
        const t = triggerRef.current?.getBoundingClientRect();
        const m = menuRef.current?.getBoundingClientRect();
        if (!t || !m) return;
        const gap = 4;
        const top = placement === "top" ? t.top - m.height - gap : t.bottom + gap;
        let left = t.left;
        if (left + m.width > window.innerWidth - 8) left = window.innerWidth - m.width - 8;
        left = Math.max(4, left);
        setCoords({ position: "fixed", top: `${top}px`, left: `${left}px` });
      };
      place();
      window.addEventListener("resize", place);
      window.addEventListener("scroll", place, true);
      return () => {
        window.removeEventListener("resize", place);
        window.removeEventListener("scroll", place, true);
      };
    }, [open, placement, triggerRef, menuRef]);

    useEffect(() => {
      if (!open) return;
      const onDoc = (e: MouseEvent) => {
        const t = e.target as Node;
        if (!menuRef.current?.contains(t) && !triggerRef.current?.contains(t)) setOpen(false);
      };
      document.addEventListener("mousedown", onDoc);
      return () => document.removeEventListener("mousedown", onDoc);
    }, [open, setOpen, menuRef, triggerRef]);

    const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const items = Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>(
          '[role="menuitem"]:not([aria-disabled="true"])'
        ) ?? []
      );
      const active = document.activeElement as HTMLElement | null;
      const idx = active ? items.indexOf(active) : -1;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        items[(idx + 1) % items.length]?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        items[(idx - 1 + items.length) % items.length]?.focus();
      } else if (e.key === "Home") {
        e.preventDefault();
        items[0]?.focus();
      } else if (e.key === "End") {
        e.preventDefault();
        items[items.length - 1]?.focus();
      } else if (e.key === "Escape" || e.key === "Tab") {
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus?.();
      }
    };

    if (!open) return null;

    return (
      <div
        ref={setRefs}
        id={menuId}
        role="menu"
        aria-labelledby={triggerId}
        tabIndex={-1}
        onKeyDown={onKey}
        className={[styles.menu, className].filter(Boolean).join(" ")}
        style={coords}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
Menu.displayName = "Dropdown.Menu";

export type DropdownItemProps = HTMLAttributes<HTMLButtonElement> & {
  disabled?: boolean;
  onSelect?: () => void;
};
const Item = forwardRef<HTMLButtonElement, DropdownItemProps>(
  ({ disabled, onSelect, className, children, onClick, ...rest }, ref) => {
    const { setOpen, triggerRef } = useDropdown("<Dropdown.Item>");
    return (
      <button
        ref={ref}
        type="button"
        role="menuitem"
        tabIndex={-1}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        className={[styles.item, disabled && styles.disabled, className].filter(Boolean).join(" ")}
        onClick={(e) => {
          onClick?.(e);
          if (disabled) return;
          onSelect?.();
          setOpen(false);
          triggerRef.current?.focus?.();
        }}
        {...rest}
      >
        {children}
      </button>
    );
  }
);
Item.displayName = "Dropdown.Item";

const Divider = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...rest }, ref) => (
    <div
      ref={ref}
      role="separator"
      className={[styles.divider, className].filter(Boolean).join(" ")}
      {...rest}
    />
  )
);
Divider.displayName = "Dropdown.Divider";

type DropdownCompound = typeof Dropdown & {
  Trigger: typeof Trigger;
  Menu: typeof Menu;
  Item: typeof Item;
  Divider: typeof Divider;
};
const C = Dropdown as DropdownCompound;
C.Trigger = Trigger;
C.Menu = Menu;
C.Item = Item;
C.Divider = Divider;
export default C;
