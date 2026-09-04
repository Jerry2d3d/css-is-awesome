// Painter's palette — the theme icon (Jerry's artwork; keep the geometry).
// Outline follows text color; the three paint dots read theme tokens.
// var() is CSS-only (not valid in SVG attributes), so the fills live in
// style. --ochre is Sketchbook marginalia and absent from most themes'
// contracts — it falls back to a generic ochre rather than black.
export default function PaletteIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 3.5a8.5 8.5 0 1 0 0 17c1.5 0 1.9-.9 1.4-1.9-.6-1.2-.2-2.6
           1.4-2.6h2.1a3.6 3.6 0 0 0 3.6-3.7C20.3 7 16.6 3.5 12 3.5z"
      />
      <circle cx="8" cy="9" r="1.25" stroke="none" style={{ fill: "var(--ai, #3a5fcd)" }} />
      <circle cx="12.6" cy="7.3" r="1.25" stroke="none" style={{ fill: "var(--shu, #c1272d)" }} />
      <circle cx="16.4" cy="10" r="1.25" stroke="none" style={{ fill: "var(--ochre, #c98a2d)" }} />
    </svg>
  );
}
