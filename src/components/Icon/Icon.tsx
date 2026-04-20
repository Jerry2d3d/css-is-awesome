type Size = "sm" | "md" | "lg" | "xl";

export type IconProps = {
  name: string;
  size?: Size;
  sprite?: string;
  title?: string;
  className?: string;
};

export default function Icon({
  name,
  size,
  sprite = "/icons.svg",
  title,
  className,
}: IconProps) {
  const classes = ["cia-icon"];
  if (size) classes.push(`cia-icon--${size}`);
  if (className) classes.push(className);

  return (
    <svg className={classes.join(" ")} role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <use href={`${sprite}#${name}`} />
    </svg>
  );
}
