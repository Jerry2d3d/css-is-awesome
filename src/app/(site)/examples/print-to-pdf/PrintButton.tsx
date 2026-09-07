"use client";
// The ONLY JavaScript on this page — one line. Ctrl+P / File → Print
// reach the same @media print layer with no button at all; this is just
// a discoverable shortcut.
export default function PrintButton() {
  return (
    <button type="button" className="cia-btn-print" onClick={() => window.print()}>
      Print / Save as PDF
    </button>
  );
}
