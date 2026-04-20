import type { ReactNode } from "react";

export type TimelineItemProps = {
  date: string;
  title: ReactNode;
  children: ReactNode;
};

export default function TimelineItem({ date, title, children }: TimelineItemProps) {
  return (
    <li className="timeline__item">
      <div className="timeline__date">{date}</div>
      <h3 className="timeline__title">{title}</h3>
      <p className="timeline__body">{children}</p>
    </li>
  );
}
