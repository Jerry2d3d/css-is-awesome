import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import styles from "./Radio.module.scss";

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
  label?: ReactNode;
  invalid?: boolean;
};

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, invalid, className, id, ...rest }, ref) => {
    // Note: `aria-invalid` is not valid on role="radio" (jsx-a11y/role-supports-aria-props).
    // For a single radio input, validity belongs to the surrounding radiogroup (see RadioGroup).
    // We still toggle the visual `.invalid` class so authors can preview an error state on
    // an isolated <Radio invalid /> for design review.
    const input = (
      <input
        ref={ref}
        id={id}
        type="radio"
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
