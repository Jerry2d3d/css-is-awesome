import styles from "../page.module.scss";
import Example from "@/components/Example";

export default function DropdownExample() {
  return (
    <>
      <h1>Dropdown</h1>
      <p>
        The house dropdown: the trigger fills its column, label left, affordance right; the
        menu opens one pixel under it at the trigger&apos;s exact width via CSS anchor
        positioning, flipping above when the bottom of the screen is close. Engines without
        anchors fall back to viewport-minus-gutters.
      </p>
      <Example>
        <Example.Preview>
          <div style={{ maxWidth: "320px", margin: "0 auto" }}>
            <button type="button" className={styles.menuTrigger} popoverTarget="examples-menu">
              Overview <span aria-hidden="true">▾</span>
            </button>
            <div id="examples-menu" popover="auto" className={styles.menu}>
              <a href="#" aria-current="page">Overview</a>
              <a href="#">Projects</a>
              <a href="#">Team</a>
              <a href="#">Settings</a>
            </div>
          </div>
        </Example.Preview>
      </Example>
    </>
  );
}
