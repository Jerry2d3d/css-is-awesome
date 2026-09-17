// ============================================================================
// CodeMirror 6 bundle for the playground editors.
// ============================================================================
// Everything from @codemirror/* is imported here and ONLY here, and this
// module is loaded with a dynamic import from CodeEditor.tsx, so the editor
// (~300 KB) is a separate chunk that only /playground fetches. Monaco was
// the epic's original pick; CodeMirror is a tenth of the size, works in a
// static export without worker plumbing, and is usable on phones.
//
// Colours come from cia tokens via the surrounding stylesheet
// (playground.module.scss styles `.cm-editor`), not from a CM theme, so the
// editor re-skins with the site theme like everything else.
// ============================================================================
import { EditorState, type Extension } from "@codemirror/state";
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
  drawSelection,
  highlightSpecialChars,
} from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import {
  syntaxHighlighting,
  defaultHighlightStyle,
  bracketMatching,
  indentOnInput,
} from "@codemirror/language";
import { sass } from "@codemirror/lang-sass";
import { html } from "@codemirror/lang-html";

export type Lang = "scss" | "html";

export type EditorHandle = {
  view: EditorView;
  getValue(): string;
  setValue(next: string): void;
  jumpTo(line: number, column?: number): void;
  destroy(): void;
};

export function createEditor(opts: {
  parent: HTMLElement;
  lang: Lang;
  label: string;
  value: string;
  onChange(value: string): void;
}): EditorHandle {
  const language: Extension = opts.lang === "scss" ? sass() : html();

  const state = EditorState.create({
    doc: opts.value,
    extensions: [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      history(),
      drawSelection(),
      indentOnInput(),
      bracketMatching(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      highlightActiveLine(),
      keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
      language,
      EditorView.lineWrapping,
      // Accessible name for the contenteditable — this is what screen
      // readers announce and what the Playwright spec targets.
      EditorView.contentAttributes.of({ "aria-label": opts.label, "data-lang": opts.lang }),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) opts.onChange(update.state.doc.toString());
      }),
    ],
  });

  const view = new EditorView({ state, parent: opts.parent });

  return {
    view,
    getValue: () => view.state.doc.toString(),
    setValue(next) {
      const current = view.state.doc.toString();
      if (current === next) return;
      view.dispatch({ changes: { from: 0, to: current.length, insert: next } });
    },
    jumpTo(line, column = 1) {
      const clamped = Math.max(1, Math.min(line, view.state.doc.lines));
      const info = view.state.doc.line(clamped);
      const pos = Math.min(info.from + Math.max(0, column - 1), info.to);
      view.dispatch({ selection: { anchor: pos }, scrollIntoView: true });
      view.focus();
    },
    destroy: () => view.destroy(),
  };
}
