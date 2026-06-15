"use client";

import { useEffect } from "react";

// The recipe body is server-rendered HTML (zero client JS for the content).
// This tiny island runs once after hydration and appends a Copy button to
// every `.recipe-codeblock` marked.parse() emitted. Doing it here — rather
// than baking buttons into the HTML string — keeps the markdown path free of
// interactivity and lets the page degrade gracefully: no JS still means fully
// selectable code, just no one-click copy.
//
// The clipboard flow mirrors components/Example/CopyButton.tsx (clipboard API
// first, hidden-textarea + execCommand fallback for non-secure contexts).
export default function RecipeCopyButtons() {
  useEffect(() => {
    const blocks = Array.from(
      document.querySelectorAll<HTMLElement>(".recipe-body .recipe-codeblock"),
    );

    const cleanups = blocks.map((block) => {
      // Guard against double-mount in dev StrictMode.
      if (block.querySelector(".recipe-copy")) return () => {};

      const button = document.createElement("button");
      button.type = "button";
      button.className = "recipe-copy";
      button.textContent = "Copy";
      button.setAttribute("aria-label", "Copy code to clipboard");

      let resetTimer: ReturnType<typeof setTimeout> | null = null;

      const onClick = () => {
        const pre = block.querySelector("pre");
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
            button.textContent = "Copied";
            button.setAttribute("data-copied", "true");
            if (resetTimer) clearTimeout(resetTimer);
            resetTimer = setTimeout(() => {
              button.textContent = "Copy";
              button.removeAttribute("data-copied");
            }, 1500);
          });
      };

      button.addEventListener("click", onClick);
      block.appendChild(button);

      return () => {
        if (resetTimer) clearTimeout(resetTimer);
        button.removeEventListener("click", onClick);
        button.remove();
      };
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
