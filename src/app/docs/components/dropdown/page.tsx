import ComponentDoc from "../_registry/ComponentDoc";
import { dropdownEntry } from "../_entries/dropdown";

// The page is data: the template lives in _registry/ComponentDoc, the
// content in _entries/dropdown. Adding a component = adding an entry.
export default function DropdownDocsPage() {
  return <ComponentDoc entry={dropdownEntry} />;
}
