import type { CSSProperties, ReactNode } from "react";

export type ExampleProps = {
  children: ReactNode;
};

function Example({ children }: ExampleProps) {
  return <div className="example">{children}</div>;
}

function Preview({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div className="example__preview" style={style}>
      {children}
    </div>
  );
}

function Code({ children }: { children: ReactNode }) {
  return <pre className="example__code">{children}</pre>;
}

Example.Preview = Preview;
Example.Code = Code;

export default Example;
