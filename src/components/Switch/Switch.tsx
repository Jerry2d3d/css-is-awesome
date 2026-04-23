import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import styles from "./Switch.module.scss";

export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
  label?: ReactNode;
  labelPosition?: "left" | "right";
};

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, labelPosition = "right", className, id, ...rest }, ref) => {
    const input = (
      <input
        ref={ref}
        id={id}
        type="checkbox"
        role="switch"
        className={[styles.input, className].filter(Boolean).join(" ")}
        {...rest}
      />
    );

    if (!label) return input;

    return (
      <label className={styles.wrap} data-label-position={labelPosition}>
        {labelPosition === "left" && <span className={styles.label}>{label}</span>}
        {input}
        {labelPosition === "right" && <span className={styles.label}>{label}</span>}
      </label>
    );
  }
);

Switch.displayName = "Switch";

export default Switch;
