import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import styles from "./Button.module.scss";

type Variant = "default" | "primary" | "outline" | "ghost";

type BaseProps = {
  variant?: Variant;
  className?: string;
};

type ButtonAsButton = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
    href?: never;
  };

type ButtonAsLink = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className"> & {
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

function classFor(variant: Variant, extra?: string) {
  return [styles[variant], extra].filter(Boolean).join(" ");
}

export default function Button(props: ButtonProps) {
  const { variant = "default", className, ...rest } = props;

  if ("href" in rest && rest.href !== undefined) {
    const anchorProps = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    return <a {...anchorProps} className={classFor(variant, className)} />;
  }

  const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return <button type="button" {...buttonProps} className={classFor(variant, className)} />;
}
