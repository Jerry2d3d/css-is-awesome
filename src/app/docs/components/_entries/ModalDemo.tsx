"use client";

import { useRef } from "react";
import demos from "../_registry/demos.module.scss";

// Client island for the modal demo ONLY. Native <dialog> needs one line of
// consumer JavaScript — dialog.showModal() — and that line has to run on the
// client, so this tiny island carries it. Everything after the call (Escape,
// focus trap, inert background, ::backdrop) is native browser behavior; the
// dialog itself is the real cia.modal mixin output (demos.modal).
export default function ModalDemo() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        className={demos.dropdownTrigger}
        onClick={() => dialogRef.current?.showModal()}
      >
        Open modal
      </button>
      <dialog
        ref={dialogRef}
        className={demos.modal}
        aria-labelledby="doc-demo-modal-title"
      >
        <h2 id="doc-demo-modal-title">Confirm action</h2>
        <p>Are you sure?</p>
        <form method="dialog">
          <button value="cancel" className={demos.dropdownTrigger}>
            Cancel
          </button>
          <button value="confirm" className={demos.dropdownTrigger}>
            Delete
          </button>
        </form>
      </dialog>
    </>
  );
}
