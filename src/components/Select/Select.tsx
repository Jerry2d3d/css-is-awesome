import { forwardRef } from "react";
import type { SelectHTMLAttributes, ReactNode } from "react";
import styles from "./Select.module.scss";

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  invalid?: boolean;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ invalid, size = "md", className, children, ...rest }, ref) => {
    const classes = [
      styles.select,
      size !== "md" && styles[size],
      invalid && styles.invalid,
      className,
    ].filter(Boolean).join(" ");

    return (
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={classes}
        {...rest}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";

export default Select;
