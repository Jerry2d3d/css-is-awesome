"use client";

import { useRef, useState } from "react";
import styles from "./Example.module.scss";

// Standalone client island so Example/Preview/Code can stay
// server-renderable. Pages that import <Example> from a server
// component (most of /docs) need the compound API (Example.Code,
// Example.Preview) to survive the RSC boundary — and a "use client"
// module's compound properties don't.
//
// The button finds its sibling <pre> by walking the DOM:
// CopyButton is rendered next to <pre> inside .codeWrap. We read
// pre.textContent so syntax-highlight <span>s are stripped.

export default function CopyButton() {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onCopy = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const pre = button.parentElement?.querySelector("pre");
    const text = pre?.textContent ?? "";
    if (!text) return;

    const fallback = () => {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } finally {
        document.body.removeChild(ta);
      }
    };

    Promise.resolve()
      .then(() => navigator.clipboard?.writeText(text) ?? Promise.reject())
      .catch(fallback)
      .finally(() => {
        setCopied(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setCopied(false), 1500);
      });
  };

  return (
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
  );
}
