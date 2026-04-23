import { forwardRef } from "react";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, LiHTMLAttributes, ReactNode } from "react";
import styles from "./List.module.scss";

type BaseProps = {
  children: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  active?: boolean;
  className?: string;
};

type StaticItem = BaseProps & Omit<LiHTMLAttributes<HTMLLIElement>, keyof BaseProps>;
type LinkItem = BaseProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & { href: string };
type ButtonItem = BaseProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & { onClick: (e: React.MouseEvent<HTMLButtonElement>) => void };

export type ListItemProps = StaticItem | LinkItem | ButtonItem;

function isLink(p: ListItemProps): p is LinkItem {
  return "href" in p && (p as LinkItem).href !== undefined;
}
function isButton(p: ListItemProps): p is ButtonItem {
  return "onClick" in p && typeof (p as ButtonItem).onClick === "function" && !("href" in p);
}

export const ListItem = forwardRef<HTMLLIElement, ListItemProps>((props, ref) => {
  const { leading, trailing, active, className, children, ...rest } = props;
  const interactive = isLink(props) || isButton(props);
  const itemClasses = [
    styles.item,
    interactive && styles.itemInteractive,
    active && styles.active,
    className,
  ].filter(Boolean).join(" ");

  const content = (
    <>
      {leading && <span className={styles.leading} aria-hidden="true">{leading}</span>}
      <span className={styles.body}>{children}</span>
      {trailing && <span className={styles.trailing} aria-hidden="true">{trailing}</span>}
    </>
  );

  if (isLink(props)) {
    const { href, ...linkRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <li ref={ref}>
        <a href={href} className={itemClasses} {...linkRest}>
          {content}
        </a>
      </li>
    );
  }

  if (isButton(props)) {
    return (
      <li ref={ref}>
        <button type="button" className={itemClasses} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
          {content}
        </button>
      </li>
    );
  }

  return (
    <li ref={ref} className={itemClasses} {...(rest as LiHTMLAttributes<HTMLLIElement>)}>
      {content}
    </li>
  );
});

ListItem.displayName = "ListItem";

export default ListItem;
