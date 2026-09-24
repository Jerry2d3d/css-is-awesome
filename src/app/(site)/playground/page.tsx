import type { Metadata } from "next";
import Link from "next/link";
import styles from "./playground.module.scss";
import Playground from "./Playground";

export const metadata: Metadata = {
  title: "Playground — css-is-awesome",
  description:
    "Write SCSS with cia mixins, see it render live against any of the 24 shipped themes, and share it as a link. Compiles in your browser — nothing is uploaded.",
};

export default function PlaygroundPage() {
  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <h1>Playground</h1>
        <p className="lead">
          Write SCSS with cia mixins on the left, see it render on the right. Pick any of the 24
          themes, then copy a link — the whole experiment lives in the URL. Sass runs in your
          browser; nothing is uploaded anywhere.
        </p>
        <p className={styles.hint}>
          New here? Every <Link href="/docs/recipes">recipe</Link> has a “Try in playground” button
          that opens with its markup and styling pre-loaded.
        </p>
      </header>
      <Playground />
    </div>
  );
}
