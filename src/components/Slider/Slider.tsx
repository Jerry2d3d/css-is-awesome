import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import styles from "./Slider.module.scss";

export type SliderProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
  showValue?: boolean;
};

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ showValue, className, value, defaultValue, id, ...rest }, ref) => {
    const input = (
      <input
        ref={ref}
        id={id}
        type="range"
        value={value}
        defaultValue={defaultValue}
        className={[styles.input, className].filter(Boolean).join(" ")}
        {...rest}
      />
    );

    if (!showValue) return input;

    return (
      <div className={styles.wrap}>
        {input}
        <span className={styles.value} aria-live="polite">
          {value ?? defaultValue ?? ""}
        </span>
      </div>
    );
  }
);

Slider.displayName = "Slider";

export default Slider;
