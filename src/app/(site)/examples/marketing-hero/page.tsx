import Example from "@/components/Example";
import Button from "@/components/Button";

export default function MarketingHeroExample() {
  return (
    <>
      <h1>Marketing hero</h1>
      <Example>
        <Example.Preview style={{ textAlign: "center", padding: "56px 24px" }}>
          <div style={{ fontFamily: "var(--font-script)", fontSize: "1.5rem", color: "var(--ink-soft)", marginBottom: "6px" }}>a new way to ship</div>
          <h2 style={{ margin: "0 0 8px", border: 0, padding: 0, fontSize: "2.6rem", fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>Ship honest interfaces.</h2>
          <p style={{ color: "var(--ink-soft)", margin: "0 0 22px", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>A system that fits on one page and never lies about its limits.</p>
          <Button variant="primary">Get started</Button>
          <Button variant="ghost">Read docs</Button>
        </Example.Preview>
      </Example>
    </>
  );
}
