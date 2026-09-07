import Example from "@/components/Example";
import Card from "@/components/Card";
import Seal from "@/components/Seal";

export default function PricingExample() {
  return (
    <>
      <h1>Pricing</h1>
      <Example>
        <Example.Preview style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "16px" }}>
          <Card title="Free">All tokens. All components. $0 forever.</Card>
          <Card title="Also free" bodyAs="none" style={{ borderColor: "var(--ai)" }}>
            <p>Same thing, with an indigo edge.</p>
            <div style={{ marginTop: "12px" }}><Seal>Best fit</Seal></div>
          </Card>
          <Card title="Still free">It&apos;s a stylesheet. We couldn&apos;t charge if we tried.</Card>
        </Example.Preview>
      </Example>
    </>
  );
}
