import Example from "@/components/Example";
import Button from "@/components/Button";

export default function FormExample() {
  return (
    <>
      <h1>Form</h1>
      <Example>
        <Example.Preview>
          {/* `marginInline: auto` is not decoration. A form capped at 380px
              inside a ~680px preview box otherwise sits hard against the left
              edge with half the box empty beside it, which reads as a broken
              width rather than a deliberate measure. The dropdown example
              already pairs its cap with an auto margin; this one did not.
              The 380px cap itself stays: fields much wider than this are
              harder to scan, and that is the point the example teaches. */}
          <form style={{ display: "grid", gap: "14px", maxWidth: "380px", marginInline: "auto" }}>
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
