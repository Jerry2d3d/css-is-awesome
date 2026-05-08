import type { CSSProperties, ReactNode } from "react";
import styles from "./Example.module.scss";
import CopyButton from "./CopyButton";

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
  // <pre> is horizontally scrollable; axe's `scrollable-region-focusable`
  // requires a tabindex + label so keyboard-only users can pan the code.
  // CopyButton is the only interactive piece here — extracted into its
  // own client island so the rest of Example stays server-renderable
  // and the compound API (Example.Code / Example.Preview) survives the
  // RSC boundary for the ~15 docs pages that import <Example>.
  return (
    <div className={styles.codeWrap}>
      <pre
        className={styles.code}
        tabIndex={0}
        role="region"
        aria-label="Code sample"
      >
        {children}
      </pre>
      <CopyButton />
    </div>
  );
}

Example.Preview = Preview;
Example.Code = Code;

export default Example;
