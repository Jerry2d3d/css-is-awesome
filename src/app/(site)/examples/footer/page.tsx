import Example from "@/components/Example";
import LogoMark from "@/components/LogoMark";

export default function FooterExample() {
  return (
    <>
      <h1>Footer</h1>
      <Example>
        <Example.Preview style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--ink-soft)", fontSize: "14px", fontFamily: "var(--font-serif)" }}>
            <LogoMark />
            &copy; 2026 CSS is Awesome
          </div>
          <nav style={{ display: "flex", gap: "16px", fontFamily: "var(--font-serif)", fontSize: "14px" }}>
            <a href="#">Docs</a><a href="#">Examples</a><a href="#">GitHub</a>
          </nav>
        </Example.Preview>
      </Example>
    </>
  );
}
