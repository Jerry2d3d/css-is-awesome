"use client";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { EditorHandle, Lang } from "./cm";

export type CodeEditorRef = {
  setValue(next: string): void;
  jumpTo(line: number, column?: number): void;
};

type Props = {
  lang: Lang;
  label: string;
  /** Initial document. Later changes arrive through the ref, not this prop. */
  initialValue: string;
  onChange(value: string): void;
  className?: string;
};

// Thin React shell around cm.ts. The CodeMirror bundle is dynamically
// imported on mount so it lives in its own chunk; until it lands, the
// container is empty but sized (see playground.module.scss) so nothing jumps.
const CodeEditor = forwardRef<CodeEditorRef, Props>(function CodeEditor(
  { lang, label, initialValue, onChange, className },
  ref,
) {
  const host = useRef<HTMLDivElement>(null);
  const handle = useRef<EditorHandle | null>(null);
  // Keep the latest callbacks without re-creating the editor.
  const latest = useRef({ onChange, initialValue });
  latest.current.onChange = onChange;
  // Also track the value: if the editor chunk lands AFTER the page has
  // already replaced the document (share-link decode, "Try in playground"),
  // the freshly created editor must start from the current value, not the
  // one captured on first render.
  latest.current.initialValue = initialValue;

  useEffect(() => {
    let cancelled = false;
    const parent = host.current;
    if (!parent) return;
    import("./cm").then(({ createEditor }) => {
      if (cancelled || !host.current) return;
      handle.current = createEditor({
        parent,
        lang,
        label,
        value: latest.current.initialValue,
        onChange: (v) => latest.current.onChange(v),
      });
      parent.removeAttribute("aria-busy");
    });
    return () => {
      cancelled = true;
      handle.current?.destroy();
      handle.current = null;
    };
  }, [lang, label]);

  useImperativeHandle(ref, () => ({
    setValue: (next) => handle.current?.setValue(next),
    jumpTo: (line, column) => handle.current?.jumpTo(line, column),
  }));

  return <div ref={host} className={className} aria-busy="true" />;
});

export default CodeEditor;
