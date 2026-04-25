import type { CSSProperties, ReactNode } from "react";
import styles from "./Example.module.scss";

export type ExampleProps = {
  children: ReactNode;
};

function Example({ children }: ExampleProps) {
  return <div className={styles.example}>{children}</div>;
}

function Preview({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div className={styles.preview} style={style}>
      {children}
    </div>
  );
}

function Code({ children }: { children: ReactNode }) {
  // <pre> is horizontally scrollable (overflow-x: auto). axe's
  // `scrollable-region-focusable` rule requires a tabindex and a label so
  // keyboard-only users can pan the code preview. The label is intentionally
  // generic; per-example labelling is overkill for what is documentation
  // syntax-highlighting, but the region must be reachable.
  return (
    <pre
      className={styles.code}
      tabIndex={0}
      role="region"
      aria-label="Code sample"
    >
      {children}
    </pre>
  );
}

Example.Preview = Preview;
Example.Code = Code;

export default Example;
