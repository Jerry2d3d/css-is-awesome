import type { ReactNode } from "react";
import styles from "./TimelineItem.module.scss";

export type TimelineItemProps = {
  date: string;
  title: ReactNode;
  children: ReactNode;
};

export default function TimelineItem({ date, title, children }: TimelineItemProps) {
  return (
    <li className={styles.item}>
      <div className={styles.date}>{date}</div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.body}>{children}</p>
    </li>
  );
}
