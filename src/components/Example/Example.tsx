"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
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
  //
  // Copy-to-clipboard: a single button is overlaid in the top-right. We read
  // pre.textContent rather than serialising the React tree so syntax-highlight
  // <span> wrappers are stripped automatically and the user gets the same
  // text they would select with their cursor.
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onCopy = async () => {
    const text = preRef.current?.textContent ?? "";
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard API can reject in insecure contexts or when blocked by
      // permissions. Fall back to a hidden textarea + execCommand so the
      // button still works on http:// previews and older browsers.
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        document.body.removeChild(ta);
        return;
      }
      document.body.removeChild(ta);
    }
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={styles.codeWrap}>
      <pre
        ref={preRef}
        className={styles.code}
        tabIndex={0}
        role="region"
        aria-label="Code sample"
      >
        {children}
      </pre>
      <button
        type="button"
        className={styles.copyBtn}
        onClick={onCopy}
        aria-label={copied ? "Copied to clipboard" : "Copy code to clipboard"}
        aria-live="polite"
        data-copied={copied ? "true" : undefined}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

Example.Preview = Preview;
Example.Code = Code;

export default Example;
