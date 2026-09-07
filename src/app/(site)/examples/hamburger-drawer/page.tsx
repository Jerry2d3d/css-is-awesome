import styles from "../page.module.scss";
import Example from "@/components/Example";

export default function HamburgerDrawerExample() {
  return (
    <>
      <h1>Hamburger + drawer</h1>
      <p>
        Three bars, zero JS: the browser sets <code>aria-expanded</code> on the popover
        invoker and the bars morph into an X off that attribute. The drawer is honest too —
        it slides over the real end edge of your viewport, exactly as shipped.
      </p>
      <Example>
        <Example.Preview style={{ textAlign: "center" }}>
          <button type="button" className={styles.hamburger} popoverTarget="examples-drawer" aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
          <nav id="examples-drawer" popover="auto" className={styles.drawer} aria-label="Site menu">
            <div>
              <a href="#" aria-current="page">Home</a>
              <a href="#">Docs</a>
              <a href="#">Examples</a>
              <a href="#">GitHub</a>
            </div>
          </nav>
        </Example.Preview>
      </Example>
    </>
  );
}
