import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import styles from "./List.module.scss";

export type ListProps = HTMLAttributes<HTMLUListElement | HTMLOListElement> & {
  as?: "ul" | "ol";
  dividers?: boolean;
  gap?: number | "none";   // maps to .gap-N or .gap-none
};

export const List = forwardRef<HTMLUListElement | HTMLOListElement, ListProps>(
  ({ as = "ul", dividers, gap, className, children, ...rest }, ref) => {
    const classes = [
      styles.list,
      dividers && styles.dividers,
      gap !== undefined && styles[`gap-${gap}`],
      className,
    ].filter(Boolean).join(" ");

    const Tag = as as React.ElementType;

    return (
      <Tag ref={ref as React.Ref<HTMLUListElement>} className={classes} {...rest}>
        {children}
      </Tag>
    );
  }
);

List.displayName = "List";

export default List;
