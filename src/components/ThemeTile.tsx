"use client";
import "./ThemeTile.scss";

import Button from "@/components/Button";

export type ThemeTileProps = {
  id: string;
  name: string;
  description: string;
  href: string;
  swatches: {
    paper: string;
    ink: string;
    accent: string;
    seal?: string;
  };
};

export default function ThemeTile({
  id,
  name,
  description,
  href,
  swatches,
}: ThemeTileProps) {
  function applyTheme() {
    const link = document.getElementById(
      "cia-theme-link"
    ) as HTMLLinkElement | null;
    if (link) link.href = href;
    localStorage.setItem("cia-theme-file", id);
  }

  return (
    <article className="theme-tile">
      <div className="theme-tile__swatches" aria-hidden="true">
        <span
          className="theme-tile__swatch"
          style={{ background: swatches.paper }}
        />
        <span
          className="theme-tile__swatch"
          style={{ background: swatches.ink }}
        />
        <span
          className="theme-tile__swatch"
          style={{ background: swatches.accent }}
        />
        {swatches.seal ? (
          <span
            className="theme-tile__swatch"
            style={{ background: swatches.seal }}
          />
        ) : null}
      </div>
      <h3 className="theme-tile__title">{name}</h3>
      <p className="theme-tile__description">{description}</p>
      <div className="theme-tile__actions">
        <Button variant="primary" onClick={applyTheme}>
          Preview
        </Button>
        <a className="btn btn--ghost" href={href} download>
          Download
        </a>
      </div>
    </article>
  );
}
