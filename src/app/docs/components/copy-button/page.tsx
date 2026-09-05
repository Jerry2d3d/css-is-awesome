import ComponentDoc from "../_registry/ComponentDoc";
import { copyButtonEntry } from "../_entries/copy-button";

// The page is data: the template lives in _registry/ComponentDoc, the
// content in _entries/copy-button. Adding a component = adding an entry.
export default function CopyButtonDocsPage() {
  return <ComponentDoc entry={copyButtonEntry} />;
}
