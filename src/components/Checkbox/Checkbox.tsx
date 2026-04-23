import { forwardRef, useEffect, useRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import styles from "./Checkbox.module.scss";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
  label?: ReactNode;
  indeterminate?: boolean;
  invalid?: boolean;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, indeterminate, invalid, className, id, ...rest }, forwardedRef) => {
    const innerRef = useRef<HTMLInputElement | null>(null);

    // Merge forwarded ref + our own
    const setRefs = (node: HTMLInputElement | null) => {
      innerRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
    };

    useEffect(() => {
      if (innerRef.current) innerRef.current.indeterminate = !!indeterminate;
    }, [indeterminate]);

    const input = (
      <input
        ref={setRefs}
        id={id}
        type="checkbox"
        aria-invalid={invalid || undefined}
        className={[styles.input, invalid && styles.invalid, className].filter(Boolean).join(" ")}
        {...rest}
      />
    );

    if (!label) return input;

    return (
      <label className={styles.wrap}>
        {input}
        <span className={styles.label}>{label}</span>
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
