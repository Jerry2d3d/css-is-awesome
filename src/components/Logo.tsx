import type { CSSProperties } from "react";

export type LogoProps = {
  size?: string;
  caption?: string;
  stage?: boolean;
};

export default function Logo({ size, caption = "overflow intentional", stage = true }: LogoProps) {
  const logoStyle = size ? ({ ["--logo-size" as string]: size } as CSSProperties) : undefined;

  const inner = (
    <div className="logo" aria-label="CSS is Awesome" style={logoStyle}>
      <span>CSS</span>
      <span>IS</span>
      <span className="overflow">AWESOME</span>
    </div>
  );

  if (!stage) return inner;

  return (
    <div className="logo-stage">
      {inner}
      {caption && (
        <span className="logo-stage__caption" aria-hidden="true">{caption}</span>
      )}
    </div>
  );
}
