import type { ReactNode } from "react";

export type PostProps = {
  date: string;
  tag: string;
  title: ReactNode;
  excerpt: ReactNode;
  href: string;
};

export default function Post({ date, tag, title, excerpt, href }: PostProps) {
  return (
    <article className="post">
      <div>
        <div className="post__date">{date}</div>
        <span className="post__tag">{tag}</span>
      </div>
      <div>
        <h2 className="post__title"><a href={href}>{title}</a></h2>
        <p className="post__excerpt">{excerpt}</p>
        <a href={href} className="post__read">keep reading →</a>
      </div>
    </article>
  );
}
