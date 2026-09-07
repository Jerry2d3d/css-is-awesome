import Example from "@/components/Example";
import Button from "@/components/Button";

export default function FormExample() {
  return (
    <>
      <h1>Form</h1>
      <Example>
        <Example.Preview>
          <form style={{ display: "grid", gap: "14px", maxWidth: "380px" }}>
            <label style={{ fontFamily: "var(--font-serif)", fontSize: "0.95rem", color: "var(--ink)", fontStyle: "italic" }}>
              Email
              <input type="email" placeholder="you@example.com"
                style={{ display: "block", width: "100%", marginTop: "6px" }} />
            </label>
            <label style={{ fontFamily: "var(--font-serif)", fontSize: "0.95rem", color: "var(--ink)", fontStyle: "italic" }}>
              Message
              <textarea rows={3} placeholder="Tell us about CSS."
                style={{ display: "block", width: "100%", marginTop: "6px", resize: "vertical" }}></textarea>
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <Button variant="primary">Send</Button>
              <Button variant="ghost">Cancel</Button>
            </div>
          </form>
        </Example.Preview>
      </Example>
    </>
  );
}
