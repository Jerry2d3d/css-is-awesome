import { forwardRef } from "react";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import styles from "./MenuItem.module.scss";

type BaseProps = {
  icon?: ReactNode;
  shortcut?: string;
  description?: ReactNode;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
};

type ButtonItem = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps | "disabled"> & {
    href?: never;
  };
type LinkItem = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & {
    href: string;
  };
export type MenuItemProps = ButtonItem | LinkItem;

function isLink(props: MenuItemProps): props is LinkItem {
  return "href" in props && props.href !== undefined;
}

export const MenuItem = forwardRef<HTMLButtonElement | HTMLAnchorElement, MenuItemProps>(
  (props, ref) => {
    const { icon, shortcut, description, active, disabled, className, children, ...rest } = props;
    const classes = [
      styles.item,
      active && styles.active,
      disabled && styles.disabled,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const content = (
      <>
        {icon && (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        )}
        <span className={styles.body}>
          <span className={styles.label}>{children}</span>
          {description && <span className={styles.description}>{description}</span>}
        </span>
        {shortcut && <kbd className={styles.shortcut}>{shortcut}</kbd>}
      </>
    );

    if (isLink(props)) {
      const { href, ...linkRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & {
        href?: string;
      };
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={disabled ? undefined : href}
          aria-disabled={disabled || undefined}
          className={classes}
          role="menuitem"
          {...linkRest}
        >
          {content}
        </a>
      );
    }

    const btnRest = rest as ButtonHTMLAttributes<HTMLButtonElement>;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        role="menuitem"
        disabled={disabled}
        className={classes}
        {...btnRest}
      >
        {content}
      </button>
    );
  }
);

MenuItem.displayName = "MenuItem";
export default MenuItem;
