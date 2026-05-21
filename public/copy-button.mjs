// ============================================================================
// css-is-awesome — copy-button shim
// ============================================================================
// Framework-free clipboard handler for [data-copy-target] buttons.
// ~700 bytes. Drop into <head>:
//   <script type="module" src="/cia/dist/copy-button.mjs"></script>
//
// Behavior:
//   1. Delegated click handler on the document.
//   2. Reads text from `document.querySelector(btn.dataset.copyTarget)`,
//      or falls back to `btn.previousElementSibling`.
//   3. Uses navigator.clipboard.writeText with execCommand fallback.
//   4. Sets data-copied="true" on the button for 1.5s; updates aria-label.
//   5. If the button has popovertarget, auto-hides that popover after 1.5s
//      (browser shows it natively on click via popovertargetaction).
// ============================================================================

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-copy-target]');
  if (!btn) return;

  const target =
    document.querySelector(btn.dataset.copyTarget) ||
    btn.previousElementSibling;
  const text = target?.textContent ?? '';
  if (!text) return;

  const copy =
    navigator.clipboard?.writeText(text) ??
    Promise.reject(new Error('Clipboard API unavailable'));

  copy
    .catch(() => {
      // Legacy fallback for non-secure contexts
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      Object.assign(ta.style, { position: 'absolute', left: '-9999px' });
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } finally {
        ta.remove();
      }
    })
    .finally(() => {
      btn.dataset.copied = 'true';
      btn.setAttribute('aria-label', 'Copied to clipboard');

      // Auto-hide linked toast popover after 1.5s
      const toastId = btn.getAttribute('popovertarget');
      if (toastId) {
        setTimeout(() => {
          document.getElementById(toastId)?.hidePopover?.();
        }, 1500);
      }

      // Reset button state after 1.5s
      setTimeout(() => {
        delete btn.dataset.copied;
        btn.setAttribute('aria-label', 'Copy to clipboard');
      }, 1500);
    });
});
