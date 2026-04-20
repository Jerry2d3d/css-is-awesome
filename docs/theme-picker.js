/**
 * css-is-awesome — Live Theme Picker
 *
 * A small floating widget that swaps the theme stylesheet at runtime.
 * Drop this script into any page that has:
 *   <link rel="stylesheet" href="theme.css" id="cia-theme-link">
 *
 * Themes are assumed to live at:
 *   ./theme.css                       (Sketchbook — default)
 *   ./themes/<name>/theme.css         (all others)
 *
 * Choice persists in localStorage.
 */
(() => {
  const STORAGE_KEY = "cia-theme-file";
  const LINK_ID     = "cia-theme-link";

  const THEMES = [
    { id: "sketchbook", label: "Sketchbook", href: "theme.css" },
    { id: "press",      label: "Press",      href: "themes/press/theme.css" },
    { id: "graphite",   label: "Graphite",   href: "themes/graphite/theme.css" },
    { id: "glass",      label: "Glass",      href: "themes/glass/theme.css" },
    { id: "cupertino",  label: "Cupertino",  href: "themes/cupertino/theme.css" },
    { id: "terminal",   label: "Terminal",   href: "themes/terminal/theme.css" },
  ];

  function resolveHref(pageHref) {
    // Walk up from subpages like /themes/graphite/preview.html correctly
    return pageHref;
  }

  function setLink(href) {
    let link = document.getElementById(LINK_ID);
    if (!link) {
      link = document.querySelector('link[rel="stylesheet"][href*="theme.css"]');
      if (link) link.id = LINK_ID;
    }
    if (!link) return;
    link.href = resolveHref(href);
  }

  function applyTheme(id) {
    const t = THEMES.find((x) => x.id === id) || THEMES[0];
    setLink(t.href);
    localStorage.setItem(STORAGE_KEY, t.id);
    document.querySelectorAll("[data-cia-theme-btn]").forEach((btn) => {
      btn.setAttribute(
        "aria-pressed",
        btn.getAttribute("data-cia-theme-btn") === t.id ? "true" : "false"
      );
    });
  }

  function mount() {
    const host = document.createElement("div");
    host.id = "cia-theme-picker";
    host.innerHTML = `
      <style>
        #cia-theme-picker {
          position: fixed;
          right: 16px;
          bottom: 16px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 10px 12px;
          background: var(--paper-raised, #fff);
          color: var(--ink, #111);
          border: 1px solid var(--hair, rgba(0,0,0,0.12));
          border-radius: var(--r-md, 8px);
          box-shadow: var(--shadow-md, 0 6px 20px rgba(0,0,0,0.12));
          font-family: var(--font-sans, system-ui, sans-serif);
          font-size: 12px;
          line-height: 1.4;
          max-width: 200px;
        }
        #cia-theme-picker .cia-tp__label {
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ink-faint, #888);
          padding-bottom: 4px;
        }
        #cia-theme-picker .cia-tp__row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px;
        }
        #cia-theme-picker button {
          all: unset;
          cursor: pointer;
          padding: 5px 8px;
          border-radius: var(--r-sm, 4px);
          border: 1px solid transparent;
          color: var(--ink-soft, currentColor);
          background: transparent;
          text-align: center;
          font: inherit;
          transition: background 120ms ease, border-color 120ms ease;
        }
        #cia-theme-picker button:hover {
          background: var(--paper-sunk, rgba(0,0,0,0.05));
        }
        #cia-theme-picker button[aria-pressed="true"] {
          background: var(--ai-wash, rgba(0,0,0,0.08));
          border-color: var(--ai, currentColor);
          color: var(--ai, currentColor);
          font-weight: 600;
        }
        @media (max-width: 560px) {
          #cia-theme-picker { right: 8px; bottom: 8px; padding: 8px; }
        }
      </style>
      <div class="cia-tp__label">Theme</div>
      <div class="cia-tp__row">
        ${THEMES.map(
          (t) => `<button type="button" data-cia-theme-btn="${t.id}">${t.label}</button>`
        ).join("")}
      </div>
    `;
    document.body.appendChild(host);

    host.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-cia-theme-btn]");
      if (!btn) return;
      applyTheme(btn.getAttribute("data-cia-theme-btn"));
    });

    const saved = localStorage.getItem(STORAGE_KEY) || "sketchbook";
    applyTheme(saved);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
