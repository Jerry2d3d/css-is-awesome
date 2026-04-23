import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import styles from "./Radio.module.scss";

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
  label?: ReactNode;
  invalid?: boolean;
};

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, invalid, className, id, ...rest }, ref) => {
    const input = (
      <input
        ref={ref}
        id={id}
        type="radio"
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

Radio.displayName = "Radio";

export default Radio;
