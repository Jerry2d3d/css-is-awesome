"use client";
import {
  createContext, forwardRef, useContext, useEffect, useId, useRef,
} from "react";
import { createPortal } from "react-dom";
import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Modal.module.scss";

type ModalContextValue = { baseId: string; onClose: () => void; titleId: string; };
const ModalContext = createContext<ModalContextValue | null>(null);
function useModal(label: string) {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error(`${label} must be rendered inside <Modal>`);
  return ctx;
}

export type ModalProps = HTMLAttributes<HTMLDivElement> & {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  role?: "dialog" | "alertdialog";
  size?: "sm" | "md" | "lg" | "xl";
};

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      open, onClose, children, closeOnBackdrop = true, closeOnEscape = true,
      role = "dialog", size = "md", className, ...rest
    }, ref
  ) => {
    const baseId = useId();
    const titleId = `${baseId}-title`;
    const dialogRef = useRef<HTMLDivElement | null>(null);
    const previouslyFocused = useRef<HTMLElement | null>(null);

    // Escape + focus-return + scroll lock
    useEffect(() => {
      if (!open) return;
      previouslyFocused.current = document.activeElement as HTMLElement | null;

      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape" && closeOnEscape) {
          e.stopPropagation();
          onClose();
        }
        // Focus trap (Tab / Shift+Tab)
        if (e.key === "Tab" && dialogRef.current) {
          const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          const list = Array.from(focusable).filter(el => !el.hasAttribute("aria-hidden"));
          if (list.length === 0) { e.preventDefault(); return; }
          const first = list[0], last = list[list.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault(); last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault(); first.focus();
          }
        }
      };

      document.addEventListener("keydown", onKey);
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      // focus the first focusable in the dialog
      requestAnimationFrame(() => {
        if (!dialogRef.current) return;
        const focusable = dialogRef.current.querySelector<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        (focusable ?? dialogRef.current).focus();
      });

      return () => {
        document.removeEventListener("keydown", onKey);
        document.body.style.overflow = prevOverflow;
        previouslyFocused.current?.focus?.();
      };
    }, [open, onClose, closeOnEscape]);

    if (!open || typeof document === "undefined") return null;

    const setRefs = (node: HTMLDivElement | null) => {
      dialogRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    };

    return createPortal(
      <ModalContext.Provider value={{ baseId, onClose, titleId }}>
        <div
          className={styles.backdrop}
          onClick={(e) => {
            if (closeOnBackdrop && e.target === e.currentTarget) onClose();
          }}
        >
          <div
            ref={setRefs}
            role={role}
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className={[styles.dialog, styles[size], className].filter(Boolean).join(" ")}
            {...rest}
          >
            {children}
          </div>
        </div>
      </ModalContext.Provider>,
      document.body
    );
  }
);
Modal.displayName = "Modal";

const Header = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...rest }, ref) => {
    const { titleId } = useModal("<Modal.Header>");
    return (
      <div ref={ref} className={[styles.header, className].filter(Boolean).join(" ")} {...rest}>
        <h2 id={titleId} className={styles.title}>{children}</h2>
      </div>
    );
  }
);
Header.displayName = "Modal.Header";

const Body = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...rest }, ref) => (
    <div ref={ref} className={[styles.body, className].filter(Boolean).join(" ")} {...rest} />
  )
);
Body.displayName = "Modal.Body";

const Footer = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...rest }, ref) => (
    <div ref={ref} className={[styles.footer, className].filter(Boolean).join(" ")} {...rest} />
  )
);
Footer.displayName = "Modal.Footer";

const Close = forwardRef<HTMLButtonElement, HTMLAttributes<HTMLButtonElement>>(
  ({ className, onClick, children, ...rest }, ref) => {
    const { onClose } = useModal("<Modal.Close>");
    return (
      <button
        ref={ref}
        type="button"
        aria-label="Close"
        className={[styles.close, className].filter(Boolean).join(" ")}
        onClick={(e) => { onClose(); onClick?.(e); }}
        {...rest}
      >
        {children ?? "\u00d7"}
      </button>
    );
  }
);
Close.displayName = "Modal.Close";

type ModalCompound = typeof Modal & {
  Header: typeof Header; Body: typeof Body; Footer: typeof Footer; Close: typeof Close;
};
const C = Modal as ModalCompound;
C.Header = Header; C.Body = Body; C.Footer = Footer; C.Close = Close;

export default C;
