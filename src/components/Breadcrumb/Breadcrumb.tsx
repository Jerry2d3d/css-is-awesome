import { forwardRef, Fragment } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Breadcrumb.module.scss";

export type BreadcrumbItem = {
  label: ReactNode;
  href?: string;
};

export type BreadcrumbProps = HTMLAttributes<HTMLElement> & {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  label?: string; // aria-label on the <nav>
};

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items, separator = "/", label = "Breadcrumb", className, ...rest }, ref) => {
    const classes = [styles.breadcrumb, className].filter(Boolean).join(" ");
    return (
      <nav ref={ref} aria-label={label} className={classes} {...rest}>
        <ol className={styles.list}>
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <Fragment key={i}>
                <li className={styles.item}>
                  {item.href && !isLast ? (
                    <a href={item.href} className={styles.link}>{item.label}</a>
                  ) : (
                    <span aria-current={isLast ? "page" : undefined} className={styles.current}>
                      {item.label}
                    </span>
                  )}
                </li>
                {!isLast && (
                  <li className={styles.separator} aria-hidden="true">{separator}</li>
                )}
              </Fragment>
            );
          })}
        </ol>
      </nav>
    );
  }
);

Breadcrumb.displayName = "Breadcrumb";
export default Breadcrumb;
