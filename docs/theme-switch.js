/**
 * css-is-awesome — Runtime Theme Switcher
 *
 * Drop this into your app to get theme switching with:
 *   - localStorage persistence
 *   - prefers-color-scheme auto-detection
 *   - No flash of wrong theme on load
 *
 * Usage:
 *   <button onclick="ciaTheme.toggle()">Toggle theme</button>
 *   <button onclick="ciaTheme.set('dark')">Dark</button>
 *   <button onclick="ciaTheme.set('light')">Light</button>
 *   <button onclick="ciaTheme.set('auto')">System</button>
 */
const ciaTheme = (() => {
  const STORAGE_KEY = "cia-theme";

  function getSystemPreference() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function apply(theme) {
    const resolved = theme === "auto" ? getSystemPreference() : theme;
    document.documentElement.setAttribute("data-theme", resolved);
  }

  function get() {
    return localStorage.getItem(STORAGE_KEY) || "auto";
  }

  function set(theme) {
    if (theme === "auto") {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, theme);
    }
    apply(theme);
  }

  function toggle() {
    const current = get();
    const resolved =
      current === "auto" ? getSystemPreference() : current;
    set(resolved === "dark" ? "light" : "dark");
  }

  // Auto-apply on load
  apply(get());

  // Listen for system preference changes (when set to "auto")
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      if (get() === "auto") apply("auto");
    });

  return { get, set, toggle, apply };
})();
