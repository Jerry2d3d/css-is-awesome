"use client";
import { useRef } from "react";
import styles from "./demo.module.scss";

export default function AppShellDemo() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <div className={styles.shell}>
      <header className={styles.navbar}>
        <a className={styles.brand} href="#app-shell-demo">
          Acme
        </a>
        <nav>
          <ul className={styles.navList}>
            <li>
              <a className={styles.navLink} href="#app-shell-demo" aria-current="page">
                Dashboard
              </a>
            </li>
            <li>
              <a className={styles.navLink} href="#app-shell-demo">
                Reports
              </a>
            </li>
            <li>
              <a className={styles.navLink} href="#app-shell-demo">
                Team
              </a>
            </li>
          </ul>
        </nav>
      </header>

      <div className={styles.panel} id="app-shell-demo">
        <aside data-slot="side">
          <nav aria-label="Section">
            <ul className={styles.sideNav}>
              <li>
                <a href="#app-shell-demo" aria-current="page">
                  Overview
                </a>
              </li>
              <li>
                <a href="#app-shell-demo">Billing</a>
              </li>
              <li>
                <a href="#app-shell-demo">Members</a>
              </li>
            </ul>
          </nav>
        </aside>

        <main data-slot="content">
          <div className={styles.toolbar}>
            <h2>Overview</h2>
            <span data-slot="trailing">
              <button type="button" className={styles.settingsBtn} onClick={() => dialogRef.current?.showModal()}>
                Settings
              </button>
            </span>
          </div>
          <p>The main work area — whatever the page actually does goes here.</p>
        </main>
      </div>

      <footer className={styles.footer}>
        <span>&copy; 2026 Acme Inc.</span>
        <nav>
          <a href="#app-shell-demo">Docs</a>
          <a href="#app-shell-demo">Support</a>
          <a href="#app-shell-demo">Status</a>
        </nav>
      </footer>

      <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="app-shell-settings-title">
        <header>
          <h2 id="app-shell-settings-title">Settings</h2>
          <button type="button" className={styles.dialogClose} aria-label="Close" onClick={() => dialogRef.current?.close()}>
            &times;
          </button>
        </header>
        <p>This is the exact dialog recipe, opened from the toolbar above.</p>
        <footer>
          <button type="button" className={styles.dialogCancel} onClick={() => dialogRef.current?.close()}>
            Cancel
          </button>
          <button type="button" className={styles.dialogConfirm} autoFocus onClick={() => dialogRef.current?.close()}>
            Save
          </button>
        </footer>
      </dialog>
    </div>
  );
}
