import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";
import styles from "./Textarea.module.scss";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
  resize?: "none" | "vertical" | "horizontal" | "both";
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ invalid, resize = "vertical", className, style, ...rest }, ref) => {
    const classes = [
      styles.textarea,
      invalid && styles.invalid,
      className,
    ].filter(Boolean).join(" ");

    return (
      <textarea
        ref={ref}
        aria-invalid={invalid || undefined}
        className={classes}
        style={{ resize, ...style }}
        {...rest}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
