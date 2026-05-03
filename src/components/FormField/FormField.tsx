"use client";
import { forwardRef, useId, isValidElement, cloneElement } from "react";
import type { HTMLAttributes, ReactElement, ReactNode } from "react";
import Label from "../Label";
import styles from "./FormField.module.scss";

export type FormFieldProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  label: ReactNode;
  required?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactElement;
};

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, required, hint, error, children, className, ...rest }, ref) => {
    const autoId = useId();

    // If the child already has an id, use it. Otherwise inject one.
    const childProps = (isValidElement(children)
      ? (children.props ?? {})
      : {}) as Record<string, unknown>;
    const childId =
      (childProps.id as string | undefined) ?? `cia-field-${autoId}`;

    const hintId = hint ? `${childId}-hint` : undefined;
    const errorId = error ? `${childId}-error` : undefined;
    const describedBy =
      [hintId, errorId].filter(Boolean).join(" ") || undefined;

    const control = isValidElement(children)
      ? cloneElement(
          children,
          {
            id: childId,
            "aria-describedby": describedBy,
            invalid: Boolean(error) || childProps.invalid,
            required: required || childProps.required,
          } as Record<string, unknown>,
        )
      : children;

    const classes = [styles.field, className].filter(Boolean).join(" ");

    return (
      <div ref={ref} className={classes} {...rest}>
        <Label htmlFor={childId} required={required}>
          {label}
        </Label>
        {control}
        {hint && !error && (
          <p id={hintId} className={styles.hint}>
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} className={styles.error} role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

FormField.displayName = "FormField";

export default FormField;
