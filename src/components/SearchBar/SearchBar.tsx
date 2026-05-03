"use client";
import { forwardRef, useState } from "react";
import type { FormHTMLAttributes } from "react";
import Input from "../Input";
import Button from "../Button";
import styles from "./SearchBar.module.scss";

export type SearchBarProps = Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "defaultValue"> & {
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  submitLabel?: string;
  showSubmit?: boolean;
};

export const SearchBar = forwardRef<HTMLFormElement, SearchBarProps>(
  (
    {
      placeholder = "Search…",
      defaultValue = "",
      value,
      onChange,
      onSearch,
      submitLabel = "Search",
      showSubmit = false,
      className,
      ...rest
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    const setValue = (next: string) => {
      if (!isControlled) setInternalValue(next);
      onChange?.(next);
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSearch?.(currentValue);
    };

    const classes = [styles.bar, className].filter(Boolean).join(" ");

    return (
      <form ref={ref} className={classes} role="search" onSubmit={handleSubmit} {...rest}>
        <span className={styles.icon} aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
            <circle cx="10.5" cy="10.5" r="7.5" />
            <path d="M16 16l5 5" />
          </svg>
        </span>
        <Input
          type="search"
          placeholder={placeholder}
          value={currentValue}
          onChange={(e) => setValue(e.target.value)}
          className={styles.input}
        />
        {showSubmit && (
          <Button type="submit" variant="primary">{submitLabel}</Button>
        )}
      </form>
    );
  }
);

SearchBar.displayName = "SearchBar";
export default SearchBar;
