import type { ReactNode } from "react";
import styles from "./Post.module.scss";

export type PostProps = {
  date: string;
  tag: string;
  title: ReactNode;
  excerpt: ReactNode;
  href: string;
};

export default function Post({ date, tag, title, excerpt, href }: PostProps) {
  return (
    <article className={styles.post}>
      <div>
        <div className={styles.date}>{date}</div>
        <span className={styles.tag}>{tag}</span>
      </div>
      <div>
        <h2 className={styles.title}><a href={href}>{title}</a></h2>
        <p className={styles.excerpt}>{excerpt}</p>
        <a href={href} className={styles.read}>keep reading →</a>
      </div>
    </article>
  );
}
