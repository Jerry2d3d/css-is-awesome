import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import styles from "./Input.module.scss";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  invalid?: boolean;
  size?: "sm" | "md" | "lg";
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ invalid, size = "md", className, ...rest }, ref) => {
    const classes = [
      styles.input,
      size !== "md" && styles[size],
      invalid && styles.invalid,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={classes}
        {...rest}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;
