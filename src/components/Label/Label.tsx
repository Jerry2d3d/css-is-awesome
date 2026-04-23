import { forwardRef } from "react";
import type { LabelHTMLAttributes, ReactNode } from "react";
import styles from "./Label.module.scss";

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
  children: ReactNode;
};

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ required, className, children, ...rest }, ref) => {
    const classes = [styles.label, className].filter(Boolean).join(" ");

    return (
      <label ref={ref} className={classes} {...rest}>
        {children}
        {required && <span className={styles.required} aria-hidden="true">*</span>}
      </label>
    );
  }
);

Label.displayName = "Label";

export default Label;
