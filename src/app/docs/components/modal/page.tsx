import ComponentDoc from "../_registry/ComponentDoc";
import { modalEntry } from "../_entries/modal";

// The page is data: the template lives in _registry/ComponentDoc, the
// content in _entries/modal. Adding a component = adding an entry.
export default function ModalDocsPage() {
  return <ComponentDoc entry={modalEntry} />;
}
