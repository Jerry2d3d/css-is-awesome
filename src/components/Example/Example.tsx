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
  return <pre className={styles.code}>{children}</pre>;
}

Example.Preview = Preview;
Example.Code = Code;

export default Example;
